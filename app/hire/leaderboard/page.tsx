"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { HIRE_CATEGORIES, HIRE_SECTIONS, boardLabel } from "@/lib/hire-categories";
import {
  formatMsCompact,
  type HireLeaderboardEntry,
  type HireLeaderboardScope,
} from "@/lib/hire-types";
import {
  Trophy,
  Clock,
  Zap,
  ArrowLeft,
  RotateCcw,
  CalendarDays,
  Infinity as InfinityIcon,
  Crown,
  Medal,
  ChevronRight,
  Hash,
} from "lucide-react";

function prettyDate(iso: string) {
  try {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return iso;
  }
}

function Avatar({ name, url, size }: { name: string; url: string | null; size: "lg" | "md" | "sm" }) {
  const dims =
    size === "lg" ? "h-16 w-16 text-xl" : size === "md" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        decoding="async"
        className={`${dims} rounded-full object-cover border border-neutral-200 bg-neutral-100`}
      />
    );
  }
  return (
    <div
      className={`${dims} rounded-full bg-neutral-900 flex items-center justify-center font-bold text-white shrink-0`}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function HireLeaderboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<HireLeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("aptitude");
  const [scope, setScope] = useState<HireLeaderboardScope>("daily");
  const [attemptDate, setAttemptDate] = useState<string>("");
  const [role, setRole] = useState<string | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [playable, setPlayable] = useState(true);

  // Board + availability + identity resolve together — one wait, not three.
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
      const boardP = headersP.then(async (headers) => {
        const res = await fetch(
          `/api/hire/leaderboard?category=${encodeURIComponent(category)}&scope=${scope}`,
          { headers }
        );
        if (res.status === 401) throw new Error("__AUTH__");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Could not load the leaderboard.");
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

      const [{ data: userData }, boardJson, tracksJson] = await Promise.all([
        userP,
        boardP,
        tracksP,
      ]);
      if (!userData.user) {
        router.push("/login?redirect=/hire/leaderboard");
        return;
      }
      setMe(userData.user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();
      setRole((profile as { role?: string } | null)?.role ?? "candidate");

      setEntries((boardJson.entries ?? []) as HireLeaderboardEntry[]);
      setAttemptDate(boardJson.attempt_date ?? "");
      const match = ((tracksJson?.tracks ?? []) as Array<{
        slug: string;
        available: boolean;
      }>).find((t) => t.slug === category);
      setPlayable(match ? match.available === true : true);
    } catch (e) {
      if (e instanceof Error && e.message === "__AUTH__") {
        router.push("/login?redirect=/hire/leaderboard");
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [category, scope, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) load();
  }, [mounted, load]);

  if (!mounted) return null;

  const activeMeta = HIRE_CATEGORIES.find((c) => c.slug === category);
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myRank = me ? entries.find((e) => e.user_id === me) : undefined;
  // Display order for a full podium: silver left, gold centre, bronze right.
  const podiumDisplay =
    podium.length === 3 ? [podium[1], podium[0], podium[2]] : podium;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased pb-28">
      <div className="mx-auto max-w-[880px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5">
        {/* header */}
        <div>
          <Link
            href="/hire"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft size={14} /> Practice tests
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display-hire text-[28px] sm:text-[34px] font-extrabold tracking-tight leading-none">
                Leaderboard
              </h1>
              <p className="mt-2 text-[13px] text-neutral-500">
                {scope === "daily" ? (
                  <>
                    Today{attemptDate ? ` · ${prettyDate(attemptDate)}` : ""} ·{" "}
                    {activeMeta?.title ?? category} · highest score wins — same
                    score? the faster person ranks higher
                  </>
                ) : (
                  <>
                    All-time · {activeMeta?.title ?? category} · total of all
                    scores in this topic, faster average time breaks ties
                  </>
                )}
              </p>
            </div>
            {myRank && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Trophy size={13} />
                </span>
                <span>
                  <span className="text-neutral-500">Your rank</span>{" "}
                  <span className="font-display-hire text-base font-bold tabular-nums">
                    #{myRank.rank}
                  </span>{" "}
                  <span className="tabular-nums text-neutral-500">
                    · {myRank.total_score} pts · {formatMsCompact(myRank.total_time_ms)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* controls */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
            {(
              [
                { key: "daily", label: "Today", icon: CalendarDays },
                { key: "overall", label: "All-time", icon: InfinityIcon },
              ] as Array<{ key: HireLeaderboardScope; label: string; icon: typeof Zap }>
            ).map((t) => {
              const Icon = t.icon;
              const active = scope === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setScope(t.key)}
                  className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
          {/* topic filters, grouped so Quant / Logical / Verbal read as Aptitude */}
          <div className="space-y-3">
            {HIRE_SECTIONS.map((sec) => (
              <div key={sec.title} className="flex items-start gap-3">
                <p className="w-24 shrink-0 pt-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                  {sec.title}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sec.slugs.map((slug) => {
                    const active = category === slug;
                    return (
                      <button
                        key={slug}
                        onClick={() => setCategory(slug)}
                        className={`h-9 cursor-pointer rounded-lg border px-3.5 text-[13px] font-semibold transition-colors ${
                          active
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
                        }`}
                      >
                        {boardLabel(slug)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
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
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-pulse">
            <div className="grid grid-cols-3 gap-3 items-end">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2.5 flex flex-col items-center">
                  <div className="h-14 w-14 rounded-full bg-neutral-100" />
                  <div className="h-3 w-20 rounded bg-neutral-100" />
                  <div className={`w-full rounded-t-lg bg-neutral-100 ${i === 1 ? "h-28" : "h-20"}`} />
                </div>
              ))}
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <Medal size={20} />
            </span>
            <p className="font-display-hire mt-4 text-lg font-bold tracking-tight">
              No scores yet in {boardLabel(category)}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-neutral-500">
              {scope === "daily"
                ? "Finish today's test first and take the top spot."
                : "All-time ranks show up once people finish tests in this topic."}
            </p>
            {role !== "recruiter" && playable && (
              <Link
                href={`/hire/${category}/daily`}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
              >
                <Zap size={14} /> Start today&apos;s test
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* ── Podium stage ─────────────────────────────── */}
            <section
              aria-label="Top three"
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 sm:px-6 py-4">
                <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Trophy size={13} />
                  </span>
                  {activeMeta?.title ?? category}
                  <span className="font-normal text-neutral-400">
                    {scope === "daily" && attemptDate ? `· ${prettyDate(attemptDate)}` : "· all-time"}
                  </span>
                </p>
                <p className="inline-flex items-center gap-1.5 text-xs tabular-nums text-neutral-400">
                  <Hash size={11} />
                  {entries.length} ranked
                </p>
              </div>

              <div className="px-4 sm:px-8 pt-7 pb-0">
                <div
                  className={`grid items-end gap-2 sm:gap-4 ${
                    podiumDisplay.length === 1
                      ? "grid-cols-1 max-w-[240px] mx-auto"
                      : podiumDisplay.length === 2
                        ? "grid-cols-2 max-w-[440px] mx-auto"
                        : "grid-cols-3"
                  }`}
                >
                  {podiumDisplay.map((row, di) => {
                    const isFirst = row.rank === 1;
                    const isMe = me != null && row.user_id === me;
                    return (
                      <motion.div
                        key={row.user_id}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.1 + di * 0.12,
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                        }}
                        className="flex flex-col items-center text-center"
                      >
                        {isFirst ? (
                          <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-neutral-900 shadow-[0_2px_8px_rgba(251,191,36,0.5)]">
                            <Crown size={16} strokeWidth={2.25} />
                          </span>
                        ) : (
                          <span
                            className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                              row.rank === 2
                                ? "bg-neutral-100 text-neutral-400"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            <Medal size={16} />
                          </span>
                        )}
                        <div className={isFirst ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white rounded-full" : ""}>
                          <Avatar name={row.name} url={row.avatar_url} size={isFirst ? "lg" : "md"} />
                        </div>
                        <p className="mt-2.5 flex max-w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-neutral-900">
                          <span className="truncate">{row.name}</span>
                          {isMe && (
                            <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                              You
                            </span>
                          )}
                        </p>
                        <p className={`font-display-hire tabular-nums font-extrabold tracking-tight ${isFirst ? "text-[22px]" : "text-lg"}`}>
                          {row.total_score}
                          <span className="ml-1 text-xs font-semibold text-neutral-400">pts</span>
                        </p>
                        <p className="inline-flex items-center gap-1 text-[11px] tabular-nums text-neutral-500">
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-blue-50 text-blue-600">
                            <Clock size={10} />
                          </span>
                          {formatMsCompact(row.total_time_ms)}
                          {typeof row.attempts === "number" && scope === "overall" && (
                            <span> · {row.attempts} tests</span>
                          )}
                        </p>
                        {/* stage block */}
                        <div
                          className={`mt-3 flex w-full items-start justify-center rounded-t-xl pt-2.5 ${
                            isFirst
                              ? "h-28 bg-neutral-900 text-white"
                              : row.rank === 2
                                ? "h-20 bg-neutral-100 text-neutral-500 border border-b-0 border-neutral-200"
                                : "h-16 bg-[#F1EDE4] text-amber-800 border border-b-0 border-amber-200/70"
                          }`}
                        >
                          <span className={`font-display-hire font-extrabold ${isFirst ? "text-2xl" : "text-lg"}`}>
                            {row.rank}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="h-[3px] w-full rounded-full bg-neutral-900" />
                <div className="flex justify-between py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  <span>Higher score wins · faster time breaks ties</span>
                  <span className="hidden sm:inline">Checked automatically</span>
                </div>
              </div>
            </section>

            {/* ── Rest of the table ────────────────────────── */}
            {rest.length > 0 && (
              <section
                aria-label="Remaining ranks"
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <div className="grid grid-cols-12 gap-2 border-b border-neutral-100 bg-neutral-50/70 px-4 sm:px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  <div className="col-span-2 sm:col-span-1 inline-flex items-center gap-1">
                    <Hash size={10} /> Rank
                  </div>
                  <div className="col-span-6 sm:col-span-7">Name</div>
                  <div className="col-span-2 inline-flex items-center justify-end gap-1 text-right">
                    <Zap size={10} /> Score
                  </div>
                  <div className="col-span-2 inline-flex items-center justify-end gap-1 text-right">
                    <Clock size={10} /> Time
                  </div>
                </div>
                <div className="divide-y divide-neutral-100">
                  {rest.map((row) => {
                    const isMe = me != null && row.user_id === me;
                    return (
                      <div
                        key={row.user_id}
                        className={`grid grid-cols-12 items-center gap-2 px-4 sm:px-5 py-3 transition-colors ${
                          isMe ? "bg-emerald-50/70" : "hover:bg-neutral-50"
                        }`}
                      >
                        <div className="col-span-2 sm:col-span-1">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-[13px] font-bold tabular-nums text-neutral-500">
                            {row.rank}
                          </span>
                        </div>
                        <div className="col-span-6 sm:col-span-7 flex min-w-0 items-center gap-3">
                          <Avatar name={row.name} url={row.avatar_url} size="sm" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-neutral-900">
                              <span className="truncate">{row.name}</span>
                              {isMe && (
                                <span className="shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] tabular-nums text-neutral-400">
                              {typeof row.attempts === "number" && scope === "overall"
                                ? `${row.attempts} test${row.attempts === 1 ? "" : "s"}`
                                : scope === "daily"
                                  ? "today"
                                  : "ranked"}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 text-right text-sm font-bold tabular-nums">
                          {row.total_score}
                        </div>
                        <div className="col-span-2 inline-flex items-center justify-end gap-1 text-right text-xs tabular-nums text-neutral-500">
                          <Clock size={10} className="text-neutral-300" />
                          {formatMsCompact(row.total_time_ms)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* footer actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {role !== "recruiter" && playable && (
                <Link
                  href={`/hire/${category}/daily`}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
                >
                  <Zap size={14} /> Play today&apos;s {boardLabel(category)} test
                </Link>
              )}
              <Link
                href="/hire"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-900 transition-colors"
              >
                All topics <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
