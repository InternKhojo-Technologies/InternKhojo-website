import { NextResponse, type NextRequest } from "next/server";
import { requireHireAuth } from "@/lib/supabase-server";
import { normalizeCategory, categoryToCollection, categoryMongoFilter } from "@/lib/hire-categories";
import { getQuestionsCollection, questionsMongoStatus, toObjectIdOrNull, docMeta, prettyDifficulty } from "@/lib/mongo-questions";
import { dailySeed, getDailySetIds } from "@/lib/hire-daily-set";
import { todayDateString, type HireSafeQuestion } from "@/lib/hire-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory cache for the deterministic daily set. The same category+date
// ALWAYS yields the same questions, so caching is exact (never stale) until
// the date rolls over. This skips the full id-scan + shuffle on repeat
// opens — the slowest part of test boot.
const dailySetCache = new Map<string, { date: string; payload: unknown }>();

/**
 * GET /api/hire/questions?category=aptitude
 * Deterministic daily set: every user requesting the same category on the
 * same UTC date (YYYY-MM-DD) receives the EXACT same 10 questions in the
 * same order. No `$sample` — selection is a seeded shuffle over the
 * `_id`-sorted id list, so it is stable across requests and server restarts.
 * Client-safe: correct_answer + solution are never serialized here.
 * Auth required. Recruiters are blocked server-side (view-only).
 */
export async function GET(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.auth.role === "recruiter") {
    return NextResponse.json(
      { error: "Recruiters have view-only access and cannot start daily tests." },
      { status: 403 }
    );
  }

  const rawCategory = request.nextUrl.searchParams.get("category") ?? "";
  const category = normalizeCategory(rawCategory);
  if (!category) {
    return NextResponse.json({ error: "Invalid or missing category." }, { status: 400 });
  }

  const mongoStatus = questionsMongoStatus();
  if (!mongoStatus.configured) {
    return NextResponse.json(
      { error: mongoStatus.reason ?? "Questions database is not configured." },
      { status: 503 }
    );
  }

  const attemptDate = todayDateString();
  const seed = dailySeed(category, attemptDate);

  const cached = dailySetCache.get(category);
  if (cached && cached.date === attemptDate) {
    return NextResponse.json(cached.payload);
  }

  try {
    const collection = await getQuestionsCollection(categoryToCollection(category));
    const sliceFilter = categoryMongoFilter(category);

    // 1) + 2) Deterministic daily set (shared helper — the attempt route
    // reuses the exact same computation to rebuild past sets for review).
    const picked = await getDailySetIds(collection, sliceFilter, category, attemptDate);

    if (picked.length === 0) {
      return NextResponse.json(
        { error: `No questions found for "${category}". The track is being populated — try another category.` },
        { status: 404 }
      );
    }

    // 3) Load the picked docs. Most banks use ObjectId _ids; some seeds
    //    use plain strings — try ObjectId first, fall back to strings.
    const objectIds = picked.map(toObjectIdOrNull).filter((o): o is NonNullable<typeof o> => o !== null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byId = new Map<string, any>();

    if (objectIds.length > 0) {
      const docs = await collection.find({ _id: { $in: objectIds } }).toArray();
      for (const d of docs) byId.set(String(d._id), d);
    }
    const stillMissing = picked.filter((id) => !byId.has(id));
    if (stillMissing.length > 0) {
      try {
        const docs = await collection.find({ _id: { $in: stillMissing } } as never).toArray();
        for (const d of docs) byId.set(String(d._id), d);
      } catch {
        // best-effort fallback only
      }
    }

    // 4) Preserve the deterministic order; strip answers/solutions.
    // Subject / subtopic / target-fields are display metadata, not answers,
    // so they are safe to send with the question.
    const questions: HireSafeQuestion[] = [];
    for (const id of picked) {
      const d = byId.get(id) as
        | { question?: unknown; options?: unknown; difficulty_level?: unknown; language?: unknown }
        | undefined;
      if (!d) continue;
      const question = typeof d.question === "string" ? d.question : "";
      const options = Array.isArray(d.options)
        ? d.options.filter((o): o is string => typeof o === "string")
        : [];
      if (!question || options.length < 2) continue;
      const meta = docMeta(d as Record<string, unknown>);
      questions.push({
        id,
        question,
        options,
        difficulty_level: prettyDifficulty(d.difficulty_level),
        subject: meta.subject,
        subtopic: meta.subtopic,
        targets: meta.targets,
        // DSA bank snippet language (C / C++ …) for the UI badge; other
        // banks have no `language` field so this stays null for them.
        language:
          typeof d.language === "string" && d.language.trim() !== ""
            ? d.language.trim()
            : null,
      });
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: `No questions found for "${category}". The track is being populated — try another category.` },
        { status: 404 }
      );
    }

    // Security: correct_answer + solution are never serialized here.
    const payload = {
      category,
      collection: categoryToCollection(category),
      attempt_date: attemptDate,
      daily_seed: seed,
      questions,
      count: questions.length,
    };
    // Cap cache size; entries self-invalidate on date change.
    if (dailySetCache.size > 32) dailySetCache.clear();
    dailySetCache.set(category, { date: attemptDate, payload });
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[hire/questions] failed:", err);
    return NextResponse.json(
      { error: "Could not load questions right now. Please retry in a moment." },
      { status: 500 }
    );
  }
}
