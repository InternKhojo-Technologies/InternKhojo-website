import { NextResponse, type NextRequest } from "next/server";
import { requireHireAuth } from "@/lib/supabase-server";
import { normalizeCategory, categoryToCollection } from "@/lib/hire-categories";
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
  todayDateString,
  type HireAttempt,
  type HireReviewItem,
  type HireSubmissionItem,
} from "@/lib/hire-types";
import {
  COINS_PER_QUIZ_ATTEMPT,
  COIN_SOURCE_QUIZ_ATTEMPT,
  coinSourceCorrectAnswers,
  isCandidateRole,
  quizCoinTotal,
} from "@/lib/coins";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_QUESTIONS = 20;
const MAX_TIME_MS = 3 * 60 * 60 * 1000; // 3h sanity cap

type AnswerMap = Record<string, string>;

function normalizeAnswer(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function answersEqual(selected: string, correct: string): boolean {
  const a = selected.trim();
  const b = correct.trim();
  if (a === b) return true;
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * POST /api/hire/submit
 * Body: { category, answers: Record<mongoId, selected> | Array<{mongo_id|mongo_question_id, selected_answer}>, total_time_ms }
 *
 * Single-table architecture: verifies answers server-side against MongoDB's
 * `correct_answer`, builds the `submissions` JSONB array
 * ([{ mongo_id, selected_answer, is_correct }]) and performs a SINGLE INSERT
 * into `hire_daily_attempts` with total_score, total_time_ms, submissions
 * and is_completed=true. Returns the evaluated review payload to the client.
 *
 * Coins & Rewards (candidates ONLY): after the attempt is saved, credits
 * +1.00 "Quiz Attempt" and +1.50 per correct answer via the
 * `credit_candidate_coins` RPC. Best-effort — a coin failure never fails the
 * submit. Recruiters / non-candidate roles earn nothing.
 */
export async function POST(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.auth.role === "recruiter") {
    return NextResponse.json(
      { error: "Recruiters have view-only access and cannot submit tests." },
      { status: 403 }
    );
  }
  const { user, supabase } = auth.auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = body as {
    category?: unknown;
    answers?: unknown;
    total_time_ms?: unknown;
  };

  const category = normalizeCategory(b.category);
  if (!category) {
    return NextResponse.json({ error: "Invalid or missing category." }, { status: 400 });
  }

  const answerMap: AnswerMap = {};
  if (Array.isArray(b.answers)) {
    for (const a of b.answers as Array<{
      mongo_id?: unknown;
      mongo_question_id?: unknown;
      selected_answer?: unknown;
    }>) {
      const rawId =
        typeof a?.mongo_id === "string"
          ? a.mongo_id
          : typeof a?.mongo_question_id === "string"
            ? a.mongo_question_id
            : null;
      if (!rawId || !rawId.trim()) continue;
      const sel = normalizeAnswer(a.selected_answer);
      answerMap[rawId.trim()] = sel ?? "";
    }
  } else if (b.answers && typeof b.answers === "object") {
    for (const [k, v] of Object.entries(b.answers as Record<string, unknown>)) {
      const sel = normalizeAnswer(v);
      if (k.trim()) answerMap[k.trim()] = sel ?? "";
    }
  }
  const ids = Object.keys(answerMap);
  if (ids.length === 0 || ids.length > MAX_QUESTIONS) {
    return NextResponse.json(
      { error: `Submit between 1 and ${MAX_QUESTIONS} answers.` },
      { status: 400 }
    );
  }

  let totalTimeMs = Math.round(Number(b.total_time_ms));
  if (!Number.isFinite(totalTimeMs) || totalTimeMs < 0) totalTimeMs = 0;
  totalTimeMs = Math.min(totalTimeMs, MAX_TIME_MS);

  const mongoStatus = questionsMongoStatus();
  if (!mongoStatus.configured) {
    return NextResponse.json(
      { error: mongoStatus.reason ?? "Questions database is not configured." },
      { status: 503 }
    );
  }

  const attemptDate = todayDateString();

  try {
    // Idempotency: one completed attempt per user/category/day.
    const { data: existing, error: existingError } = await supabase
      .from("hire_daily_attempts")
      .select("id, user_id, category, attempt_date, total_score, total_time_ms, is_completed, submissions, created_at")
      .eq("user_id", user.id)
      .eq("category", category)
      .eq("attempt_date", attemptDate)
      .eq("is_completed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json(
        { error: "You have already completed today's test for this category.", alreadyCompleted: true },
        { status: 409 }
      );
    }

    // Load ground truth from MongoDB.
    const collection = await getQuestionsCollection(categoryToCollection(category));
    const objectIds = ids.map(toObjectIdOrNull).filter((o): o is NonNullable<typeof o> => o !== null);
    const truth = new Map<string, { correct: string; question: string; options: string[]; solution: string; difficulty?: string; subject?: string; subtopic?: string; targets: string[] }>();
    const hydrate = (d: Record<string, unknown>) => {
      const meta: HireDocMeta = docMeta(d);
      return {
        correct: typeof d.correct_answer === "string" ? d.correct_answer : "",
        question: typeof d.question === "string" ? d.question : "",
        options: Array.isArray(d.options) ? d.options.filter((o): o is string => typeof o === "string") : [],
        solution: solutionToString(d.solution),
        difficulty: prettyDifficulty(d.difficulty_level),
        subject: meta.subject,
        subtopic: meta.subtopic,
        targets: meta.targets,
      };
    };
    if (objectIds.length > 0) {
      const docs = await collection.find({ _id: { $in: objectIds } }).toArray();
      for (const d of docs) {
        truth.set(String(d._id), hydrate(d as Record<string, unknown>));
      }
    }
    const missing = ids.filter((id) => !truth.has(id));
    if (missing.length > 0) {
      try {
        const docs = await collection.find({ _id: { $in: missing } } as never).toArray();
        for (const d of docs) {
          truth.set(String(d._id), hydrate(d as Record<string, unknown>));
        }
      } catch {
        // best-effort
      }
    }

    const unknownIds = ids.filter((id) => !truth.has(id));
    if (unknownIds.length > 0) {
      return NextResponse.json(
        { error: "Some submitted questions could not be verified. Please reload the test and retry." },
        { status: 400 }
      );
    }

    // Grade + build the submissions JSONB array in one pass.
    let totalScore = 0;
    const graded = ids.map((id) => {
      const t = truth.get(id)!;
      const selected = answerMap[id] ?? "";
      const correct = selected !== "" && answersEqual(selected, t.correct);
      if (correct) totalScore += 1;
      return { id, selected: selected === "" ? null : selected, correct, t };
    });

    const submissions: HireSubmissionItem[] = graded.map((g) => ({
      mongo_id: g.id,
      selected_answer: g.selected ?? "",
      is_correct: g.correct,
    }));

    // SINGLE INSERT — attempt + embedded answers, no second table.
    const { data: attemptRow, error: attemptError } = await supabase
      .from("hire_daily_attempts")
      .insert({
        user_id: user.id,
        category,
        attempt_date: attemptDate,
        total_score: totalScore,
        total_time_ms: totalTimeMs,
        submissions,
        is_completed: true,
      })
      .select("id, user_id, category, attempt_date, total_score, total_time_ms, is_completed, submissions, created_at")
      .single();

    if (attemptError || !attemptRow) {
      // Race: another request completed first.
      const code = (attemptError as { code?: string })?.code ?? "";
      const msg = attemptError?.message ?? "";
      // Structured log: surfaces schema mismatch / null constraint / RLS
      // failures (code, details, hint) in server logs for fast diagnosis.
      console.error("[hire/submit] attempt insert failed:", {
        code,
        message: msg,
        details: (attemptError as { details?: unknown })?.details ?? null,
        hint: (attemptError as { hint?: unknown })?.hint ?? null,
        category,
        attemptDate,
        user_id: user.id,
        totalScore,
      });
      if (msg.toLowerCase().includes("duplicate") || code === "23505") {
        return NextResponse.json(
          { error: "You have already completed today's test for this category.", alreadyCompleted: true },
          { status: 409 }
        );
      }
      if (code === "42P01" || msg.includes("hire_daily_attempts") || msg.includes("does not exist")) {
        return NextResponse.json(
          { error: "Scoring tables are not set up yet (hire_daily_attempts missing). Ask an admin to run the Supabase migration." },
          { status: 503 }
        );
      }
      if (code === "42501" || msg.toLowerCase().includes("row-level security") || msg.toLowerCase().includes("rls")) {
        return NextResponse.json(
          { error: "Submission blocked by database permissions (RLS). Ask an admin to allow candidates to insert their own attempts." },
          { status: 500 }
        );
      }
      if (code === "23502" || msg.toLowerCase().includes("null value")) {
        return NextResponse.json(
          { error: "Submission failed (missing required field). Please retry — your answers are preserved." },
          { status: 500 }
        );
      }
      throw attemptError ?? new Error("Failed to save attempt.");
    }

    const attempt = attemptRow as HireAttempt;

    // ── Coins & Rewards: candidates only, best-effort ──────────────────────
    // Idempotency comes from the UNIQUE (user, category, day) attempt above:
    // a duplicate submit 409s before reaching here, so each test pays once.
    // Direct wallet writes are blocked by RLS — only the RPC may credit.
    let coinsCredited: { attempt: number; correct: number; total: number } | null =
      null;
    if (isCandidateRole(auth.auth.role)) {
      try {
        const plan = quizCoinTotal(totalScore);
        const payouts = [{ coins: COINS_PER_QUIZ_ATTEMPT, source: COIN_SOURCE_QUIZ_ATTEMPT }];
        if (totalScore > 0) {
          payouts.push({ coins: plan.correct, source: coinSourceCorrectAnswers(totalScore) });
        }
        let credited = 0;
        for (const p of payouts) {
          const { error: coinError } = await supabase.rpc("credit_candidate_coins", {
            target_user_id: user.id,
            coins_to_add: p.coins,
            source_label: p.source,
          });
          if (coinError) throw coinError;
          credited = Math.round((credited + p.coins) * 100) / 100;
        }
        coinsCredited = { attempt: plan.attempt, correct: plan.correct, total: credited };
      } catch (err) {
        // Non-blocking: the test is saved; the user just misses this payout
        // (visible in server logs for diagnosis).
        console.error("[hire/submit] coin credit failed (non-blocking):", {
          message: err instanceof Error ? err.message : String(err),
          category,
          attemptDate,
          user_id: user.id,
          totalScore,
        });
        coinsCredited = null;
      }
    }

    const items: HireReviewItem[] = graded.map((g) => ({
      mongo_question_id: g.id,
      question: g.t.question,
      options: g.t.options,
      correct_answer: g.t.correct,
      selected_answer: g.selected,
      is_correct: g.correct,
      solution: g.t.solution,
      difficulty_level: g.t.difficulty,
      subject: g.t.subject,
      subtopic: g.t.subtopic,
      targets: g.t.targets,
    }));

    return NextResponse.json({
      attempt,
      items,
      total_score: totalScore,
      total_time_ms: totalTimeMs,
      coins_credited: coinsCredited,
    });
  } catch (err: unknown) {
    console.error("[hire/submit] failed:", err);
    return NextResponse.json(
      { error: "Could not submit your test. Your answers were not saved — please retry." },
      { status: 500 }
    );
  }
}
