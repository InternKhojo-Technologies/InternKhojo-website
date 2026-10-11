import { createHash } from "crypto";
import type { Collection, Document } from "mongodb";
import { HIRE_QUESTIONS_PER_TEST } from "@/lib/hire-categories";

// Shared deterministic daily-set logic. The same (category, date) ALWAYS
// yields the same ordered question ids, which lets both the questions route
// (today's set) and the attempt route (rebuilding any past date's set to
// backfill skipped questions in review) agree without storing the set.

/** FNV-1a 32-bit hash — tiny, dependency-free, stable across runtimes. */
function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** sha256 → uint32 when available (same determinism), FNV-1a otherwise. */
export function dailySeed(category: string, date: string): number {
  try {
    const digest = createHash("sha256").update(`${category}:${date}`, "utf8").digest();
    return digest.readUInt32BE(0) >>> 0;
  } catch {
    return hashSeed(`${category}:${date}`);
  }
}

/** Seeded PRNG (mulberry32) — same seed always yields the same sequence. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher–Yates shuffle using the seeded PRNG. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Ordered ids of the daily set for a category+date: stable `_id`-sorted id
 * list (immune to mixed ObjectId/string _ids), seeded shuffle, first N.
 * Returns [] when the bank slice is empty.
 */
export async function getDailySetIds(
  collection: Collection<Document>,
  filter: Record<string, unknown>,
  category: string,
  date: string,
  count: number = HIRE_QUESTIONS_PER_TEST
): Promise<string[]> {
  const idDocs = await collection.find(filter, { projection: { _id: 1 } }).toArray();
  const allIds = idDocs
    .map((d) => String(d._id))
    .filter(Boolean)
    .sort();
  const uniqueIds = Array.from(new Set(allIds));
  if (uniqueIds.length === 0) return [];
  return seededShuffle(uniqueIds, dailySeed(category, date)).slice(
    0,
    Math.min(count, uniqueIds.length)
  );
}
