import { NextResponse, type NextRequest } from "next/server";
import { requireHireAuth } from "@/lib/supabase-server";
import {
  getQuestionsCollection,
  questionsMongoStatus,
  solutionToString,
  toObjectIdOrNull,
  docMeta,
  prettyDifficulty,
} from "@/lib/mongo-questions";
import {
  DSA_COLLECTION,
  dsaLanguageOrNull,
  dsaMongoFilter,
  dsaTopicOrFallback,
  normalizeDsaCount,
  normalizeDsaDifficulty,
  normalizeDsaTopic,
  type DsaPracticeCount,
} from "@/lib/dsa";
import type { HireReviewItem, HireSafeQuestion } from "@/lib/hire-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function languageOf(d: Record<string, unknown>): string | null {
  return typeof d.language === "string" && d.language.trim() !== ""
    ? d.language.trim()
    : null;
}

/**
 * GET /api/hire/dsa/practice?count=10&topic=Arrays&difficulty=Easy
 * Random (non-deterministic) practice set from the DSA bank. Unlike the
 * leaderboard daily set, every call reshuffles — "New set" always gives fresh
 * questions. Client-safe: correct_answer + solution are never serialized.
 * Auth required (protects the bank); recruiters ARE allowed — practice never
 * touches the leaderboard, streaks or coins.
 */
export async function GET(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = request.nextUrl.searchParams;
  const count: DsaPracticeCount = normalizeDsaCount(params.get("count")) ?? 10;
  const topic = normalizeDsaTopic(params.get("topic"));
  const difficulty = normalizeDsaDifficulty(params.get("difficulty"));
  const filter = dsaMongoFilter({ topic, difficulty });

  const mongoStatus = questionsMongoStatus();
  if (!mongoStatus.configured) {
    return NextResponse.json(
      { error: mongoStatus.reason ?? "Questions database is not configured." },
      { status: 503 }
    );
  }

  try {
    const collection = await getQuestionsCollection(DSA_COLLECTION);
    const docs = await collection
      .aggregate([{ $match: filter }, { $sample: { size: count } }])
      .toArray();

    const questions: HireSafeQuestion[] = [];
    for (const raw of docs) {
      const d = raw as Record<string, unknown>;
      const question = typeof d.question === "string" ? d.question : "";
      const options = Array.isArray(d.options)
        ? d.options.filter((o): o is string => typeof o === "string")
        : [];
      if (!question || options.length < 2) continue;
      const meta = docMeta(d);
      questions.push({
        id: String((d._id as { toString(): string }).toString()),
        question,
        options,
        difficulty_level: prettyDifficulty(d.difficulty_level),
        subject: meta.subject ?? dsaTopicOrFallback(d.dsa_topic),
        subtopic: meta.subtopic,
        targets: meta.targets,
        language: dsaLanguageOrNull(d.language),
      });
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No DSA questions match those filters yet — try All topics or another difficulty.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      mode: "practice",
      filters: { count, topic, difficulty },
      questions,
      count: questions.length,
    });
  } catch (err) {
    console.error("[hire/dsa/practice] GET failed:", err);
    return NextResponse.json(
      { error: "Could not load a practice set right now. Please retry." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hire/dsa/practice
 * Body: { answers: Record<mongoId, selected> }
 * Stateless grading for DSA practice — verifies against `correct_answer` and
 * returns review items with solutions. Writes NOTHING to Supabase: no
 * attempt row, no leaderboard, no streak, no coins. Auth required.
 */
export async function POST(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = body as { answers?: unknown };
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
  if (ids.length === 0 || ids.length > 20) {
    return NextResponse.json(
      { error: "Submit between 1 and 20 answers." },
      { status: 400 }
    );
  }

  const mongoStatus = questionsMongoStatus();
  if (!mongoStatus.configured) {
    return NextResponse.json(
      { error: mongoStatus.reason ?? "Questions database is not configured." },
      { status: 503 }
    );
  }

  try {
    const collection = await getQuestionsCollection(DSA_COLLECTION);
    const objectIds = ids
      .map(toObjectIdOrNull)
      .filter((o): o is NonNullable<typeof o> => o !== null);
    const truth = new Map<
      string,
      {
        correct: string;
        question: string;
        options: string[];
        solution: string;
        difficulty?: string;
        subject?: string;
        language: string | null;
      }
    >();
    const hydrate = (d: Record<string, unknown>) => {
      const meta = docMeta(d);
      return {
        correct: typeof d.correct_answer === "string" ? d.correct_answer : "",
        question: typeof d.question === "string" ? d.question : "",
        options: Array.isArray(d.options)
          ? d.options.filter((o): o is string => typeof o === "string")
          : [],
        solution: solutionToString(d.solution),
        difficulty: prettyDifficulty(d.difficulty_level),
        subject: meta.subject ?? dsaTopicOrFallback(d.dsa_topic),
        language: languageOf(d),
      };
    };

    if (objectIds.length > 0) {
      const docs = await collection.find({ _id: { $in: objectIds } }).toArray();
      for (const d of docs) truth.set(String(d._id), hydrate(d as Record<string, unknown>));
    }
    const missing = ids.filter((id) => !truth.has(id));
    if (missing.length > 0) {
      try {
        const docs = await collection.find({ _id: { $in: missing } } as never).toArray();
        for (const d of docs) truth.set(String(d._id), hydrate(d as Record<string, unknown>));
      } catch {
        // best-effort fallback for string _ids
      }
    }
    if (ids.some((id) => !truth.has(id))) {
      return NextResponse.json(
        { error: "Some submitted questions could not be verified. Please start a new set and retry." },
        { status: 400 }
      );
    }

    let totalScore = 0;
    const items: HireReviewItem[] = ids.map((id) => {
      const t = truth.get(id)!;
      const selected = answerMap[id] ?? "";
      const correct = selected !== "" && answersEqual(selected, t.correct);
      if (correct) totalScore += 1;
      return {
        mongo_question_id: id,
        question: t.question,
        options: t.options,
        correct_answer: t.correct,
        selected_answer: selected === "" ? null : selected,
        is_correct: correct,
        solution: t.solution,
        difficulty_level: t.difficulty,
        subject: t.subject,
        language: t.language,
      };
    });

    return NextResponse.json({ total_score: totalScore, total: items.length, items });
  } catch (err) {
    console.error("[hire/dsa/practice] POST failed:", err);
    return NextResponse.json(
      { error: "Could not check your answers. Please retry." },
      { status: 500 }
    );
  }
}
