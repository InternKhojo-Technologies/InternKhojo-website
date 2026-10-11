/**
 * DSA helpers for the /hire module.
 *
 * The DSA bank lives in the same MongoDB database as the other hire banks
 * (`Master_Question_Bank`) and is served as a regular hire track:
 *   Hire category slug: `dsa` (collection `dsa_questions`, no slice filter —
 *   the daily set is a deterministic MIXED slice, like every other track).
 *
 * Document shape:
 *   _id, question (HTML or plain text with code), options,
 *   correct_answer, solution (HTML | null), dsa_topic,
 *   language (string | null — "C"/"C++" for snippet questions),
 *   difficulty_level ("Easy" | "Medium" | "Hard", stored as EASY/MEDIUM/HARD).
 *
 * Rendering (see lib/dsa-format.ts): question / options / solution must go
 * through the DSA formatter before `dangerouslySetInnerHTML` — it converts
 * `[tex]` math markers to unicode, cleans scrape artifacts and wraps
 * plain-text code in styled blocks.
 */

export const DSA_CATEGORY_SLUG = "dsa";
export const DSA_COLLECTION = "dsa_questions";

/** Allowed question counts for the DSA practice mode. */
export const DSA_PRACTICE_COUNTS = [5, 10, 15, 20] as const;
export type DsaPracticeCount = (typeof DSA_PRACTICE_COUNTS)[number];

/** Seconds allowed per question when practice mode is timed. */
export const DSA_PRACTICE_SECONDS_PER_QUESTION = 90;

export type DsaDifficulty = "Easy" | "Medium" | "Hard";

export interface DsaTopicCount {
  topic: string;
  count: number;
}

/**
 * Canonical topic list used as filter fallbacks when the bank is empty or
 * unreachable. Live counts come from GET /api/hire/dsa/topics (distinct
 * `dsa_topic` values in the collection).
 */
export const DSA_KNOWN_TOPICS: string[] = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Trees",
  "Graphs",
  "Hashing",
  "Recursion",
  "Dynamic Programming",
  "Sorting",
  "Searching",
  "Heap",
  "Greedy",
  "Backtracking",
  "Bit Manipulation",
  "Other",
];

function cleanLabel(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim().replace(/\s+/g, " ");
  return t === "" ? undefined : t;
}

/** True for the DSA leaderboard track (gets rich-HTML rendering). */
export function isDsaCategory(slug: string | null | undefined): boolean {
  return slug === DSA_CATEGORY_SLUG;
}

/** Normalize a practice `count` param. Returns null when invalid. */
export function normalizeDsaCount(input: unknown): DsaPracticeCount | null {
  const n = Math.floor(Number(input));
  if (!Number.isFinite(n)) return null;
  if ((DSA_PRACTICE_COUNTS as readonly number[]).includes(n)) {
    return n as DsaPracticeCount;
  }
  return null;
}

/** Normalize a `topic` param. Returns null when missing/"all". */
export function normalizeDsaTopic(input: unknown): string | null {
  const c = cleanLabel(input);
  if (!c || c.length > 64) return null;
  if (c.toLowerCase() === "all") return null;
  return c;
}

/** "MEDIUM" -> "Medium", "easy" -> "Easy". */
export function prettyDsaDifficulty(value: unknown): string | undefined {
  const c = cleanLabel(value);
  if (!c) return undefined;
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

/** Normalize `difficulty` to Easy|Medium|Hard (case-insensitive). */
export function normalizeDsaDifficulty(input: unknown): DsaDifficulty | null {
  const c = cleanLabel(input);
  if (!c) return null;
  const lower = c.toLowerCase();
  if (lower === "easy") return "Easy";
  if (lower === "medium") return "Medium";
  if (lower === "hard") return "Hard";
  return null;
}

/** Normalize `language` (e.g. "c", "c++"). "theory" selects null-language docs. */
export function normalizeDsaLanguage(input: unknown): string | null {
  const c = cleanLabel(input);
  if (!c || c.length > 32) return null;
  if (c.toLowerCase() === "all") return null;
  return c;
}

/** Coerce `language` to a display string or null (theory questions). */
export function dsaLanguageOrNull(value: unknown): string | null {
  const c = cleanLabel(value);
  return c ?? null;
}

/** Coerce `dsa_topic` with an "Other" fallback. */
export function dsaTopicOrFallback(value: unknown): string {
  return cleanLabel(value) ?? "Other";
}

/**
 * MongoDB filter for the DSA bank.
 * - topic:      exact match on `dsa_topic`
 * - difficulty: exact match on `difficulty_level` (case-insensitive)
 * - language:   exact match on `language` (case-insensitive); the special
 *               value "theory" matches docs where language is null/missing.
 */
export function dsaMongoFilter(opts: {
  topic?: string | null;
  difficulty?: DsaDifficulty | null;
  language?: string | null;
}): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (opts.topic) filter.dsa_topic = opts.topic;
  if (opts.difficulty) {
    filter.difficulty_level = {
      $regex: `^${opts.difficulty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    };
  }
  if (opts.language) {
    if (opts.language.toLowerCase() === "theory") {
      filter.$or = [{ language: null }, { language: "" }, { language: { $exists: false } }];
    } else {
      filter.language = {
        $regex: `^${opts.language.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }
  }
  return filter;
}
