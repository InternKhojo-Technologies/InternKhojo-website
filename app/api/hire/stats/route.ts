import { NextResponse, type NextRequest } from "next/server";
import { requireHireAuth } from "@/lib/supabase-server";
import type { HireAttempt, HireUserStats } from "@/lib/hire-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AttemptRow {
  id: string;
  user_id: string;
  category: string;
  attempt_date: string;
  total_score: number;
  total_time_ms: number;
  is_completed: boolean;
  created_at?: string;
}

/** GET /api/hire/stats — overall stats for the signed-in user. */
export async function GET(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { user, supabase } = auth.auth;

  // `?limit=` controls how many past attempts come back in
  // `recentAttempts` (history page passes a large one). Aggregates always
  // use the full fetched window below.
  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "5");
  const recentLimit = Math.min(
    200,
    Math.max(1, Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 5)
  );

  try {
    const { data, error } = await supabase
      .from("hire_daily_attempts")
      .select("id, user_id, category, attempt_date, total_score, total_time_ms, is_completed, created_at")
      .eq("user_id", user.id)
      .eq("is_completed", true)
      .order("attempt_date", { ascending: false })
      .limit(200);

    if (error) throw error;
    const rows = ((data ?? []) as AttemptRow[]).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      category: r.category,
      attempt_date: r.attempt_date,
      total_score: Number(r.total_score ?? 0),
      total_time_ms: Number(r.total_time_ms ?? 0),
      is_completed: true as const,
      // List view: answers stay embedded in the row; not needed for aggregates.
      submissions: [],
      created_at: r.created_at,
    })) as HireAttempt[];

    const stats = buildStats(rows, recentLimit);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error("[hire/stats] failed:", err);
    const empty: HireUserStats = {
      totalAttempts: 0,
      completedAttempts: 0,
      totalScore: 0,
      bestScore: 0,
      avgTimeMs: 0,
      currentStreakDays: 0,
      perCategory: {},
      recentAttempts: [],
    };
    return NextResponse.json({ stats: empty, warning: "Stats are temporarily unavailable." });
  }
}

function buildStats(rows: HireAttempt[], recentLimit = 5): HireUserStats {
  const completed = rows.filter((r) => r.is_completed);
  const totalAttempts = completed.length;
  const totalScore = completed.reduce((s, r) => s + (r.total_score ?? 0), 0);
  const bestScore = completed.reduce((m, r) => Math.max(m, r.total_score ?? 0), 0);
  const avgTimeMs =
    totalAttempts === 0
      ? 0
      : Math.round(completed.reduce((s, r) => s + (r.total_time_ms ?? 0), 0) / totalAttempts);

  const perCategory: HireUserStats["perCategory"] = {};
  for (const r of completed) {
    const key = r.category;
    if (!perCategory[key]) {
      perCategory[key] = { attempts: 0, totalScore: 0, bestScore: 0, avgTimeMs: 0 };
    }
    const bucket = perCategory[key];
    bucket.attempts += 1;
    bucket.totalScore += r.total_score ?? 0;
    bucket.bestScore = Math.max(bucket.bestScore, r.total_score ?? 0);
  }
  for (const key of Object.keys(perCategory)) {
    const bucket = perCategory[key];
    const catRows = completed.filter((r) => r.category === key);
    bucket.avgTimeMs =
      bucket.attempts === 0
        ? 0
        : Math.round(catRows.reduce((s, r) => s + (r.total_time_ms ?? 0), 0) / bucket.attempts);
  }

  return {
    totalAttempts,
    completedAttempts: totalAttempts,
    totalScore,
    bestScore,
    avgTimeMs,
    currentStreakDays: computeStreak(completed.map((r) => r.attempt_date)),
    perCategory,
    recentAttempts: completed.slice(0, recentLimit),
  };
}

function computeStreak(dates: string[]): number {
  const unique = Array.from(new Set(dates)).sort().reverse();
  if (unique.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const cursor = new Date(`${today}T00:00:00.000Z`);
  // Allow the streak to start yesterday if today has no attempt yet.
  if (unique[0] !== today) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (unique[0] !== cursor.toISOString().slice(0, 10)) return 0;
  }
  let streak = 0;
  for (const d of unique) {
    const expected = cursor.toISOString().slice(0, 10);
    if (d !== expected) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
