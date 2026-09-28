"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { HIRE_CATEGORIES, HIRE_SECTIONS } from "@/lib/hire-categories";
import {
  formatMsCompact,
  type HireUserStats,
} from "@/lib/hire-types";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Cpu,
  Puzzle,
  BookOpen,
  Code2,
  Newspaper,
  Trophy,
  Clock,
  Flame,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowRight,
  ListChecks,
  Timer,
  ShieldAlert,
  RotateCcw,
  Lock,
  CircleCheck,
  Users,
  FileCheck,
  History,
  Sparkles,
  CalendarDays,
  UserRound,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
  Brain,
  Cloud,
  Globe,
  FileCode2,
  Coffee,
  ShieldCheck,
  Terminal,
  Network,
  Binary,
  Dumbbell,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Calculator> = {
  aptitude: Calculator,
  technical: Cpu,
  reasoning: Puzzle,
  verbal: BookOpen,
  dsa: Binary,
  swe: Layers,
  aiml: Brain,
  cloud: Cloud,
  webdev: Globe,
  cpp: FileCode2,
  java: Coffee,
  cybersecurity: ShieldCheck,
  python: Terminal,
  "system-design": Network,
  // Legacy (removed from UI, kept so old stats still resolve an icon).
  coding: Code2,
  general: Newspaper,
};

function iconFor(slug: string) {
  return CATEGORY_ICONS[slug] ?? ListChecks;
}

function catBySlug(slug: string) {
  return HIRE_CATEGORIES.find((c) => c.slug === slug);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function firstName(full: string) {
  const t = (full || "").trim().split(/\s+/)[0];
  return t || "there";
}

interface TrackAvailability {
  count: number;
  available: boolean;
}

export default function HireLandingHub() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState<HireUserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, TrackAvailability> | null>(null);
  const [perTest, setPerTest] = useState<number>(10);
  const [profileName, setProfileName] = useState<string>("");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  // True when nobody is logged in — the page renders a public preview:
  // topics visible, stats box blurred with login CTA, every test
  // click routes through /login.
  const [isGuest, setIsGuest] = useState(false);

  const isAvailable = useCallback(
    (slug: string) => availability?.[slug]?.available ?? true,
    [availability]
  );

  // Logged-in users: session, user, stats and tracks resolve in
  // parallel so first paint waits on the slowest call only.
  // Logged-out visitors: NO redirect — public preview with the (now
  // public) tracks list; stats/profile stay empty and every test click
  // routes through /login. A stale/invalid token still redirects.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? "";
      const headers = (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit;
      const { data: userData } = await supabase.auth.getUser();

      const applyTracks = (tracksJson: {
        tracks?: Array<{ slug: string; count: number; available: boolean }>;
        per_test?: unknown;
      } | null) => {
        const map: Record<string, TrackAvailability> = {};
        for (const t of (tracksJson?.tracks ?? []) as Array<{
          slug: string;
          count: number;
          available: boolean;
        }>) {
          if (typeof t.slug === "string") {
            map[t.slug] = {
              count: Number(t.count ?? 0),
              available: t.available === true,
            };
          }
        }
        setAvailability(map);
        if (Number.isFinite(Number(tracksJson?.per_test))) {
          setPerTest(Math.max(1, Math.round(Number(tracksJson?.per_test))));
        }
      };

      if (!userData.user) {
        if (token) {
          router.push("/login?redirect=/hire");
          return;
        }
        setIsGuest(true);
        setRole(null);
        try {
          const res = await fetch("/api/hire/tracks", { headers });
          if (res.ok) applyTracks((await res.json()) as Parameters<typeof applyTracks>[0]);
        } catch {
          // preview falls back to default availability
        } finally {
          setLoading(false);
        }
        return;
      }
      setIsGuest(false);

      const fetchJson = (url: string) =>
        fetch(url, { headers }).then(async (res) => {
          if (res.status === 401) throw new Error("__AUTH__");
          const json = await res.json();
          if (!res.ok) throw new Error(json?.error || "Could not load. Please try again.");
          return json;
        });
      const [statsJson, tracksJson] = await Promise.all([
        fetchJson("/api/hire/stats?limit=200"),
        fetchJson("/api/hire/tracks"),
      ]);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, name, avatar_url")
        .eq("id", userData.user.id)
        .maybeSingle();
      const p = profile as { role?: string; name?: string | null; avatar_url?: string | null } | null;
      setRole(p?.role ?? "candidate");
      setProfileName((p?.name ?? "").trim());
      setProfileAvatar(p?.avatar_url ?? null);
      setStats(statsJson.stats as HireUserStats);
      applyTracks(tracksJson);
    } catch (e) {
      if (e instanceof Error && e.message === "__AUTH__") {
        router.push("/login?redirect=/hire");
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

  const doneToday = useMemo(() => {
    if (!stats) return new Set<string>();
    const t = todayStr();
    return new Set(
      stats.recentAttempts.filter((a) => a.attempt_date === t).map((a) => a.category)
    );
  }, [stats]);

  const streak = stats?.currentStreakDays ?? 0;
  const [howOpen, setHowOpen] = useState(true);
  const [perfOpen, setPerfOpen] = useState(true);

  // Per-date practice activity for the LeetCode-style month calendar.
  // Intensity = tests finished that day; detail = total points.
  const activity = useMemo(() => {
    const map: Record<string, { count: number; score: number }> = {};
    for (const a of stats?.recentAttempts ?? []) {
      const key = a.attempt_date;
      if (!key) continue;
      if (!map[key]) map[key] = { count: 0, score: 0 };
      map[key].count += 1;
      map[key].score += a.total_score ?? 0;
    }
    return map;
  }, [stats]);

  const activeDayCount = useMemo(() => Object.keys(activity).length, [activity]);

  if (!mounted) return null;

  const isRecruiter = role === "recruiter";
  const displayName = profileName || "there";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased pb-28">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        {/* ── Page head ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display-hire text-[28px] sm:text-[34px] font-extrabold tracking-tight leading-none">
              Practice tests
            </h1>
            <p className="mt-2 text-[13px] text-neutral-500">
              New questions every day · one try per topic ·{" "}
              {!loading && stats && streak > 0 ? (
                <span className="inline-flex items-center gap-1 font-semibold text-orange-700">
                  {streak} day{streak === 1 ? "" : "s"} in a row 🔥
                </span>
              ) : loading ? (
                "answers checked instantly"
              ) : (
                "answers checked instantly"
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isGuest && !loading && stats && streak > 0 && (
              <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 shadow-sm">
                <Flame size={16} className="text-orange-500" fill="currentColor" />
                <span className="leading-tight">
                  <span className="block text-[12px] font-bold">{streak} Day Streak</span>
                  <span className="block text-[11px] text-neutral-500">Keep it going!</span>
                </span>
              </span>
            )}
            {!isGuest && role !== "recruiter" && (
              <Button asChild variant="secondary" size="sm" className="h-10 px-4">
                <Link href="/hire/history">
                  <History /> Past tries
                </Link>
              </Button>
            )}
            <Button asChild size="sm" className="h-10 px-4">
              <Link href={isGuest ? "/login?redirect=/hire/leaderboard" : "/hire/leaderboard"}>
                <Trophy /> Leaderboard
              </Link>
            </Button>
          </div>
        </div>

        {isRecruiter && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5">
            <ShieldAlert size={17} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-[13px] leading-relaxed text-amber-900">
              <span className="font-semibold">You signed in as a recruiter, so this page is view-only.</span>{" "}
              Tests stay locked for your account to keep the leaderboard fair
              for students — but you can open every topic and ranking.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <p className="text-[13px] font-medium text-red-800">{error}</p>
            <Button variant="secondary" size="sm" onClick={load}>
              <RotateCcw /> Try again
            </Button>
          </div>
        )}

        {/* ── Main: topics + sidebar ──────────────────────────────── */}
        <div className="grid gap-3.5 lg:grid-cols-[1fr_320px] items-start">
          {/* Topics */}
          <div className="space-y-8 min-w-0">
            {HIRE_SECTIONS.map((section, si) => (
              <section key={section.title} className="space-y-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <h2 className="font-display-hire text-lg font-extrabold tracking-tight">
                      {section.title}
                    </h2>
                    <p className="mt-0.5 text-[13px] text-neutral-500">{section.desc}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-neutral-500">
                    {section.slugs.length} topic{section.slugs.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 min-[1200px]:grid-cols-3 gap-3.5">
                  {section.slugs.map((slug, i) => {
                    const cat = catBySlug(slug);
                    if (!cat) return null;
                    const Icon = iconFor(cat.slug);
                    const playable = isAvailable(cat.slug);
                    const bankCount = availability?.[cat.slug]?.count;
                    const mine = stats?.perCategory?.[cat.slug];
                    const finishedToday = doneToday.has(cat.slug);
                    // Guests preview everything but play nothing — any test
                    // click sends them to signup (candidate role).
                    const href = isGuest
                      ? "/signup?role=candidate"
                      : isRecruiter
                        ? "/hire/leaderboard"
                        : `/hire/${cat.slug}/daily`;

                    const body = (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white">
                            <Icon size={20} strokeWidth={2} />
                          </div>
                          {finishedToday && playable ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                              <CircleCheck size={12} /> Done
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium tabular-nums text-neutral-500">
                              <Clock size={12} />
                              {perTest} Qs · {cat.estTime}
                            </span>
                          )}
                        </div>
                        <div className="mt-4">
                          <h3 className="text-[15.5px] font-bold tracking-tight">
                            {cat.title}
                          </h3>
                          <p className="mt-1 min-h-[40px] text-[13px] leading-relaxed text-neutral-500 line-clamp-2">
                            {cat.desc}
                          </p>
                        </div>
                        {/* DSA renders its own Daily test / Practice buttons below
                            the card, so its dead Start pill row is skipped. */}
                        {cat.slug !== "dsa" && (
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3.5">
                          <span className="min-w-0 truncate text-xs font-medium text-neutral-500">
                            {!playable ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Lock size={12} /> Coming soon
                                {typeof bankCount === "number"
                                  ? ` - ${bankCount}/${perTest} ready`
                                  : ""}
                              </span>
                            ) : finishedToday ? (
                              <span>
                                Best {mine ? `${mine.bestScore}/${perTest}` : `5/${perTest}`}
                              </span>
                            ) : mine ? (
                              <>Best {mine.bestScore}/{perTest} · tried {mine.attempts}x</>
                            ) : (
                              "Not tried yet"
                            )}
                          </span>
                          {!playable ? (
                            <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-400">
                              Soon
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white transition-transform group-hover:scale-[1.04]">
                              {isRecruiter ? "View" : finishedToday ? "Answers" : "Start"}
                              <ChevronRight size={14} strokeWidth={2.5} />
                            </span>
                          )}
                        </div>
                        )}
                      </>
                    );

                    if (!playable) {
                      return (
                        <div
                          key={cat.slug}
                          aria-disabled
                          className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 opacity-70"
                        >
                          {body}
                        </div>
                      );
                    }

                    // DSA gets two doors: the daily mixed test (leaderboard)
                    // and the custom practice drill (no stakes). A card-wide
                    // link can't hold a second link, so DSA renders its own
                    // card with two explicit buttons instead.
                    if (cat.slug === "dsa") {
                      const practiceHref = isGuest
                        ? "/signup?role=candidate"
                        : isRecruiter
                          ? "/hire/leaderboard"
                          : "/hire/dsa/practice";
                      return (
                        <motion.div
                          key={cat.slug}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: si * 0.08 + i * 0.05 }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.995 }}
                        >
                          <div
                            className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.25)] hover:border-neutral-900 ${
                              finishedToday ? "border-emerald-300" : "border-neutral-200"
                            }`}
                          >
                            {body}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <Link
                                href={href}
                                className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-neutral-900 px-3 text-xs font-bold text-white transition-colors hover:bg-neutral-700"
                              >
                                {isRecruiter ? "View" : finishedToday ? "Answers" : "Daily test"}
                                <ChevronRight size={14} strokeWidth={2.5} />
                              </Link>
                              <Link
                                href={practiceHref}
                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-violet-300 bg-violet-50 px-3 text-xs font-bold text-violet-900 transition-colors hover:border-violet-500 hover:bg-violet-100"
                              >
                                <Dumbbell size={14} /> Practice
                              </Link>
                            </div>
                            <p className="mt-2 text-center text-[11px] text-neutral-400">
                              Daily counts for leaderboard · practice never does
                            </p>
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={cat.slug}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: si * 0.08 + i * 0.05 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.995 }}
                      >
                        <Link
                          href={href}
                          className={`group block rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.25)] hover:border-neutral-900 ${
                            finishedToday ? "border-emerald-300" : "border-neutral-200"
                          }`}
                        >
                          {body}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="space-y-3.5 lg:sticky lg:top-4">
            {/* Hello / progress card — personal progress; not needed for recruiters */}
            {!isRecruiter && (
            <div className="rounded-2xl border border-neutral-200 bg-[#F2F7F1] p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-3">
                {profileAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileAvatar}
                    alt={displayName}
                    className="h-11 w-11 rounded-full object-cover border border-neutral-200 bg-white"
                  />
                ) : isGuest && !loading ? (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <UserRound size={20} />
                  </span>
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600 overflow-hidden">
                    {loading ? (
                      <span className="h-full w-full animate-pulse bg-neutral-300/60" />
                    ) : (
                      firstName(displayName).charAt(0).toUpperCase()
                    )}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-bold tracking-tight truncate">
                    Hello, {loading ? "…" : isGuest ? "friend" : firstName(displayName)} <span aria-hidden>👋</span>
                  </p>
                  <p className="text-[12px] text-neutral-500 leading-snug">
                    {isGuest
                      ? "Log in to track your scores!"
                      : "Keep practicing and improve your scores!"}
                  </p>
                </div>
              </div>

              {/* Stats + calendar — blurred behind a login CTA for guests */}
              <div className="relative">
                <div
                  aria-hidden={isGuest}
                  className={isGuest ? "blur-[3px] select-none pointer-events-none" : undefined}
                >
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    icon: <BarChart3 size={16} className="text-emerald-600" />,
                    value: loading || !stats ? "–" : String(stats.completedAttempts),
                    label: "Tests Finished",
                  },
                  {
                    icon: <Trophy size={15} className="text-amber-500" />,
                    value: loading || !stats ? "–" : `${stats.bestScore}/${perTest}`,
                    label: "Best Score",
                  },
                  {
                    icon: <Clock size={15} className="text-blue-600" />,
                    value: loading || !stats ? "–" : formatMsCompact(stats.avgTimeMs),
                    label: "Avg. Time",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-neutral-200/70 bg-white px-2 py-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-8px_rgba(0,0,0,0.2)]"
                  >
                    <span className="mx-auto flex justify-center">{s.icon}</span>
                    <p className="font-display-hire mt-1.5 text-[15px] font-extrabold tabular-nums tracking-tight">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-neutral-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <StreakCalendar
                activity={activity}
                streak={streak}
                loading={loading}
                activeDayCount={activeDayCount}
                locked={isGuest}
              />
                </div>
                {isGuest && !loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/45 p-4 text-center">
                    <p className="text-[13.5px] font-extrabold tracking-tight">
                      Log in to track your progress
                    </p>
                    <p className="max-w-[220px] text-[12px] leading-snug text-neutral-600">
                      Streaks, scores and your practice calendar live here.
                    </p>
                    <div className="mt-1.5 flex gap-2">
                      <Link
                        href="/login?redirect=/hire"
                        className="inline-flex h-10 items-center rounded-xl bg-neutral-900 px-4 text-[13px] font-bold text-white transition-colors hover:bg-neutral-700"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup?role=candidate"
                        className="inline-flex h-10 items-center rounded-xl border border-neutral-300 bg-white px-4 text-[13px] font-bold text-neutral-800 transition-colors hover:border-neutral-900"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-100/70 px-3.5 py-3">
                <p className="text-[12.5px] font-medium leading-snug text-neutral-800">
                  “Small progress every day leads to big results.”
                </p>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-200/60 text-emerald-800">
                  <TrendingUp size={15} />
                </span>
              </div>
            </div>
            )}

            {/* Why practice here? */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="font-display-hire text-[15px] font-extrabold tracking-tight">
                Why practice here?
              </p>
              <div className="mt-3.5 space-y-3">
                {[
                  { icon: History, text: "Fresh set of questions every day" },
                  { icon: RotateCcw, text: "One try per topic, every day" },
                  { icon: CircleCheck, text: "Auto evaluation & detailed solutions" },
                  { icon: Users, text: "Compare with other students" },
                  { icon: TrendingUp, text: "Track your progress over time" },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.text}
                      className="flex items-center gap-2.5 rounded-lg -mx-2 px-2 py-1 transition-colors hover:bg-neutral-100"
                    >                      <Icon size={15} className="shrink-0 text-neutral-700" />
                      <p className="text-[13px] text-neutral-700">{r.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard CTA */}
            <div className="rounded-2xl bg-neutral-900 p-5 text-white">
              <Trophy size={22} className="text-amber-400" fill="currentColor" />
              <p className="font-display-hire mt-3 text-[17px] font-extrabold tracking-tight">
                Compete on Leaderboard
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-300">
                See how you rank among other students and keep improving.
              </p>
              <Link
                href={isGuest ? "/login?redirect=/hire/leaderboard" : "/hire/leaderboard"}
                className="mt-4 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-sm font-bold text-neutral-900 hover:bg-neutral-200 transition-colors"
              >
                View Leaderboard <ChevronRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </aside>
        </div>

        {/* ── Bottom: how it works + performance + banner ─────────── */}
        <div className="space-y-3 pt-2">
          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <button
              onClick={() => setHowOpen((v) => !v)}
              aria-expanded={howOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-3 p-5 text-left"
            >
              <span className="inline-flex items-center gap-2.5 text-sm font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-neutral-200">
                  <FileCheck size={15} />
                </span>
                How it works
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-neutral-400 transition-transform duration-300 ${howOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {howOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-t border-neutral-100 px-5 py-5">
                    {[
                      { icon: RotateCcw, text: "One try per topic, every day — a fresh set tomorrow." },
                      { icon: Users, text: `Same ${perTest} questions for everyone in a topic.` },
                      { icon: Timer, text: "Each test is timed and answers are checked automatically." },
                      { icon: Sparkles, text: "Full answers with explanations open up after you submit." },
                    ].map((r, ri) => {
                      const Icon = r.icon;
                      return (
                        <motion.div
                          key={r.text}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: ri * 0.06 }}
                          className="flex items-start gap-2.5 rounded-lg -mx-2 px-2 py-1 transition-colors hover:bg-neutral-50"
                        >
                          <Icon size={15} className="mt-0.5 shrink-0 text-neutral-500" />
                          <p className="text-[13px] leading-relaxed text-neutral-600">{r.text}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Personal totals — hidden for guests (no data) and recruiters */}
          {!isGuest && !isRecruiter && (
          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between gap-3 p-5">
              <button
                onClick={() => setPerfOpen((v) => !v)}
                aria-expanded={perfOpen}
                className="inline-flex min-w-0 cursor-pointer items-center gap-2.5 text-sm font-bold text-left"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                  <Trophy size={15} />
                </span>
                Your performance
                {!loading && stats && stats.completedAttempts > 0 && (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold tabular-nums text-neutral-600">
                    {stats.completedAttempts} tests · {stats.totalScore} pts
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-neutral-400 transition-transform duration-300 ${perfOpen ? "rotate-180" : ""}`}
                />
              </button>
              <Link
                href="/hire/history"
                className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-neutral-700 hover:text-neutral-900"
              >
                See all past tries <ArrowRight size={14} />
              </Link>
            </div>
            <AnimatePresence initial={false}>
              {perfOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-neutral-100 px-5 py-5">
                    {loading || !stats ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="rounded-xl bg-neutral-50 p-4 space-y-2">
                            <div className="h-3 w-20 rounded bg-neutral-200/70" />
                            <div className="h-7 w-14 rounded bg-neutral-200/70" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Tests finished", value: String(stats.completedAttempts) },
                          { label: "Total score", value: String(stats.totalScore) },
                          { label: `Best score (out of ${perTest})`, value: String(stats.bestScore) },
                          { label: "Average time", value: formatMsCompact(stats.avgTimeMs) },
                        ].map((s, si) => (
                          <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: si * 0.06 }}
                            className="rounded-xl bg-neutral-50 p-4 transition-all duration-200 hover:bg-neutral-100 hover:-translate-y-0.5"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                              {s.label}
                            </p>
                            <p className="font-display-hire mt-1 text-2xl font-extrabold tabular-nums tracking-tight">
                              {s.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/60 p-5 sm:px-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-blue-600">
              <Target size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display-hire text-[17px] font-extrabold tracking-tight">
                Get better, one test at a time.
              </p>
              <p className="mt-0.5 text-[13px] text-neutral-600">
                Practice regularly, learn from your mistakes and improve your placement preparation.
              </p>
            </div>
            <Link
              href={isGuest ? "/login?redirect=/hire/leaderboard" : "/hire/leaderboard"}
              className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition-all hover:bg-neutral-700 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] active:scale-[0.98]"
            >
              Explore all topics <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LeetCode-style practice calendar ────────────────────────────
   Month grid with prev/next navigation. Tap a green date to see
   exactly what you practiced that day. */
function StreakCalendar({
  activity,
  streak,
  loading,
  activeDayCount,
  locked = false,
}: {
  activity: Record<string, { count: number; score: number }>;
  streak: number;
  loading: boolean;
  activeDayCount: number;
  /** Locked (guest preview): same visuals, all controls disabled. */
  locked?: boolean;
}) {
  const today = new Date();
  const [open, setOpen] = useState(true);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const isCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();
  // Allow browsing back up to 11 months.
  const oldestAllowed =
    today.getMonth() - 11 >= 0
      ? { y: today.getFullYear(), m: today.getMonth() - 11 }
      : { y: today.getFullYear() - 1, m: today.getMonth() - 11 + 12 };
  const canGoPrev =
    view.y > oldestAllowed.y || (view.y === oldestAllowed.y && view.m > oldestAllowed.m);

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const leadBlanks = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Mon = 0
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const monthActive = useMemo(() => {
    let n = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (activity[iso]) n += 1;
    }
    return n;
  }, [activity, view, daysInMonth]);

  const sel = selected ? activity[selected] : undefined;
  const selLabel = selected
    ? (() => {
        try {
          return new Date(`${selected}T00:00:00Z`).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata",
          });
        } catch {
          return selected;
        }
      })()
    : null;

  const shift = (dir: 1 | -1) => {
    setSelected(null);
    setView((v) => {
      const nm = v.m + dir;
      if (nm < 0) return { y: v.y - 1, m: 11 };
      if (nm > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m: nm };
    });
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        disabled={locked}
        className={`flex w-full items-center justify-between rounded-lg -mx-1 px-1 py-0.5 transition-colors ${locked ? "cursor-default" : "cursor-pointer hover:bg-black/[0.04]"}`}
      >
        <p className="inline-flex items-center gap-1.5 text-[13px] font-bold">
          <CalendarDays size={14} /> Your Streak
          {!loading && activeDayCount > 0 && (
            <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-emerald-800">
              {activeDayCount} active
            </span>
          )}
        </p>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-orange-600 tabular-nums">
            {loading ? "…" : streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "0 days"}
          </span>
          {!locked && (
          <ChevronDown
            size={14}
            className={`text-neutral-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2.5">
              <div className="rounded-xl border border-neutral-200/70 bg-white/70 p-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => shift(-1)}
                    disabled={!canGoPrev || locked}
                    aria-label="Previous month"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <p className="text-[12px] font-bold tabular-nums">{monthLabel}</p>
                  <button
                    onClick={() => shift(1)}
                    disabled={isCurrentMonth || locked}
                    aria-label="Next month"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1 text-center">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} className="text-[9px] font-bold text-neutral-400">
                      {d}
                    </span>
                  ))}
                  {Array.from({ length: leadBlanks }).map((_, i) => (
                    <span key={`b-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const iso = `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(
                      day
                    ).padStart(2, "0")}`;
                    const act = activity[iso];
                    const isFuture = iso > todayIso;
                    const isToday = iso === todayIso;
                    const isSel = selected === iso;
                    const level = !act
                      ? 0
                      : act.count >= 3
                        ? 3
                        : act.count === 2
                          ? 2
                          : 1;
                    return (
                      <button
                        key={iso}
                        disabled={!act || isFuture || locked}
                        onClick={() => setSelected((s) => (s === iso ? null : iso))}
                        title={
                          act
                            ? `${day} — ${act.count} test${act.count === 1 ? "" : "s"} · ${act.score} pts`
                            : `${day}`
                        }
                        className={`flex h-8 items-center justify-center rounded-lg text-[11px] font-semibold tabular-nums transition-all ${
                          isFuture
                            ? "cursor-default text-neutral-300"
                            : level === 3
                              ? "cursor-pointer bg-emerald-600 text-white hover:scale-110 hover:shadow-[0_4px_10px_-2px_rgba(5,150,105,0.6)]"
                              : level === 2
                                ? "cursor-pointer bg-emerald-400 text-white hover:scale-110 hover:shadow-[0_4px_10px_-2px_rgba(52,211,153,0.7)]"
                                : level === 1
                                  ? "cursor-pointer bg-emerald-200 text-emerald-900 hover:scale-110"
                                  : "bg-neutral-100/70 text-neutral-400"
                        } ${isToday ? "ring-2 ring-neutral-900 ring-offset-1 ring-offset-white" : ""} ${
                          isSel ? "ring-2 ring-emerald-700 ring-offset-1 ring-offset-white scale-110" : ""
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2">
                  <p className="text-[10.5px] font-medium text-neutral-500">
                    {sel && selLabel ? (
                      <span className="font-bold text-neutral-800">
                        {selLabel} · {sel.count} test{sel.count === 1 ? "" : "s"} · {sel.score} pts
                      </span>
                    ) : monthActive > 0 ? (
                      <>{monthActive} day{monthActive === 1 ? "" : "s"} practiced</>
                    ) : (
                      <>No practice this month yet</>
                    )}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-medium text-neutral-400">
                    Less
                    <span className="h-2.5 w-2.5 rounded-[4px] bg-neutral-200" />
                    <span className="h-2.5 w-2.5 rounded-[4px] bg-emerald-200" />
                    <span className="h-2.5 w-2.5 rounded-[4px] bg-emerald-400" />
                    <span className="h-2.5 w-2.5 rounded-[4px] bg-emerald-600" />
                    More
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
