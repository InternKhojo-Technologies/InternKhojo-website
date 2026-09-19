/**
 * Shared TypeScript definitions for the /hire module.
 *
 * MongoDB holds the question bank. Supabase holds attempts (+ embedded
 * `submissions` JSONB) and profile display data. Answers + solutions must
 * NEVER reach the client except inside an authenticated review payload.
 *
 * Single-table architecture: `hire_daily_attempts` is the ONLY hire table.
 * Per-question answers live in `submissions` JSONB, NOT in a separate table.
 */

/** Raw MongoDB question document. */
export interface HireMongoQuestion {
  _id: string;
  question: string;
  options: string[];
  correct_answer: string;
  solution: string;
  difficulty_level?: string;
  // Display metadata aliases (vary per collection — see docMeta()).
  tech_subject?: string;
  category_label?: string;
  dsa_topic?: string;
  sub_topic?: string;
  topic_sublabel?: string;
  target_fields?: string[];
  target_exams?: string[];
}

/** Client-safe question: answers + solutions stripped. */
export interface HireSafeQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty_level?: string;
  /** e.g. "Operating Systems" / "Verbal Ability" (from the question bank). */
  subject?: string;
  /** e.g. "UNIX Operating System" / "Selecting Words". */
  subtopic?: string;
  /** Where this question helps: ["Placements", "Bank Exams"]. */
  targets?: string[];
}

export interface HireAnswerInput {
  mongo_question_id: string;
  selected_answer: string;
}

/** Single item in a completed review payload (includes answers). */
export interface HireReviewItem {
  mongo_question_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  selected_answer: string | null;
  is_correct: boolean;
  solution: string;
  difficulty_level?: string;
  subject?: string;
  subtopic?: string;
  targets?: string[];
}

/**
 * Single embedded answer inside `hire_daily_attempts.submissions` (JSONB).
 * Spec shape: [{ mongo_id, selected_answer, is_correct }].
 * `selected_answer` is "" when the question was left unanswered.
 */
export interface HireSubmissionItem {
  mongo_id: string;
  selected_answer: string;
  is_correct: boolean;
}

export interface HireAttempt {
  id: string;
  user_id: string;
  category: string;
  attempt_date: string;
  total_score: number;
  total_time_ms: number;
  is_completed: boolean;
  submissions: HireSubmissionItem[];
  created_at?: string;
}

/**
 * Parse the raw `submissions` JSONB value from Supabase into a safe array.
 * Tolerates null / non-array / malformed entries (returns [] entries dropped).
 */
export function parseSubmissionItems(value: unknown): HireSubmissionItem[] {
  if (!Array.isArray(value)) return [];
  const out: HireSubmissionItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const rec = entry as Record<string, unknown>;
    // Accept both the canonical `mongo_id` and the legacy `mongo_question_id`.
    const rawId = rec.mongo_id ?? rec.mongo_question_id;
    if (typeof rawId !== "string" || rawId.trim() === "") continue;
    out.push({
      mongo_id: rawId.trim(),
      selected_answer: typeof rec.selected_answer === "string" ? rec.selected_answer : "",
      is_correct: rec.is_correct === true,
    });
  }
  return out;
}

export interface HireAttemptReview {
  attempt: HireAttempt;
  items: HireReviewItem[];
}

export interface HireUserStats {
  totalAttempts: number;
  completedAttempts: number;
  totalScore: number;
  bestScore: number;
  avgTimeMs: number;
  currentStreakDays: number;
  perCategory: Record<
    string,
    { attempts: number; totalScore: number; bestScore: number; avgTimeMs: number }
  >;
  recentAttempts: HireAttempt[];
}

export interface HireLeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_score: number;
  total_time_ms: number;
  attempts?: number;
}

export type HireLeaderboardScope = "daily" | "overall";

export type HireRole = "candidate" | "recruiter" | string;

/** Format milliseconds as mm:ss for timers. */
export function formatMsClock(ms: number): string {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/** Format milliseconds as a compact human string (e.g. 1m 23s). */
export function formatMsCompact(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m}m` : `${m}m ${rest}s`;
}

/** YYYY-MM-DD in UTC — must match the server's attempt_date convention. */
export function todayDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
