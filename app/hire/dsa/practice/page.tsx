"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  DSA_PRACTICE_COUNTS,
  DSA_PRACTICE_SECONDS_PER_QUESTION,
  normalizeDsaCount,
  type DsaPracticeCount,
} from "@/lib/dsa";
import type { HireReviewItem, HireSafeQuestion } from "@/lib/hire-types";
import {
  DsaInlineHtml,
  DsaOptionHtml,
  DsaQuestionBody,
  DsaSolutionHtml,
  LanguageBadge,
} from "@/app/hire/_components/dsa-html";
import ElapsedTimer from "@/app/hire/_components/elapsed-timer";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flag,
  Gauge,
  Lightbulb,
  MinusCircle,
  RotateCcw,
  Tag,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";

type Phase = "config" | "loading" | "ready" | "checking" | "review" | "error";

interface TopicCount {
  topic: string;
  count: number;
}

function difficultyStyle(d?: string) {
  const l = (d ?? "").toLowerCase();
  if (l === "easy") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (l === "hard") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-amber-50 text-amber-800 ring-amber-200";
}

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export default function DsaPracticePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("config");
  const [error, setError] = useState<string | null>(null);

  // Setup
  const [topics, setTopics] = useState<TopicCount[]>([]);
  const [bankTotal, setBankTotal] = useState<number | null>(null);
  const [count, setCount] = useState<DsaPracticeCount>(10);
  const [topic, setTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [timed, setTimed] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Run
  const [questions, setQuestions] = useState<HireSafeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const autoSubmittedRef = useRef(false);

  // Review
  const [reviewItems, setReviewItems] = useState<HireReviewItem[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const timeLimitMs = useMemo(
    () => count * DSA_PRACTICE_SECONDS_PER_QUESTION * 1000,
    [count]
  );

  // Public topic counts for the setup filters + guest detection.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/hire/dsa/topics");
        const json = await res.json();
        if (!res.ok) throw new Error();
        if (cancelled) return;
        setTopics((json.topics ?? []) as TopicCount[]);
        if (typeof json.total === "number") setBankTotal(json.total);
      } catch {
        if (!cancelled) setTopics([]);
      }
    })();
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setIsGuest(!data.session);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login?redirect=/hire/dsa/practice");
      return;
    }
    setPhase("loading");
    try {
      const token = data.session.access_token;
      const params = new URLSearchParams({ count: String(count) });
      if (topic) params.set("topic", topic);
      if (difficulty) params.set("difficulty", difficulty);
      const res = await fetch(`/api/hire/dsa/practice?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.status === 401) {
        router.push("/login?redirect=/hire/dsa/practice");
        return;
      }
      if (!res.ok) throw new Error(json?.error || "Could not load a practice set.");
      const qs = (json.questions ?? []) as HireSafeQuestion[];
      if (qs.length === 0) throw new Error("No questions came back — try different filters.");
      const now = Date.now();
      setQuestions(qs);
      setCurrentIdx(0);
      setAnswers({});
      setReviewItems([]);
      setStartedAt(now);
      autoSubmittedRef.current = false;
      if (timed) {
        deadlineRef.current = now + timeLimitMs;
        setTimeLeftMs(timeLimitMs);
      } else {
        deadlineRef.current = null;
        setTimeLeftMs(null);
      }
      setPhase("ready");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }, [count, topic, difficulty, timed, timeLimitMs, router]);

  const check = useCallback(
    async (auto = false) => {
      if (phase !== "ready" || questions.length === 0) return;
      if (!auto) {
        const blank = questions.filter((q) => !answers[q.id]).length;
        if (blank > 0) {
          const ok = window.confirm(
            `${blank} question${blank > 1 ? "s are" : " is"} still blank and will be marked wrong. Submit anyway?`
          );
          if (!ok) return;
        }
      }
      setPhase("checking");
      setError(null);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? "";
        if (!token) {
          router.push("/login?redirect=/hire/dsa/practice");
          return;
        }
        const payload: Record<string, string> = {};
        for (const q of questions) payload[q.id] = answers[q.id] ?? "";
        const res = await fetch("/api/hire/dsa/practice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Could not check answers.");
        setReviewItems((json.items ?? []) as HireReviewItem[]);
        setTotalScore(Number(json.total_score ?? 0));
        setPhase("review");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        setPhase("ready");
        setError(e instanceof Error ? e.message : "Could not check answers.");
      }
    },
    [phase, questions, answers, router]
  );

  // Countdown ticking + auto-submit at zero (timed mode only).
  useEffect(() => {
    if (phase !== "ready" || deadlineRef.current === null) return;
    const id = window.setInterval(() => {
      const left = (deadlineRef.current ?? 0) - Date.now();
      setTimeLeftMs(Math.max(0, left));
      if (left <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        void check(true);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [phase, check]);

  const activeQuestion = questions[currentIdx];
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  const backToSetup = () => {
    setPhase("config");
    setQuestions([]);
    setReviewItems([]);
    setError(null);
    deadlineRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased pb-28">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5">
        <Link
          href="/hire"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft size={14} /> Practice tests
        </Link>

        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              DSA · Practice mode
            </p>
            <h1 className="font-display-hire mt-1.5 text-[26px] sm:text-3xl font-extrabold tracking-tight leading-none">
              {phase === "review" ? "Answers & solutions" : "Custom DSA drill"}
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-neutral-500">
              {bankTotal !== null && `${bankTotal} questions in the bank · `}
              Untouched by streaks and leaderboards — pure practice.
            </p>
          </div>
          {(phase === "ready" || phase === "checking") && (
            <div
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 font-mono text-[15px] font-bold tabular-nums shadow-sm ${
                timed && (timeLeftMs ?? 0) < 60000
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <Timer size={15} className="text-neutral-500" />
              {timed && timeLeftMs !== null ? (
                formatCountdown(timeLeftMs)
              ) : (
                <ElapsedTimer startedAt={startedAt} />
              )}
            </div>
          )}
        </header>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <p className="text-[13px] font-medium text-red-800">{error}</p>
            <button
              onClick={() => (phase === "error" ? backToSetup() : void check())}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              <RotateCcw size={12} /> Retry
            </button>
          </div>
        )}

        {phase === "config" && (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 space-y-6 shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  1 · How many questions?
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {DSA_PRACTICE_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(normalizeDsaCount(n) ?? 10)}
                      aria-pressed={count === n}
                      className={`h-11 min-w-[64px] cursor-pointer rounded-xl border px-4 text-sm font-bold tabular-nums transition-colors ${
                        count === n
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  <Tag size={12} /> 2 · Topic
                </p>
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <TopicPill
                    active={topic === null}
                    label="Mixed (all)"
                    count={bankTotal}
                    onClick={() => setTopic(null)}
                  />
                  {topics.map((t) => (
                    <TopicPill
                      key={t.topic}
                      active={topic === t.topic}
                      label={t.topic}
                      count={t.count}
                      onClick={() => setTopic((v) => (v === t.topic ? null : t.topic))}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  <Gauge size={12} /> 3 · Difficulty
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty((v) => (v === d ? null : d))}
                      aria-pressed={difficulty === d}
                      className={`h-11 cursor-pointer rounded-xl border px-5 text-sm font-bold transition-colors ${
                        difficulty === d
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                  <span className="self-center text-xs text-neutral-400">
                    (empty = all levels)
                  </span>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  <Timer size={12} /> 4 · Timer
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setTimed(true)}
                    aria-pressed={timed}
                    className={`h-11 cursor-pointer rounded-xl border px-5 text-sm font-bold transition-colors ${
                      timed
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    Timed · {Math.round(timeLimitMs / 60000)} min
                  </button>
                  <button
                    onClick={() => setTimed(false)}
                    aria-pressed={!timed}
                    className={`h-11 cursor-pointer rounded-xl border px-5 text-sm font-bold transition-colors ${
                      !timed
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    Untimed
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                  {timed
                    ? `Countdown of ${Math.round(timeLimitMs / 60000)} minutes (90s per question) — auto-submits at zero.`
                    : "No countdown — take your time, only an elapsed clock runs."}
                </p>
              </div>

              <button
                onClick={start}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
              >
                <Dumbbell size={15} /> Start practice · {count} Qs
                <ArrowRight size={15} />
              </button>
              {isGuest && (
                <p className="text-center text-xs text-neutral-400">
                  You&apos;ll be asked to log in before the set loads — answers stay
                  protected.
                </p>
              )}
            </div>

            <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3 lg:sticky lg:top-24">
              <p className="font-display-hire text-[15px] font-extrabold tracking-tight">
                Practice vs Daily test
              </p>
              {[
                { t: "Random every time", d: "Each start reshuffles the bank." },
                { t: "Your filters", d: "Topic, difficulty, count and timer." },
                { t: "Zero stakes", d: "No leaderboard, streak or coins." },
              ].map((r) => (
                <div key={r.t} className="rounded-xl bg-neutral-50 px-3.5 py-3">
                  <p className="text-[13px] font-bold">{r.t}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">{r.d}</p>
                </div>
              ))}
              <Link
                href="/hire/dsa/daily"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-bold text-amber-900 hover:bg-amber-100"
              >
                <Trophy size={14} /> Daily test counts — take it
              </Link>
            </aside>
          </div>
        )}

        {phase === "loading" && (
          <div className="space-y-4 animate-pulse">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-3">
              <div className="h-4 w-full rounded bg-neutral-100" />
              <div className="h-4 w-5/6 rounded bg-neutral-100" />
              <div className="grid gap-2.5 pt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-[56px] rounded-xl bg-neutral-100" />
                ))}
              </div>
            </div>
            <p className="text-center text-[13px] font-medium text-neutral-500">
              Shuffling {count} questions{topic ? ` from ${topic}` : ""}…
            </p>
          </div>
        )}

        {(phase === "ready" || phase === "checking") && activeQuestion && (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-4 min-w-0">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="tabular-nums text-neutral-900">
                  Question {currentIdx + 1}{" "}
                  <span className="font-normal text-neutral-400">of {questions.length}</span>
                </span>
                <span className="tabular-nums text-neutral-500">
                  {answeredCount}/{questions.length} done
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200/70">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Question {currentIdx + 1} of {questions.length}
                      </p>
                      <LanguageBadge language={activeQuestion.language} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {activeQuestion.difficulty_level && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${difficultyStyle(activeQuestion.difficulty_level)}`}
                        >
                          <Gauge size={11} /> {activeQuestion.difficulty_level}
                        </span>
                      )}
                      {activeQuestion.subject && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                          <BookOpen size={11} /> {activeQuestion.subject}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 min-w-0">
                      <DsaQuestionBody html={activeQuestion.question} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label={`Options for question ${currentIdx + 1}`}>
                    {activeQuestion.options.map((opt, i) => {
                      const isSel = answers[activeQuestion.id] === opt;
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <button
                          key={i}
                          role="radio"
                          aria-checked={isSel}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [activeQuestion.id]: opt }))
                          }
                          className={`flex min-h-[56px] w-full cursor-pointer touch-manipulation items-center gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                            isSel
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                              : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-500"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold ${
                              isSel ? "bg-white/15 text-white" : "bg-neutral-100 text-neutral-500"
                            }`}
                            aria-hidden
                          >
                            {letter}
                          </span>
                          <DsaOptionHtml html={opt} />
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                              isSel ? "border-white bg-white text-neutral-900" : "border-neutral-200 text-transparent"
                            }`}
                            aria-hidden
                          >
                            <Check size={13} strokeWidth={3.5} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* bottom nav — phones only, sits above the app tab bar (matches daily) */}
              <div className="sticky bottom-[84px] z-10 flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-[0_8px_28px_rgba(0,0,0,0.10)] backdrop-blur lg:hidden">
                <button
                  onClick={() => setCurrentIdx((v) => Math.max(0, v - 1))}
                  disabled={currentIdx === 0}
                  className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => {
                      setCurrentIdx((v) => v + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
                  >
                    Next <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => void check()}
                    disabled={phase === "checking"}
                    className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Flag size={15} /> {phase === "checking" ? "Checking…" : "Submit practice"}
                  </button>
                )}
              </div>
            </div>

            <aside className="hidden lg:block sticky top-24 space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                    Your progress
                  </p>
                  <p className="text-xs font-bold tabular-nums">
                    {answeredCount}/{questions.length}
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, i) => {
                    const done = Boolean(answers[q.id]);
                    const cur = i === currentIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(i)}
                        aria-label={`Question ${i + 1}${done ? ", answered" : ""}`}
                        className={`flex h-10 cursor-pointer items-center justify-center rounded-lg text-[13px] font-bold tabular-nums border transition-colors ${
                          cur
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : done
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500"
                              : "border-neutral-200 bg-white text-neutral-400 hover:border-neutral-400"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                {/* nav under the side box — same orientation as daily */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentIdx((v) => Math.max(0, v - 1))}
                    disabled={currentIdx === 0}
                    className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-900 disabled:opacity-40"
                  >
                    <ChevronLeft size={15} /> Back
                  </button>
                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx((v) => v + 1)}
                      className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-neutral-900 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => void check()}
                      disabled={phase === "checking"}
                      className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Flag size={14} /> Submit
                    </button>
                  )}
                </div>
                <button
                  onClick={() => void check()}
                  disabled={phase === "checking"}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Flag size={14} /> Submit practice
                </button>
                <button
                  onClick={backToSetup}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-700 hover:border-neutral-900"
                >
                  <RotateCcw size={14} /> Change setup
                </button>
              </div>
            </aside>
          </div>
        )}

        {phase === "review" && (
          <div className="mx-auto max-w-[760px] space-y-5">
            <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-center shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                Practice score · not on leaderboard
              </p>
              <h2 className="font-display-hire mt-2 text-3xl font-extrabold tracking-tight tabular-nums">
                {totalScore}/{reviewItems.length}
              </h2>
              <p className="mt-1.5 text-[13px] text-neutral-500">
                {topic ?? "Mixed topics"}
                {difficulty ? ` · ${difficulty}` : ""} · {questions.length} questions
              </p>
              <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2.5">
                <button
                  onClick={start}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
                >
                  <RotateCcw size={14} /> New set · same setup
                </button>
                <button
                  onClick={backToSetup}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
                >
                  Change setup
                </button>
                <Link
                  href="/hire/dsa/daily"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 text-sm font-bold text-amber-900 hover:bg-amber-100"
                >
                  <Trophy size={14} /> Daily test
                </Link>
              </div>
            </div>

            <div className="space-y-3.5">
              {reviewItems.map((item, i) => (
                <article
                  key={item.mongo_question_id}
                  className={`rounded-2xl border bg-white p-5 sm:p-6 min-w-0 overflow-hidden ${
                    item.is_correct ? "border-emerald-200" : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                      Q{i + 1}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        item.is_correct
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : item.selected_answer
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-neutral-200 bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {item.is_correct ? (
                        <CheckCircle2 size={12} />
                      ) : item.selected_answer ? (
                        <XCircle size={12} />
                      ) : (
                        <MinusCircle size={12} />
                      )}
                      {item.is_correct ? "Right" : item.selected_answer ? "Wrong" : "Not attempted"}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                      <BookOpen size={11} /> {item.subject ?? topic ?? "DSA"}
                    </span>
                    <LanguageBadge language={item.language} />
                  </div>
                  <div className="mt-3 min-w-0">
                    <DsaQuestionBody html={item.question} />
                  </div>
                  <div className="mt-3.5 grid gap-2">
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                        Your answer
                      </p>
                      <div className="mt-1 text-sm font-semibold leading-relaxed text-neutral-900">
                        {item.selected_answer ? (
                          <DsaInlineHtml html={item.selected_answer} />
                        ) : (
                          "Not attempted (NA)"
                        )}
                      </div>
                    </div>
                    {!item.is_correct && item.correct_answer && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                          Right answer
                        </p>
                        <div className="mt-1 text-sm font-semibold leading-relaxed text-emerald-900">
                          <DsaInlineHtml html={item.correct_answer} />
                        </div>
                      </div>
                    )}
                    {item.solution && item.solution.trim() !== "" ? (
                      <div className="flex gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/50 p-3.5">
                        <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-600" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                            Solution
                          </p>
                          <DsaSolutionHtml html={item.solution} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3.5">
                        <Lightbulb size={15} className="mt-0.5 shrink-0 text-neutral-300" />
                        <p className="mt-0.5 text-sm italic text-neutral-400">
                          (Solution not available)
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center space-y-4">
            <p className="text-sm font-medium text-neutral-500">
              {error ?? "This practice set could not be loaded."}
            </p>
            <button
              onClick={backToSetup}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              <RotateCcw size={13} /> Back to setup
            </button>
          </div>
        )}

        {(phase === "ready" || phase === "checking") && (
          <div className="flex justify-center">
            <button
              onClick={backToSetup}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-neutral-400 hover:text-neutral-700"
            >
              <ChevronRight size={13} className="rotate-180" /> Quit & change setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
      }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      {typeof count === "number" && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
            active ? "bg-white/15 text-white" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
