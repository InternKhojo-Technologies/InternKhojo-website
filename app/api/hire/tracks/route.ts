import { NextResponse, type NextRequest } from "next/server";
import { HIRE_CATEGORIES, HIRE_QUESTIONS_PER_TEST, categoryMongoFilter } from "@/lib/hire-categories";
import { getQuestionsCollection, questionsMongoStatus } from "@/lib/mongo-questions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory cache: bank counts only change when questions are added, so
// serving a 60s-stale snapshot keeps the landing + leaderboard + test boot
// fast instead of running 6 Mongo counts on every single page view.
const TRACKS_TTL_MS = 60_000;
let tracksCache: { at: number; payload: unknown } | null = null;

export interface HireTrackAvailability {
  slug: string;
  title: string;
  short: string;
  collection: string;
  count: number;
  /** True when the bank holds a full daily set (>= HIRE_QUESTIONS_PER_TEST). */
  available: boolean;
}

/**
 * GET /api/hire/tracks
 * Per-track question-bank availability for the six hire categories.
 * PUBLIC — no login needed. It only exposes question counts per track
 * (no user data), so logged-out visitors can preview the topic list.
 * A track is `available` only when its MongoDB collection holds a full
 * daily set — the UI disables anything still being populated instead of
 * sending users into an empty test.
 */
export async function GET(request: NextRequest) {
  void request;

  const mongoStatus = questionsMongoStatus();
  if (!mongoStatus.configured) {
    return NextResponse.json(
      { error: mongoStatus.reason ?? "Questions database is not configured." },
      { status: 503 }
    );
  }

  if (tracksCache && Date.now() - tracksCache.at < TRACKS_TTL_MS) {
    return NextResponse.json(tracksCache.payload);
  }

  const tracks: HireTrackAvailability[] = await Promise.all(
    HIRE_CATEGORIES.map(async (cat) => {
      let count = 0;
      try {
        const collection = await getQuestionsCollection(cat.collection);
        const filter = categoryMongoFilter(cat.slug);
        // Shared banks (aptitude_questions holds Quant+Logical+Verbal) are
        // counted per labelled slice; lone collections use the fast estimate.
        count =
          Object.keys(filter).length > 0
            ? await collection.countDocuments(filter)
            : await collection.estimatedDocumentCount();
        if (!Number.isFinite(count) || count < 0) count = 0;
      } catch (err) {
        console.warn(`[hire/tracks] count failed for "${cat.collection}":`, err);
        count = 0;
      }
      return {
        slug: cat.slug,
        title: cat.title,
        short: cat.short,
        collection: cat.collection,
        count,
        available: count >= HIRE_QUESTIONS_PER_TEST,
      };
    })
  );

  const payload = { tracks, per_test: HIRE_QUESTIONS_PER_TEST };
  tracksCache = { at: Date.now(), payload };
  return NextResponse.json(payload);
}
