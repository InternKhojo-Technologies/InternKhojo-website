import { NextResponse } from "next/server";
import { getQuestionsCollection, questionsMongoStatus } from "@/lib/mongo-questions";
import { DSA_COLLECTION, DSA_KNOWN_TOPICS } from "@/lib/dsa";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory cache: topic counts only change when the bank is edited, so a
// 60s snapshot keeps the DSA practice filters fast.
const TOPICS_TTL_MS = 60_000;
let topicsCache: { at: number; payload: unknown } | null = null;

/**
 * GET /api/hire/dsa/topics
 * Public — aggregate counts per `dsa_topic` (+ total) for the DSA practice
 * filters. Exposes no question text or answers.
 */
export async function GET() {
  const mongoStatus = questionsMongoStatus();
  if (!mongoStatus.configured) {
    return NextResponse.json(
      { error: mongoStatus.reason ?? "Questions database is not configured." },
      { status: 503 }
    );
  }

  if (topicsCache && Date.now() - topicsCache.at < TOPICS_TTL_MS) {
    return NextResponse.json(topicsCache.payload);
  }

  try {
    const collection = await getQuestionsCollection(DSA_COLLECTION);
    const [topicAgg, total] = await Promise.all([
      collection
        .aggregate([
          { $group: { _id: { $ifNull: ["$dsa_topic", "Other"] }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      collection.estimatedDocumentCount(),
    ]);

    const topics = (
      topicAgg as Array<{ _id?: unknown; count?: unknown }>
    )
      .map((r) => ({
        topic: typeof r._id === "string" && r._id.trim() !== "" ? r._id.trim() : "Other",
        count: typeof r.count === "number" ? r.count : 0,
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);

    // Well-known topics always appear (count 0 when absent) so the practice
    // filter list is stable while the bank is being populated.
    const seen = new Set(topics.map((t) => t.topic.toLowerCase()));
    for (const known of DSA_KNOWN_TOPICS) {
      if (!seen.has(known.toLowerCase())) topics.push({ topic: known, count: 0 });
    }

    const payload = {
      topics,
      total: typeof total === "number" ? total : 0,
    };
    topicsCache = { at: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[hire/dsa/topics] failed:", err);
    return NextResponse.json(
      { error: "Could not load DSA topics right now. Please retry in a moment." },
      { status: 500 }
    );
  }
}
