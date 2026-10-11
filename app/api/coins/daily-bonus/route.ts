import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { HIRE_CATEGORIES } from "@/lib/hire-categories";
import { todayDateString } from "@/lib/hire-types";
import {
  COINS_DAILY_PARTICIPATION,
  COIN_SOURCE_DAILY_PARTICIPATION,
  DAILY_RANK_PARTICIPATION_THRESHOLD,
  dailyBonusForRank,
  entryDayUTC,
  parseCoinHistory,
} from "@/lib/coins";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 300;

interface AttemptRow {
  user_id: string;
  total_score: number;
  total_time_ms: number;
}

interface CategoryResult {
  category: string;
  participants: number;
  mode: "participation" | "ranked" | "empty" | "error";
  credited: number;
  skipped_already_paid: number;
  skipped_non_candidate: number;
  error?: string;
}

function env(name: string): string | null {
  const v = process.env[name]?.trim() ?? "";
  return v === "" ? null : v;
}

function serviceClient(): SupabaseClient | null {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isAuthorized(request: NextRequest): boolean {
  const secret = env("CRON_SECRET");
  // No secret configured → refuse (fail closed) rather than exposing payouts.
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

function validDateParam(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T00:00:00Z`);
  if (!Number.isFinite(d.getTime())) return null;
  return t;
}

/**
 * GET /api/coins/daily-bonus[?date=YYYY-MM-DD]
 * POST /api/coins/daily-bonus (same; manual trigger / backfill)
 *
 * Midnight cron — end-of-day daily ranking rewards. MUST run before the
 * UTC date rolls over (Vercel cron: 55 23 * * *).
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel sends this
 * automatically when CRON_SECRET is set). No secret → 403/503, fail closed.
 *
 * Per hire category, using ONLY that day's completed attempts (never
 * all-time boards):
 * - distinct candidate participants <= 12 → flat +3.00 participation pay each,
 *   no rank bonuses;
 * - otherwise → non-cumulative rank bonuses (25 / 22 / 20 / 15 / 10).
 * Non-candidate roles are excluded via the profiles table.
 * Idempotent: a user already holding the same source label dated today is
 * skipped, so re-runs never double-pay.
 */
export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!env("CRON_SECRET")) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured. Set it in the environment first." },
      { status: 503 }
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const db = serviceClient();
  if (!db) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured. Cron payouts need the service role to credit wallets." },
      { status: 503 }
    );
  }

  const rawDate = request.nextUrl.searchParams.get("date");
  const targetDate = validDateParam(rawDate) ?? todayDateString();
  if (rawDate && !validDateParam(rawDate)) {
    return NextResponse.json(
      { error: "Invalid ?date=. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }
  if (targetDate > todayDateString()) {
    return NextResponse.json(
      { error: "Cannot pay bonuses for a future date." },
      { status: 400 }
    );
  }

  const results: CategoryResult[] = [];
  for (const cat of HIRE_CATEGORIES) {
    try {
      results.push(await payCategory(db, cat.slug, targetDate));
    } catch (err) {
      console.error(`[coins/daily-bonus] category "${cat.slug}" failed:`, err);
      results.push({
        category: cat.slug,
        participants: 0,
        mode: "error",
        credited: 0,
        skipped_already_paid: 0,
        skipped_non_candidate: 0,
        error: err instanceof Error ? err.message : "Unknown error.",
      });
    }
  }

  const credited = results.reduce((s, r) => s + r.credited, 0);
  return NextResponse.json({ date: targetDate, credited_total: credited, results });
}

async function payCategory(
  db: SupabaseClient,
  category: string,
  targetDate: string
): Promise<CategoryResult> {
  const base: CategoryResult = {
    category,
    participants: 0,
    mode: "empty",
    credited: 0,
    skipped_already_paid: 0,
    skipped_non_candidate: 0,
  };

  // 1) Today's completed attempts for this category (the DAILY board only).
  const { data: attempts, error: attemptsError } = await db
    .from("hire_daily_attempts")
    .select("user_id, total_score, total_time_ms")
    .eq("category", category)
    .eq("attempt_date", targetDate)
    .eq("is_completed", true)
    .order("total_score", { ascending: false })
    .order("total_time_ms", { ascending: true })
    .limit(1000);
  if (attemptsError) throw attemptsError;
  const rows = ((attempts ?? []) as AttemptRow[]).filter((r) => r.user_id);

  // 2) Dedupe (one row per user wins by construction, but stay safe) and
  //    keep CANDIDATES ONLY via the profiles table.
  const seen = new Set<string>();
  const orderedIds: AttemptRow[] = [];
  for (const r of rows) {
    if (seen.has(r.user_id)) continue;
    seen.add(r.user_id);
    orderedIds.push(r);
  }
  if (orderedIds.length === 0) return base;

  const candidateIds = await candidateOnlyIds(
    db,
    orderedIds.map((r) => r.user_id)
  );
  const ranked = orderedIds.filter((r) => candidateIds.has(r.user_id));
  base.skipped_non_candidate = orderedIds.length - ranked.length;
  base.participants = ranked.length;
  if (ranked.length === 0) return base;

  // 3) Threshold rule → participation flat pay, else ranked bonuses.
  const payouts = new Map<string, { coins: number; source: string }>();
  if (ranked.length <= DAILY_RANK_PARTICIPATION_THRESHOLD) {
    base.mode = "participation";
    for (const r of ranked) {
      payouts.set(r.user_id, {
        coins: COINS_DAILY_PARTICIPATION,
        source: COIN_SOURCE_DAILY_PARTICIPATION,
      });
    }
  } else {
    base.mode = "ranked";
    ranked.forEach((r, i) => {
      const bonus = dailyBonusForRank(i + 1);
      if (bonus) payouts.set(r.user_id, bonus);
    });
  }

  // 4) Credit via RPC, skipping anyone already paid this source today.
  for (const [userId, payout] of payouts) {
    try {
      if (await alreadyPaidToday(db, userId, payout.source, targetDate)) {
        base.skipped_already_paid += 1;
        continue;
      }
      const { error } = await db.rpc("credit_candidate_coins", {
        target_user_id: userId,
        coins_to_add: payout.coins,
        source_label: payout.source,
      });
      if (error) throw error;
      base.credited += 1;
    } catch (err) {
      console.error(`[coins/daily-bonus] credit failed for ${userId}:`, err);
    }
  }
  return base;
}

/** Keep only user ids whose profile role is exactly "candidate". */
async function candidateOnlyIds(
  db: SupabaseClient,
  userIds: string[]
): Promise<Set<string>> {
  const out = new Set<string>();
  const CHUNK = 200;
  for (let i = 0; i < userIds.length; i += CHUNK) {
    const chunk = userIds.slice(i, i + CHUNK);
    const { data, error } = await db.from("profiles").select("id, role").in("id", chunk);
    if (error) throw error;
    for (const p of (data ?? []) as Array<{ id: string; role?: string }>) {
      if (p.role === "candidate") out.add(p.id);
    }
  }
  return out;
}

/** True when the wallet history already holds this source dated targetDate. */
async function alreadyPaidToday(
  db: SupabaseClient,
  userId: string,
  source: string,
  targetDate: string
): Promise<boolean> {
  const { data, error } = await db
    .from("candidate_coin_wallets")
    .select("history")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return false;
  const history = parseCoinHistory((data as { history?: unknown }).history);
  return history.some(
    (e) => e.source === source && entryDayUTC(e.createdAt) === targetDate
  );
}
