/**
 * Coins & Rewards — shared constants and pure helpers.
 *
 * CANDIDATES ONLY. Every payout path must check `isCandidateRole(role)`
 * first: recruiters, hiring managers and admins never earn coins and never
 * see reward views.
 *
 * Money shape: `candidate_coin_wallets.total_coins` is DECIMAL. Always keep
 * two decimals when crediting (1.00 / 1.50 / 3.00 / 10.00 / ...).
 */

/** A user role counts as a coin earner ONLY when it is exactly "candidate". */
export function isCandidateRole(role: unknown): boolean {
  return role === "candidate";
}

// ── Instant quiz rewards (credited in POST /api/hire/submit) ────────────────

export const COINS_PER_QUIZ_ATTEMPT = 1.0;
export const COINS_PER_CORRECT_ANSWER = 1.5;

export const COIN_SOURCE_QUIZ_ATTEMPT = "Quiz Attempt";

export function coinSourceCorrectAnswers(correctCount: number): string {
  return `Correct Answers (${correctCount} correct)`;
}

// ── Daily ranking rewards (credited by the midnight cron) ───────────────────

/** Pool at or below this size gets flat participation pay, no rank bonuses. */
export const DAILY_RANK_PARTICIPATION_THRESHOLD = 12;

export const COIN_SOURCE_DAILY_PARTICIPATION =
  "Daily participation reward (pool under 12 candidates)";

export const COIN_SOURCE_RANK_1 = "Rank 1 Daily Bonus";
export const COIN_SOURCE_RANK_2 = "Rank 2 Daily Bonus";
export const COIN_SOURCE_RANK_3 = "Rank 3 Daily Bonus";
export const COIN_SOURCE_TOP_5 = "Top 5 Daily Bonus";
export const COIN_SOURCE_TOP_10 = "Top 10 Daily Bonus";

export const COINS_DAILY_PARTICIPATION = 3.0;
export const COINS_RANK_1 = 25.0;
export const COINS_RANK_2 = 22.0;
export const COINS_RANK_3 = 20.0;
export const COINS_TOP_5 = 15.0;
export const COINS_TOP_10 = 10.0;

export interface DailyBonus {
  coins: number;
  source: string;
}

/**
 * Non-cumulative bonus for a 1-based daily rank. Returns null outside the
 * paid bands (rank > 10 earns nothing extra).
 */
export function dailyBonusForRank(rank: number): DailyBonus | null {
  if (!Number.isInteger(rank) || rank < 1) return null;
  if (rank === 1) return { coins: COINS_RANK_1, source: COIN_SOURCE_RANK_1 };
  if (rank === 2) return { coins: COINS_RANK_2, source: COIN_SOURCE_RANK_2 };
  if (rank === 3) return { coins: COINS_RANK_3, source: COIN_SOURCE_RANK_3 };
  if (rank <= 5) return { coins: COINS_TOP_5, source: COIN_SOURCE_TOP_5 };
  if (rank <= 10) return { coins: COINS_TOP_10, source: COIN_SOURCE_TOP_10 };
  return null;
}

/**
 * Totalling helper for a quiz submit: +1 attempt coin plus +1.50 per correct
 * answer. Correct count of 0 yields just the attempt coin.
 */
export function quizCoinTotal(correctCount: number): {
  attempt: number;
  correct: number;
  total: number;
} {
  const safe = Math.max(0, Math.floor(Number(correctCount) || 0));
  const correct = Math.round(safe * COINS_PER_CORRECT_ANSWER * 100) / 100;
  const total =
    Math.round((COINS_PER_QUIZ_ATTEMPT + correct) * 100) / 100;
  return { attempt: COINS_PER_QUIZ_ATTEMPT, correct, total };
}

// ── Wallet + history shapes ─────────────────────────────────────────────────

export interface CoinHistoryEntry {
  /** Coins credited by this entry (always > 0). */
  coins: number;
  /** Human reason, e.g. "Quiz Attempt" / "Rank 1 Daily Bonus". */
  source: string;
  /** ISO timestamp of the credit. Falls back to "" when unknown. */
  createdAt: string;
}

export interface CandidateWallet {
  totalCoins: number;
  history: CoinHistoryEntry[];
}

function num(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return n;
}

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t === "" ? null : t;
}

/**
 * Parse one raw history JSONB element. The RPC owns the entry shape, so
 * every plausible key alias is accepted and anything unusable is dropped
 * (returns null) instead of breaking the whole log.
 */
export function parseCoinHistoryEntry(raw: unknown): CoinHistoryEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const coins =
    num(r.coins) ?? num(r.amount) ?? num(r.coins_credited) ?? num(r.value);
  if (coins === null || coins <= 0) return null;
  const source =
    str(r.source) ?? str(r.label) ?? str(r.reason) ?? str(r.description);
  if (!source) return null;
  const createdAt =
    str(r.created_at) ?? str(r.timestamp) ?? str(r.date) ?? str(r.time) ?? "";
  return {
    coins: Math.round(coins * 100) / 100,
    source,
    createdAt,
  };
}

/** Parse the wallet `history` JSONB column (array, newest first). */
export function parseCoinHistory(value: unknown): CoinHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const out: CoinHistoryEntry[] = [];
  for (const raw of value) {
    const e = parseCoinHistoryEntry(raw);
    if (e) out.push(e);
  }
  out.sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return out;
}

/** Parse a wallet row ({ total_coins, history }) into safe UI data. */
export function parseCandidateWallet(row: unknown): CandidateWallet {
  if (!row || typeof row !== "object") return { totalCoins: 0, history: [] };
  const r = row as Record<string, unknown>;
  const total = num(r.total_coins) ?? 0;
  return {
    totalCoins: Math.round(Math.max(0, total) * 100) / 100,
    history: parseCoinHistory(r.history),
  };
}

/** "2026-09-22" (UTC) for an entry timestamp — used for cron idempotency. */
export function entryDayUTC(iso: string): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
}

/** Display "+25.00" style amount. */
export function formatCoins(n: number): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "+0.00";
  return `+${v.toFixed(2)}`;
}
