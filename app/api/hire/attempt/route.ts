import { ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { requireHireAuth } from "@/lib/supabase-server";
import { normalizeCategory, categoryToCollection, categoryMongoFilter } from "@/lib/hire-categories";
import { getDailySetIds } from "@/lib/hire-daily-set";
import {
  getQuestionsCollection,
  questionsMongoStatus,
  solutionToString,
  toObjectIdOrNull,
  docMeta,
  prettyDifficulty,
  type HireDocMeta,
} from "@/lib/mongo-questions";
import {
  parseSubmissionItems,
  type HireAttempt,
  type HireReviewItem,
  type HireSubmissionItem,
} from "@/lib/hire-types";
import { todayDateString } from "@/lib/hire-types";

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
  submissions: unknown;
  created_at?: string;
}

const ATTEMPT_COLUMNS =
  "id, user_id, category, attempt_date, total_score, total_time_ms, is_completed, submissions, created_at";

/**
 * GET /api/hire/attempt?category=aptitude[&attempt_id=...]
 * Daily check: if the caller already finished today's attempt for this
 * category, return the full review (questions + correct answers + solutions).
 * Otherwise return { completed: false }.
 * Past-attempt preview: pass attempt_id to load any of the caller's own
 * completed attempts (matched to MongoDB for questions + explanations).
 *
 * Single-table architecture: the `submissions` JSONB array
 * ([{ mongo_id, selected_answer, is_correct }]) is read directly from
 * `hire_daily_attempts` — no second table.
 */
export async function GET(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { user, supabase } = auth.auth;

  const rawCategory = request.nextUrl.searchParams.get("category") ?? "";
  const category = normalizeCategory(rawCategory);
  if (!category) {
    return NextResponse.json({ error: "Invalid or missing category." }, { status: 400 });
  }
  const attemptIdParam = request.nextUrl.searchParams.get("attempt_id")?.trim() || null;

  const attemptDate = todayDateString();

  try {
    if (attemptIdParam) {
      const { data: attemptById, error: byIdError } = await supabase
        .from("hire_daily_attempts")
        .select(ATTEMPT_COLUMNS)
        .eq("id", attemptIdParam)
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .maybeSingle();
      if (byIdError) throw byIdError;
      if (!attemptById) {
        return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
      }
      const row = attemptById as AttemptRow;
      const subs = parseSubmissionItems(row.submissions);
      const items = await buildReviewItems(row.category, subs, row.attempt_date);
      return NextResponse.json({
        completed: true,
        attempt_date: row.attempt_date,
        category: row.category,
        attempt: toAttempt(row),
        items,
      });
    }

    const { data: attempt, error: attemptError } = await supabase
      .from("hire_daily_attempts")
      .select(ATTEMPT_COLUMNS)
      .eq("user_id", user.id)
      .eq("category", category)
      .eq("attempt_date", attemptDate)
      .eq("is_completed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attemptError) throw attemptError;
    if (!attempt) {
      return NextResponse.json({ completed: false, attempt_date: attemptDate, category });
    }

    const attemptRow = attempt as AttemptRow;
    const subs = parseSubmissionItems(attemptRow.submissions);
    const items = await buildReviewItems(category, subs, attemptRow.attempt_date);

    return NextResponse.json({
      completed: true,
      attempt_date: attemptDate,
      category,
      attempt: toAttempt(attemptRow),
      items,
    });
  } catch (err: unknown) {
    console.error("[hire/attempt] failed:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Could not load today's attempt.";
    if (message.includes("hire_daily_attempts") || message.includes("does not exist") || (err as { code?: string })?.code === "42P01") {
      return NextResponse.json(
        { error: "Scoring tables are not set up yet (hire_daily_attempts missing). Ask an admin to run the Supabase migration." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Could not load today's attempt. Please retry." }, { status: 500 });
  }
}

function toAttempt(r: AttemptRow): HireAttempt {
  return {
    id: r.id,
    user_id: r.user_id,
    category: r.category,
    attempt_date: r.attempt_date,
    total_score: r.total_score ?? 0,
    total_time_ms: r.total_time_ms ?? 0,
    is_completed: true,
    submissions: parseSubmissionItems(r.submissions),
    created_at: r.created_at,
  };
}

async function buildReviewItems(
  category: string,
  subs: HireSubmissionItem[],
  attemptDate: string
): Promise<HireReviewItem[]> {
  // NOTE: no early return when `subs` is empty. Fully-skipped submits
  // (older clients stored zero entries, pre-JSONB rows backfill to `[]`)
  // still rebuild the day's deterministic set below, so review always shows
  // the FULL set with correct answers + solutions and "Not attempted" badges.
  const mongoStatus = questionsMongoStatus();
  if (!mongoStatus.configured) return [];

  // Spec: fetch full question documents via $in over ObjectIds.
  const mongoIds = subs.map((s) => s.mongo_id).filter(Boolean);
  const objectIds: ObjectId[] = mongoIds
    .map((id) => toObjectIdOrNull(id))
    .filter((o): o is NonNullable<typeof o> => o !== null);

  const collection = await getQuestionsCollection(categoryToCollection(category));
  const byId = new Map<string, { question: string; options: string[]; correct_answer: string; solution: string; difficulty_level?: string; subject?: string; subtopic?: string; targets: string[]; language: string | null }>();

  const hydrate = (d: Record<string, unknown>) => {
    const meta: HireDocMeta = docMeta(d);
    return {
      question: typeof d.question === "string" ? d.question : "",
      options: Array.isArray(d.options) ? d.options.filter((o): o is string => typeof o === "string") : [],
      correct_answer: typeof d.correct_answer === "string" ? d.correct_answer : "",
      solution: solutionToString(d.solution),
      difficulty_level: prettyDifficulty(d.difficulty_level),
      subject: meta.subject,
      subtopic: meta.subtopic,
      targets: meta.targets,
      language:
        typeof d.language === "string" && d.language.trim() !== ""
          ? d.language.trim()
          : null,
    };
  };

  if (objectIds.length > 0) {
    const docs = await collection.find({ _id: { $in: objectIds } }).toArray();
    for (const d of docs) {
      byId.set(String(d._id), hydrate(d as Record<string, unknown>));
    }
  }
  // Fallback: some seeds store _id as a plain string.
  const missing = mongoIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    try {
      const docs = await collection.find({ _id: { $in: missing } } as never).toArray();
      for (const d of docs) {
        byId.set(String(d._id), hydrate(d as Record<string, unknown>));
      }
    } catch {
      // best-effort only
    }
  }

  // Merge stored answer status with the hydrated question data.
  // Skipped questions were never stored in older attempts, so the day's
  // deterministic set is rebuilt (same computation as the questions route)
  // and anything missing is appended as not-attempted — review always shows
  // the FULL set with correct answers + solutions either way.
  const subById = new Map(subs.map((s) => [s.mongo_id, s]));
  let setOrder: string[] = [];
  try {
    setOrder = await getDailySetIds(
      collection,
      categoryMongoFilter(category),
      category,
      attemptDate
    );
    const unhydrated = setOrder.filter((id) => !byId.has(id));
    if (unhydrated.length > 0) {
      const objectIds = unhydrated
        .map((id) => toObjectIdOrNull(id))
        .filter((o): o is NonNullable<typeof o> => o !== null);
      if (objectIds.length > 0) {
        const docs = await collection.find({ _id: { $in: objectIds } }).toArray();
        for (const d of docs) {
          byId.set(String(d._id), hydrate(d as Record<string, unknown>));
        }
      }
      const stillMissing = unhydrated.filter((id) => !byId.has(id));
      if (stillMissing.length > 0) {
        try {
          const docs = await collection.find({ _id: { $in: stillMissing } } as never).toArray();
          for (const d of docs) {
            byId.set(String(d._id), hydrate(d as Record<string, unknown>));
          }
        } catch {
          // best-effort only
        }
      }
    }
  } catch {
    // Bank unreachable for the rebuild — fall back to stored order below.
    setOrder = [];
  }

  const toItem = (mongoId: string): HireReviewItem => {
    const doc = byId.get(mongoId);
    const s = subById.get(mongoId);
    const selected = s && s.selected_answer !== "" ? s.selected_answer : null;
    return {
      mongo_question_id: mongoId,
      question: doc?.question ?? "(Question text unavailable — it may have been removed.)",
      options: doc?.options ?? [],
      correct_answer: doc?.correct_answer ?? "",
      selected_answer: selected,
      is_correct: s?.is_correct === true,
      solution: doc?.solution ?? "",
      difficulty_level: doc?.difficulty_level,
      subject: doc?.subject,
      subtopic: doc?.subtopic,
      targets: doc?.targets ?? [],
      language: doc?.language ?? null,
    };
  };

  if (setOrder.length === 0) {
    // Fallback: submission order (old behaviour).
    return subs.map((s) => toItem(s.mongo_id));
  }
  const ordered = setOrder.map(toItem);
  // Anything stored but no longer in the day's set (bank changed since)
  // is appended after, so nothing the user answered ever disappears.
  const setIds = new Set(setOrder);
  for (const s of subs) {
    if (!setIds.has(s.mongo_id)) ordered.push(toItem(s.mongo_id));
  }
  return ordered;
}
