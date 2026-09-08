// Tiny stale-while-revalidate cache for client-fetched public lists.
// Purpose: make back-navigation instant (render cached rows immediately)
// while a background refetch keeps data fresh. In-memory only — no
// persistence, no auth/user data, cleared on full reload.

interface CacheEntry {
  data: unknown;
  ts: number;
}

const mem = new Map<string, CacheEntry>();

export function getCached<T>(key: string, maxAgeMs: number): T | null {
  try {
    const entry = mem.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > maxAgeMs) {
      mem.delete(key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export function setCached(key: string, data: unknown): void {
  try {
    mem.set(key, { data, ts: Date.now() });
  } catch {
    // Never break the UI on cache failures.
  }
}

/**
 * Cached value or the fallback when missing/expired. The fallback drives
 * type inference so call sites need no explicit type arguments.
 */
export function getCachedOr<T>(key: string, maxAgeMs: number, fallback: T): T {
  const hit = getCached<T>(key, maxAgeMs);
  return hit === null ? fallback : hit;
}
