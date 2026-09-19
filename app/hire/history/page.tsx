"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { HIRE_CATEGORIES, HIRE_SECTIONS } from "@/lib/hire-categories";
import { formatMsCompact, type HireAttempt } from "@/lib/hire-types";
import { ArrowLeft, ChevronRight, History, RotateCcw } from "lucide-react";

function prettyDate(iso: string) {
  try {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return iso;
  }
}

function titleFor(slug: string) {
  return HIRE_CATEGORIES.find((c) => c.slug === slug)?.title ?? slug;
}

export default function HireHistoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<HireAttempt[]>([]);
  const [perTest, setPerTest] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionP = supabase.auth.getSession();
      const userP = supabase.auth.getUser();
      const headersP = sessionP.then(({ data }) => {
        const token = data.session?.access_token ?? "";
        return (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit;
      });
      const statsP = headersP.then(async (headers) => {
        const res = await fetch("/api/hire/stats?limit=200", { headers });
        if (res.status === 401) throw new Error("__AUTH__");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Could not load your tries.");
        return json;
      });
      const tracksP = headersP.then(async (headers) => {
        try {
          const res = await fetch("/api/hire/tracks", { headers });
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      });

      const [{ data: userData }, statsJson, tracksJson] = await Promise.all([
        userP,
        statsP,
        tracksP,
      ]);
      if (!userData.user) {
        router.push("/login?redirect=/hire/history");
        return;
      }
      setAttempts((statsJson.stats?.recentAttempts ?? []) as HireAttempt[]);
      if (Number.isFinite(Number(tracksJson?.per_test))) {
        setPerTest(Math.max(1, Math.round(Number(tracksJson.per_test))));
      }
    } catch (e) {
      if (e instanceof Error && e.message === "__AUTH__") {
        router.push("/login?redirect=/hire/history");
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  const grouped = useMemo(() => {
    return HIRE_SECTIONS.map((sec) => ({
      ...sec,
      rows: attempts.filter((a) => sec.slugs.includes(a.category)),
    })).filter((g) => g.rows.length > 0);
  }, [attempts]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased pb-28">
      <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5">
        <Link
          href="/hire"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft size={14} /> Practice tests
        </Link>

        <div>
          <h1 className="font-display-hire text-[28px] sm:text-[34px] font-extrabold tracking-tight leading-none">
            Past tries
          </h1>
          <p className="mt-2 text-[13px] text-neutral-500">
            {loading
              ? "Loading your history…"
              : attempts.length === 0
                ? "Every test you finish will show up here."
                : `${attempts.length} finished test${attempts.length === 1 ? "" : "s"} · tap one to see its answers`}
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <p className="text-[13px] font-medium text-red-800">{error}</p>
            <button
              onClick={load}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              <RotateCcw size={12} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="h-4 w-1/3 rounded bg-neutral-100" />
                <div className="mt-3 space-y-2">
                  <div className="h-12 rounded-xl bg-neutral-100" />
                  <div className="h-12 rounded-xl bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : attempts.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
            <History size={22} className="mx-auto text-neutral-300" />
            <p className="font-display-hire mt-4 text-lg font-bold tracking-tight">
              No tries yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-neutral-500">
              Pick a topic and finish your first test — it will be saved here
              with all its answers.
            </p>
            <Link
              href="/hire"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              Browse topics
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((group, gi) => (
              <motion.section
                key={group.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: gi * 0.06 }}
                className="space-y-2.5"
              >
                <h2 className="font-display-hire text-[15px] font-extrabold tracking-tight">
                  {group.title}
                  <span className="ml-2 text-xs font-semibold tabular-nums text-neutral-400">
                    {group.rows.length}
                  </span>
                </h2>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  {group.rows.map((a) => (
                    <Link
                      key={a.id}
                      href={`/hire/${a.category}/daily?review=${a.id}`}
                      className="group flex items-center justify-between gap-4 px-4 sm:px-5 py-4 transition-colors hover:bg-neutral-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {titleFor(a.category)}
                          <span className="ml-2 font-normal text-neutral-400">
                            {prettyDate(a.attempt_date)}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs tabular-nums text-neutral-500">
                          Finished in {formatMsCompact(a.total_time_ms)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <span className="rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-bold tabular-nums text-white">
                          {a.total_score}/{perTest}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-900"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
