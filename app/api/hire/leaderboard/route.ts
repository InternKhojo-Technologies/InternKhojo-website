import { NextResponse, type NextRequest } from "next/server";
import { requireHireAuth } from "@/lib/supabase-server";
import { normalizeCategory } from "@/lib/hire-categories";
import { todayDateString, type HireLeaderboardEntry } from "@/lib/hire-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AttemptRow {
  user_id: string;
  total_score: number;
  total_time_ms: number;
}

interface ProfileRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

/**
 * GET /api/hire/leaderboard?category=aptitude&scope=daily|overall
 * - daily:   filter category + CURRENT_DATE, rank score DESC, time ASC.
 * - overall: group by user_id for the category, SUM(score), AVG(time).
 * Recruiters get full read access; candidates must be authenticated.
 */
export async function GET(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase } = auth.auth;

  const rawCategory = request.nextUrl.searchParams.get("category") ?? "";
  const category = normalizeCategory(rawCategory);
  if (!category) {
    return NextResponse.json({ error: "Invalid or missing category." }, { status: 400 });
  }
  const scopeParam = (request.nextUrl.searchParams.get("scope") ?? "daily").toLowerCase();
  const scope = scopeParam === "overall" ? "overall" : "daily";
  const attemptDate = todayDateString();

  try {
    let rows: AttemptRow[] = [];

    if (scope === "daily") {
      const { data, error } = await supabase
        .from("hire_daily_attempts")
        .select("user_id, total_score, total_time_ms")
        .eq("category", category)
        .eq("attempt_date", attemptDate)
        .eq("is_completed", true)
        .order("total_score", { ascending: false })
        .order("total_time_ms", { ascending: true })
        .limit(50);
      if (error) throw error;
      rows = ((data ?? []) as AttemptRow[]).map((r) => ({
        user_id: r.user_id,
        total_score: Number(r.total_score ?? 0),
        total_time_ms: Number(r.total_time_ms ?? 0),
      }));
    } else {
      const { data, error } = await supabase
        .from("hire_daily_attempts")
        .select("user_id, total_score, total_time_ms")
        .eq("category", category)
        .eq("is_completed", true)
        .limit(300);
      if (error) throw error;
      const agg = new Map<string, { score: number; time: number; n: number }>();
      for (const r of (data ?? []) as AttemptRow[]) {
        const cur = agg.get(r.user_id) ?? { score: 0, time: 0, n: 0 };
        cur.score += Number(r.total_score ?? 0);
        cur.time += Number(r.total_time_ms ?? 0);
        cur.n += 1;
        agg.set(r.user_id, cur);
      }
      rows = Array.from(agg.entries())
        .map(([user_id, v]) => ({
          user_id,
          total_score: v.score,
          total_time_ms: v.n === 0 ? 0 : Math.round(v.time / v.n),
          attempts: v.n,
        }))
        .sort((a, b) => b.total_score - a.total_score || a.total_time_ms - b.total_time_ms)
        .slice(0, 50);
    }

    const attemptsByUser = new Map<string, number>();
    if (scope === "overall") {
      for (const r of rows as Array<AttemptRow & { attempts?: number }>) {
        if (typeof r.attempts === "number") attemptsByUser.set(r.user_id, r.attempts);
      }
    }

    const userIds = Array.from(new Set(rows.map((r) => r.user_id))).filter(Boolean);
    const profiles = new Map<string, ProfileRow>();
    if (userIds.length > 0) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);
      if (profileError) {
        console.warn("[hire/leaderboard] profiles lookup failed:", profileError);
      } else {
        for (const p of (profileRows ?? []) as ProfileRow[]) {
          profiles.set(p.id, p);
        }
      }
    }

    const entries: HireLeaderboardEntry[] = rows.map((r, i) => {
      const p = profiles.get(r.user_id);
      return {
        rank: i + 1,
        user_id: r.user_id,
        name: p?.name?.trim() || "Anonymous",
        avatar_url: p?.avatar_url ?? null,
        total_score: r.total_score,
        total_time_ms: r.total_time_ms,
        attempts: attemptsByUser.get(r.user_id),
      };
    });

    return NextResponse.json({
      category,
      scope,
      attempt_date: attemptDate,
      entries,
      total: entries.length,
    });
  } catch (err) {
    console.error("[hire/leaderboard] failed:", err);
    return NextResponse.json(
      { error: "Could not load the leaderboard right now. Please retry." },
      { status: 500 }
    );
  }
}
