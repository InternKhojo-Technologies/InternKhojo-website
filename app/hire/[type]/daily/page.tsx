"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getCategoryMeta, normalizeCategory } from "@/lib/hire-categories";
import {
  formatMsCompact,
  todayDateString,
  type HireAttempt,
  type HireReviewItem,
  type HireSafeQuestion,
} from "@/lib/hire-types";
import {
  beautifyOption,
  beautifySolutionSteps,
  beautifyText,
} from "@/lib/beautify-math";
import ElapsedTimer from "@/app/hire/_components/elapsed-timer";
import {
  Timer,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  XCircle,
  MinusCircle,
  Trophy,
  ShieldAlert,
  RotateCcw,
  Activity,
  Lightbulb,
  History,
  ChevronLeft,
  ChevronRight,
  Flag,
  BookOpen,
  Tag,
  Gauge,
  Target,
} from "lucide-react";

type Phase = "checking" | "ready" | "submitting" | "completed" | "error";

interface HistoryEntry {
  id: string;
  attempt_date: string;
  total_score: number;
  total_time_ms: number;
}

interface SubmitPayload {
  answers: Record<string, string>;
  total_time_ms: number;
}

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

function storageKey(slug: string): string {
  return `hire:daily:${slug}:${todayDateString()}`;
}

function readStoredProgress(slug: string): {
  questions: HireSafeQuestion[];
  answers: Record<string, string>;
  startedAt: number;
} | null {
  try {
    const raw = sessionStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      questions?: HireSafeQuestion[];
      answers?: Record<string, string>;
      startedAt?: number;
    };
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
    return {
      questions: parsed.questions,
      answers:
        parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function writeStoredProgress(
  slug: string,
  questions: HireSafeQuestion[],
  answers: Record<string, string>,
  startedAt: number
) {
  try {
    sessionStorage.setItem(
      storageKey(slug),
      JSON.stringify({ questions, answers, startedAt })
    );
  } catch {
    // storage is best-effort (private mode etc.)
  }
}

function clearStoredProgress(slug: string) {
  try {
    sessionStorage.removeItem(storageKey(slug));
  } catch {
    // ignore
  }
}

function CheckingSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4 animate-pulse">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-3">
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-5/6 rounded bg-neutral-100" />
          <div className="grid gap-2.5 pt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[60px] rounded-xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-3 animate-pulse">
          <div className="h-3 w-24 rounded bg-neutral-100" />
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Question number grid. Jump anywhere — answered, skipped or new. */
function Palette({
  questions,
  answers,
  current,
  onJump,
  columns = "grid-cols-5",
}: {
  questions: HireSafeQuestion[];
  answers: Record<string, string>;
  current: number;
  onJump: (i: number) => void;
  columns?: string;
}) {
  return (
    <div className={`grid ${columns} gap-1.5`} role="tablist" aria-label="Question navigator">
      {questions.map((q, i) => {
        const done = Boolean(answers[q.id]);
        const isCurrent = i === current;
        return (
          <button
            key={q.id}
            role="tab"
            aria-selected={isCurrent}
            aria-label={`Question ${i + 1}${done ? ", answered" : ", not answered"}`}
            onClick={() => onJump(i)}
            className={`flex h-10 cursor-pointer touch-manipulation items-center justify-center rounded-lg text-[13px] font-bold tabular-nums border transition-colors sm:h-11 ${
              isCurrent
                ? "border-neutral-900 bg-neutral-900 text-white"
                : done
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500"
                  : "border-neutral-200 bg-white text-neutral-400 hover:border-neutral-400 hover:text-neutral-700"
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

/** Difficulty / subject / subtopic chips shown on the question + in review. */
function MetaChips({
  difficulty,
  subject,
  subtopic,
}: {
  difficulty?: string;
  subject?: string;
  subtopic?: string;
}) {
  const diffColor =
    difficulty?.toLowerCase() === "easy"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : difficulty?.toLowerCase() === "hard"
        ? "bg-red-50 text-red-700 ring-red-200"
        : "bg-amber-50 text-amber-800 ring-amber-200";
  return (
    <div className="flex flex-wrap gap-1.5">
      {difficulty && (
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${diffColor}`}>
          <Gauge size={11} /> {difficulty}
        </span>
      )}
      {subject && (
        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
          <BookOpen size={11} /> {subject}
        </span>
      )}
      {subtopic && (
        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
          <Tag size={11} /> {subtopic}
        </span>
      )}
    </div>
  );
}

/** "Good for: Placements, Bank Exams" — where this question helps. */
function TargetsBox({ targets }: { targets?: string[] }) {
  if (!targets || targets.length === 0) return null;
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
        <Target size={11} /> Good for
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {targets.map((t) => (
          <span
            key={t}
            className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DailyTestRunner() {
  const params = useParams();
  const router = useRouter();
  const rawType = params?.type;
  const slug = normalizeCategory(Array.isArray(rawType) ? rawType[0] : rawType);
  const meta = slug ? getCategoryMeta(slug) : null;

  const [phase, setPhase] = useState<Phase>("checking");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<HireSafeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answersLog, setAnswersLog] = useState<Record<string, string>>({});

  const [elapsedAnchor, setElapsedAnchor] = useState(() => Date.now());
  const startTimeRef = useRef<number>(elapsedAnchor);
  const lastPayloadRef = useRef<SubmitPayload | null>(null);
  // Deep link from /hire/history: ?review=<attemptId> opens that try directly.
  const reviewRef = useRef<string | null>(
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("review")
  );

  const [attempt, setAttempt] = useState<HireAttempt | null>(null);
  const [reviewItems, setReviewItems] = useState<HireReviewItem[]>([]);
  const [viewingPastId, setViewingPastId] = useState<string | null>(null);
  // Coins credited for THIS submit (from POST /api/hire/submit). Null on
  // past-try views and when the payout was skipped/failed.
  const [coinsEarned, setCoinsEarned] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  // True when boot was asked for a ?review= try that could not be loaded.
  // Shows a clear error instead of falling through to today's test UI.
  const [reviewFailed, setReviewFailed] = useState(false);

  const restartClock = useCallback((from: number) => {
    startTimeRef.current = from;
    setElapsedAnchor(from);
  }, []);

  useEffect(() => {
    if (!slug || phase !== "ready" || questions.length === 0) return;
    writeStoredProgress(slug, questions, answersLog, startTimeRef.current);
  }, [slug, phase, questions, answersLog]);

  const loadHistory = useCallback(async () => {
    if (!slug) return;
    setLoadingHistory(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";
      const res = await fetch("/api/hire/stats?limit=20", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const json = await res.json();
      const recent = (json?.stats?.recentAttempts ?? []) as Array<{
        id: string;
        category: string;
        attempt_date: string;
        total_score: number;
        total_time_ms: number;
      }>;
      setHistory(
        recent
          .filter((r) => r.category === slug)
          .map((r) => ({
            id: r.id,
            attempt_date: r.attempt_date,
            total_score: r.total_score,
            total_time_ms: r.total_time_ms,
          }))
      );
    } catch {
      // history is best-effort
    } finally {
      setLoadingHistory(false);
    }
  }, [slug]);

  // Identity + today's status + question set all resolve together — boot
  // waits on the slowest call only. A ?review= id opens that past try first.
  const boot = useCallback(async () => {
    if (!slug || !meta) {
      setPhase("error");
      setLoadError("Unknown test topic. Pick a valid topic from the list.");
      return;
    }
    setPhase("checking");
    setLoadError(null);
    setSubmitError(null);
    setReviewFailed(false);
    try {
      const sessionP = supabase.auth.getSession();
      const userP = supabase.auth.getUser();
      const headersP = sessionP.then(({ data }) => {
        const token = data.session?.access_token ?? "";
        return (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit;
      });
      const getJson = (url: string) =>
        headersP.then(async (headers) => {
          const res = await fetch(url, { headers });
          if (res.status === 401) throw new Error("__AUTH__");
          const json = await res.json();
          return { ok: res.ok, status: res.status, json };
        });
      const attemptP = getJson(`/api/hire/attempt?category=${encodeURIComponent(slug)}`);
      const questionsP = getJson(`/api/hire/questions?category=${encodeURIComponent(slug)}`);

      const [{ data: userData }, attemptRes, qRes] = await Promise.all([
        userP,
        attemptP,
        questionsP,
      ]);
      if (!userData.user) {
        router.push(`/login?redirect=/hire/${slug}/daily`);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();
      const userRole = (profile as { role?: string } | null)?.role ?? "candidate";
      if (userRole === "recruiter") {
        setPhase("error");
        setLoadError("__RECRUITER__");
        return;
      }
      const headers = await headersP;

      // Deep-linked past try (from /hire/history) wins over everything.
      // If it fails to load we STOP with a clear error — falling through
      // to today's test would show a quiz to attempt, which is exactly the
      // confusion reported for blank/partial submits.
      const reviewId = reviewRef.current;
      if (reviewId) {
        reviewRef.current = null;
        interface ReviewPayload {
          attempt?: HireAttempt;
          items?: HireReviewItem[];
          error?: string;
        }
        let reviewData: ReviewPayload | null = null;
        let reviewResOk = false;
        try {
          const res = await fetch(
            `/api/hire/attempt?category=${encodeURIComponent(slug)}&attempt_id=${encodeURIComponent(reviewId)}`,
            { headers }
          );
          reviewResOk = res.ok;
          reviewData = (await res.json()) as ReviewPayload;
        } catch {
          reviewResOk = false;
          reviewData = null;
        }
        if (reviewResOk && reviewData?.attempt) {
          setAttempt(reviewData.attempt);
          setReviewItems((reviewData.items ?? []) as HireReviewItem[]);
          setViewingPastId(reviewId);
          setCoinsEarned(null);
          setPhase("completed");
          loadHistory();
          return;
        }
        router.replace(`/hire/${slug}/daily`);
        setReviewFailed(true);
        setPhase("error");
        setLoadError(
          reviewData?.error === "Attempt not found."
            ? "That past try couldn't be opened — it may have been removed. Your other tries are safe below."
            : "That past try couldn't be loaded right now. Retry — your answers are saved."
        );
        return;
      }

      if (!attemptRes.ok) {
        throw new Error(attemptRes.json?.error || "Could not check today's test.");
      }
      if (attemptRes.json.completed) {
        clearStoredProgress(slug);
        setAttempt(attemptRes.json.attempt as HireAttempt);
        setReviewItems((attemptRes.json.items ?? []) as HireReviewItem[]);
        setCoinsEarned(null);
        setPhase("completed");
        loadHistory();
        return;
      }

      if (!qRes.ok) {
        throw new Error(qRes.json?.error || "Could not load questions.");
      }
      const qs = (qRes.json.questions ?? []) as HireSafeQuestion[];
      if (qs.length === 0) throw new Error("No questions in this topic yet — check back soon.");

      const stored = readStoredProgress(slug);
      const storedAnswers: Record<string, string> = {};
      if (stored) {
        const freshIds = new Set(qs.map((q) => q.id));
        for (const [k, v] of Object.entries(stored.answers)) {
          if (freshIds.has(k) && typeof v === "string" && v !== "") {
            storedAnswers[k] = v;
          }
        }
      }
      const startedAt = Date.now() - elapsedMsRefSafe(stored);
      setQuestions(qs);
      setCurrentIdx(0);
      setAnswersLog(storedAnswers);
      lastPayloadRef.current = null;
      setPhase("ready");
      restartClock(startedAt);
      loadHistory();
    } catch (e) {
      if (e instanceof Error && e.message === "__AUTH__") {
        router.push(`/login?redirect=/hire/${slug}/daily`);
        return;
      }
      setPhase("error");
      setLoadError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }, [slug, meta, router, restartClock, loadHistory]);

  useEffect(() => {
    boot();
  }, [boot]);

  const activeQuestion = questions[currentIdx];
  const selectedForActive = activeQuestion ? answersLog[activeQuestion.id] ?? null : null;
  const answeredCount = questions.filter((q) => answersLog[q.id]).length;
  const unansweredCount = questions.length - answeredCount;
  const questionTotal =
    questions.length > 0
      ? questions.length
      : reviewItems.length > 0
        ? reviewItems.length
        : 10;

  const scrollTopOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /** Low-level sender: posts the given payload, never touches questions. */
  const doSubmit = useCallback(
    async (payload: SubmitPayload) => {
      if (!slug) return;
      setPhase("submitting");
      setSubmitError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? "";
        const res = await fetch("/api/hire/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            category: slug,
            answers: payload.answers,
            total_time_ms: payload.total_time_ms,
          }),
        });
        const json = await res.json();
        if (res.status === 409) {
          const {
            data: { session: session2 },
          } = await supabase.auth.getSession();
          const token2 = session2?.access_token ?? "";
          const retry = await fetch(
            `/api/hire/attempt?category=${encodeURIComponent(slug)}`,
            { headers: token2 ? { Authorization: `Bearer ${token2}` } : {} }
          );
          const retryJson = await retry.json();
          if (retry.ok && retryJson.completed) {
            clearStoredProgress(slug);
            setAttempt(retryJson.attempt as HireAttempt);
            setReviewItems((retryJson.items ?? []) as HireReviewItem[]);
            setCoinsEarned(null);
            setPhase("completed");
            loadHistory();
            return;
          }
          throw new Error(json?.error || "Already submitted today.");
        }
        if (!res.ok) throw new Error(json?.error || "Submission failed.");
        clearStoredProgress(slug);
        setAttempt(json.attempt as HireAttempt);
        setReviewItems((json.items ?? []) as HireReviewItem[]);
        setCoinsEarned(
          typeof json?.coins_credited?.total === "number"
            ? (json.coins_credited.total as number)
            : null
        );
        setPhase("completed");
        loadHistory();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        restartClock(Date.now() - payload.total_time_ms);
        setPhase("ready");
        setSubmitError(
          e instanceof Error
            ? `${e.message} Your answers are saved — retry to submit the same test.`
            : "Submission failed. Your answers are saved — please retry."
        );
      }
    },
    [slug, loadHistory, restartClock]
  );

  const submit = useCallback(async () => {
    if (phase !== "ready") return;
    const unanswered = questions.filter((q) => !answersLog[q.id]).length;
    if (unanswered > 0) {
      const ok = window.confirm(
        `${unanswered} question${unanswered > 1 ? "s are" : " is"} still blank and will be marked wrong. Submit anyway?`
      );
      if (!ok) return;
    }
    const totalTimeMs = Date.now() - startTimeRef.current;
    // Send the FULL set — blanks go as "" so skipped questions are stored
    // too and show up in review with their answers + solutions.
    const fullAnswers: Record<string, string> = {};
    for (const q of questions) fullAnswers[q.id] = answersLog[q.id] ?? "";
    const payload: SubmitPayload = {
      answers: fullAnswers,
      total_time_ms: totalTimeMs,
    };
    lastPayloadRef.current = payload;
    await doSubmit(payload);
  }, [phase, questions, answersLog, doSubmit]);

  /** Retry re-sends the stored payload verbatim — no re-fetch, no reset. */
  const retrySubmit = useCallback(async () => {
    const payload = lastPayloadRef.current;
    if (!payload) {
      await submit();
      return;
    }
    const refreshed: SubmitPayload = {
      answers: { ...payload.answers },
      total_time_ms: Date.now() - startTimeRef.current,
    };
    lastPayloadRef.current = refreshed;
    await doSubmit(refreshed);
  }, [doSubmit, submit]);

  // Free movement: jump anywhere, skip anything. Nothing is forced —
  // unanswered questions simply count as wrong on submit.
  const goNextCb = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      scrollTopOnMobile();
    } else {
      void submit();
    }
  }, [currentIdx, questions.length, submit]);

  const goBackCb = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      scrollTopOnMobile();
    }
  }, [currentIdx]);

  const jumpCb = useCallback(() => {
    scrollTopOnMobile();
  }, []);

  // Keyboard-first answering: 1–6 / A–F select an option, → / Enter advance,
  // ← goes back. Enter on a focused button keeps its native click behavior.
  useEffect(() => {
    if (phase !== "ready" || !activeQuestion) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const numIdx = ["1", "2", "3", "4", "5", "6"].indexOf(k);
      const letterIdx = ["a", "b", "c", "d", "e", "f"].indexOf(k);
      const optIdx = numIdx >= 0 ? numIdx : letterIdx;
      if (optIdx >= 0 && optIdx < activeQuestion.options.length) {
        setSubmitError(null);
        const opt = activeQuestion.options[optIdx];
        setAnswersLog((prev) => ({ ...prev, [activeQuestion.id]: opt }));
        return;
      }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (e.key === "Enter" && document.activeElement?.tagName === "BUTTON") return;
        e.preventDefault();
        goNextCb();
      } else if (e.key === "ArrowLeft") {
        goBackCb();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, activeQuestion, goNextCb, goBackCb]);

  const loadPastAttempt = async (attemptId: string) => {
    try {
      setLoadError(null);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";
      const res = await fetch(
        `/api/hire/attempt?category=${encodeURIComponent(slug!)}&attempt_id=${encodeURIComponent(attemptId)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Could not load that try.");
      setAttempt(json.attempt as HireAttempt);
      setReviewItems((json.items ?? []) as HireReviewItem[]);
      setViewingPastId(attemptId);
      setCoinsEarned(null);
      setPhase("completed");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load that try.");
    }
  };

  const backToToday = async () => {
    reviewRef.current = null;
    setViewingPastId(null);
    router.replace(`/hire/${slug}/daily`);
    await boot();
  };

  // ── Recruiter view-only guard ──────────────────────────────────────────
  if (phase === "error" && loadError === "__RECRUITER__") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 pb-24">
        <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-12 space-y-5">
          <Link
            href="/hire"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft size={14} /> Practice tests
          </Link>
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-8 sm:p-10 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700">
              <ShieldAlert size={22} />
            </div>
            <h1 className="font-display-hire text-xl font-bold tracking-tight">Just looking around?</h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-600">
              You signed in as a recruiter, so you can&apos;t take tests — this
              keeps the leaderboard fair for students. You can still see all
              the rankings and scores.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 pt-2">
              <Link
                href="/hire/leaderboard"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
              >
                <Trophy size={14} /> Open leaderboard
              </Link>
              <Link
                href="/hire"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
              >
                Browse topics
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased pb-28">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5">
        <Link
          href="/hire"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft size={14} /> Practice tests
        </Link>

        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              {(meta?.title ?? slug ?? "…").toUpperCase()}
            </p>
            <h1 className="font-display-hire mt-1.5 text-[26px] sm:text-3xl font-extrabold tracking-tight leading-none">
              {phase === "completed" ? "Answers & solutions" : "Today's test"}
            </h1>
            <p className="mt-1.5 text-[13px] text-neutral-500">
              Same {questionTotal} questions for everyone today · one try · jump
              anywhere, skip anything
            </p>
          </div>
          {phase === "ready" || phase === "submitting" ? (
            <div className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 font-mono text-[15px] font-bold tabular-nums shadow-sm">
              <Timer size={15} className="text-neutral-500" />
              <ElapsedTimer startedAt={elapsedAnchor} />
            </div>
          ) : attempt ? (
            <div className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 font-mono text-sm font-bold tabular-nums text-neutral-700 shadow-sm">
              <Timer size={14} className="text-neutral-400" />
              {formatMsCompact(attempt.total_time_ms)}
            </div>
          ) : null}
        </header>

        {loadError && loadError !== "__RECRUITER__" && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <p className="text-[13px] font-medium text-red-800">{loadError}</p>
            <button
              onClick={boot}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              <RotateCcw size={12} /> Retry
            </button>
          </div>
        )}

        {submitError && phase === "ready" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <p className="text-[13px] font-medium text-red-800">{submitError}</p>
            <button
              onClick={retrySubmit}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-neutral-700"
            >
              <RotateCcw size={12} /> Retry submission
            </button>
          </div>
        )}

        {phase === "checking" && <CheckingSkeleton />}

        {phase === "error" && loadError !== "__RECRUITER__" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center space-y-4">
            <p className="text-sm font-medium text-neutral-500">
              {reviewFailed && loadError ? loadError : "This test could not be loaded."}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {reviewFailed ? (
                <>
                  <button
                    onClick={() => void backToToday()}
                    className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
                  >
                    <RotateCcw size={13} /> Today&apos;s test
                  </button>
                  <Link
                    href="/hire/history"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
                  >
                    <History size={14} /> Past tries
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={boot}
                    className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
                  >
                    <RotateCcw size={13} /> Try again
                  </button>
                  <Link
                    href="/hire"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
                  >
                    All topics
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {(phase === "ready" || phase === "submitting") && activeQuestion && (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* ── main column ── */}
            <div className="space-y-4 min-w-0">
              {/* compact progress + palette for phones */}
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-sm space-y-3 lg:hidden">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="tabular-nums text-neutral-900">
                    Question {currentIdx + 1}{" "}
                    <span className="font-normal text-neutral-400">of {questions.length}</span>
                  </span>
                  <span className="tabular-nums text-neutral-500">
                    {answeredCount}/{questions.length} done
                    {unansweredCount > 0 && ` · ${unansweredCount} left`}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
                <Palette
                  questions={questions}
                  answers={answersLog}
                  current={currentIdx}
                  onJump={(i) => {
                    setCurrentIdx(i);
                    jumpCb();
                  }}
                />
                <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Answered
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded border border-neutral-300 bg-white" /> Blank
                  </span>
                </div>
                <TargetsBox targets={activeQuestion.targets} />
              </div>

              {/* question — slides in on every step */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Question {currentIdx + 1} of {questions.length}
                      </p>
                    </div>
                    <p className="mt-3 text-[16.5px] sm:text-[17px] font-medium leading-[1.65] text-neutral-900">
                      {beautifyText(activeQuestion.question)}
                    </p>
                    <div className="mt-4 border-t border-neutral-100 pt-3.5">
                      <MetaChips
                        difficulty={activeQuestion.difficulty_level}
                        subject={activeQuestion.subject}
                        subtopic={activeQuestion.subtopic}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label={`Options for question ${currentIdx + 1}`}>
                    {activeQuestion.options.map((opt, i) => {
                      const isSel = selectedForActive === opt;
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <motion.button
                          key={i}
                          role="radio"
                          aria-checked={isSel}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => {
                            setSubmitError(null);
                            setAnswersLog((prev) => ({ ...prev, [activeQuestion.id]: opt }));
                          }}
                          className={`flex min-h-[60px] w-full cursor-pointer touch-manipulation items-center gap-3.5 rounded-xl border p-4 text-left transition-colors ${
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
                          <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug break-words">
                            {beautifyOption(opt)}
                          </span>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                              isSel ? "border-white bg-white text-neutral-900" : "border-neutral-200 text-transparent"
                            }`}
                            aria-hidden
                          >
                            <Check size={13} strokeWidth={3.5} />
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* bottom nav — phones only, sits above the app tab bar */}
              <div className="sticky bottom-[84px] z-10 flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-[0_8px_28px_rgba(0,0,0,0.10)] backdrop-blur lg:hidden">
                <button
                  onClick={goBackCb}
                  disabled={currentIdx === 0 || phase === "submitting"}
                  className={`inline-flex h-12 shrink-0 cursor-pointer items-center gap-1 rounded-xl border px-4 text-sm font-semibold transition-colors touch-manipulation ${
                    currentIdx === 0
                      ? "border-neutral-100 bg-white text-neutral-300"
                      : "border-neutral-300 bg-white text-neutral-800 active:bg-neutral-100"
                  }`}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={goNextCb}
                  disabled={phase === "submitting"}
                  className="inline-flex h-12 flex-1 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 active:bg-neutral-800 disabled:opacity-60"
                >
                  {phase === "submitting"
                    ? "Submitting…"
                    : currentIdx === questions.length - 1
                      ? "Submit test"
                      : "Next"}
                  <ArrowRight size={15} />
                </button>
              </div>
              <p className="hidden sm:block text-center text-xs text-neutral-400 lg:hidden">
                Keys 1–{Math.min(6, activeQuestion.options.length)} answer · → next · ← back
              </p>
            </div>

            {/* ── side panel (desktop) ── */}
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
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
                <Palette
                  questions={questions}
                  answers={answersLog}
                  current={currentIdx}
                  onJump={(i) => setCurrentIdx(i)}
                />
                <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Answered
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded border border-neutral-300 bg-white" /> Blank
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-neutral-900" /> Current
                  </span>
                </div>
                <TargetsBox targets={activeQuestion.targets} />
                <div className="flex gap-2">
                  <button
                    onClick={goBackCb}
                    disabled={currentIdx === 0 || phase === "submitting"}
                    className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-900 disabled:opacity-40"
                  >
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button
                    onClick={goNextCb}
                    disabled={phase === "submitting"}
                    className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-neutral-900 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
                  >
                    {currentIdx === questions.length - 1 ? "Submit" : "Next"}
                    <ChevronRight size={15} />
                  </button>
                </div>
                <button
                  onClick={() => void submit()}
                  disabled={phase === "submitting"}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-60"
                >
                  <Flag size={14} /> Finish & submit
                  {unansweredCount > 0 && (
                    <span className="tabular-nums text-emerald-600">· {unansweredCount} blank</span>
                  )}
                </button>
                <p className="text-[11px] leading-relaxed text-neutral-400">
                  Blank answers count as wrong. You can jump to any question and
                  change answers until you submit.
                </p>
              </div>
            </aside>
          </div>
        )}

        {phase === "completed" && attempt && (
          <div className="mx-auto max-w-[760px] space-y-5">
            {/* score banner */}
            <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-center shadow-sm">
              <ScoreRing score={attempt.total_score} total={reviewItems.length || attempt.total_score || 10} />
              <h2 className="font-display-hire mt-4 text-3xl font-extrabold tracking-tight tabular-nums">
                {attempt.total_score}/{reviewItems.length || 10}
              </h2>
              <p className="mt-1.5 text-[13px] text-neutral-500">
                {prettyDate(attempt.attempt_date)} ·{" "}
                <span className="font-semibold tabular-nums text-neutral-800">
                  {formatMsCompact(attempt.total_time_ms)}
                </span>
                {viewingPastId ? " · showing an older try" : " · saved"}
              </p>
              {coinsEarned !== null && !viewingPastId && (
                <p className="mx-auto mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-[13px] font-bold tabular-nums text-amber-800 ring-1 ring-inset ring-amber-200">
                  🪙 +{coinsEarned.toFixed(2)} coins earned ·{" "}
                  <Link href="/rewards" className="underline underline-offset-2 hover:text-amber-900">
                    View rewards
                  </Link>
                </p>
              )}
              <div className="mt-5 grid grid-cols-3 divide-x divide-neutral-100 rounded-xl border border-neutral-100 bg-neutral-50/60 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Right</p>
                  <p className="font-display-hire mt-0.5 text-lg font-bold tabular-nums text-emerald-700">
                    {reviewItems.filter((r) => r.is_correct).length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Wrong</p>
                  <p className="font-display-hire mt-0.5 text-lg font-bold tabular-nums text-red-600">
                    {reviewItems.filter((r) => !r.is_correct && r.selected_answer).length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Not attempted</p>
                  <p className="font-display-hire mt-0.5 text-lg font-bold tabular-nums text-neutral-500">
                    {reviewItems.filter((r) => !r.selected_answer).length}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2.5">
                {viewingPastId && (
                  <button
                    onClick={backToToday}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
                  >
                    Today&apos;s answers
                  </button>
                )}
                <Link
                  href="/hire/leaderboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
                >
                  <Trophy size={14} /> Leaderboard
                </Link>
                <Link
                  href="/hire"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
                >
                  Other topics
                </Link>
              </div>
            </div>

            {/* review items */}
            <div className="space-y-3.5">
              {reviewItems.map((item, i) => (
                <article
                  key={item.mongo_question_id}
                  className={`rounded-2xl border bg-white p-5 sm:p-6 ${
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
                  <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-neutral-900">{beautifyText(item.question)}</p>
                  <div className="mt-3">
                    <MetaChips
                      difficulty={item.difficulty_level}
                      subject={item.subject}
                      subtopic={item.subtopic}
                    />
                  </div>
                  {item.targets && item.targets.length > 0 && (
                    <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wide text-[10px] text-neutral-400">
                        <Target size={11} /> Good for
                      </span>
                      {item.targets.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold text-neutral-600"
                        >
                          {t}
                        </span>
                      ))}
                    </p>
                  )}
                  <div className="mt-3.5 grid gap-2">
                    <div className={`rounded-xl border p-3.5 ${item.is_correct ? "border-emerald-200 bg-emerald-50/60" : "border-neutral-200 bg-neutral-50"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                        Your answer
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-neutral-900">
                        {item.selected_answer ? beautifyOption(item.selected_answer) : "Not attempted (NA)"}
                      </p>
                    </div>
                    {!item.is_correct && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                          Right answer
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-900">{beautifyOption(item.correct_answer) || "—"}</p>
                      </div>
                    )}
                    {item.solution && item.solution.trim() !== "" ? (
                      <div className="flex gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/50 p-3.5">
                        <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-600" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                            Solution
                          </p>
                          <div className="mt-1.5 space-y-2">
                            {beautifySolutionSteps(item.solution).map((step, si) => (
                              <p
                                key={si}
                                className="text-sm leading-[1.7] text-neutral-700"
                              >
                                {step}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3.5">
                        <Lightbulb size={15} className="mt-0.5 shrink-0 text-neutral-300" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                            Solution
                          </p>
                          <p className="mt-1 text-sm italic text-neutral-400">(Solution not available)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* history */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                <History size={13} /> Your past tries in {meta?.short ?? "topic"}
              </h3>
              {loadingHistory ? (
                <div className="mt-3 space-y-2 animate-pulse">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-neutral-100" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="mt-2 text-[13px] text-neutral-400">
                  No past tries yet — finish today&apos;s test and it will show up here.
                </p>
              ) : (
                <div className="mt-1 divide-y divide-neutral-100">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => loadPastAttempt(h.id)}
                      className="group flex w-full cursor-pointer items-center justify-between gap-3 py-3.5 text-left touch-manipulation"
                    >
                      <span className="text-sm font-medium tabular-nums text-neutral-700 group-active:text-neutral-900">
                        {prettyDate(h.attempt_date)} ·{" "}
                        <span className="font-bold text-neutral-900">{h.total_score}/10</span> ·{" "}
                        {formatMsCompact(h.total_time_ms)}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-neutral-400 group-active:text-neutral-900">
                        {h.id === attempt.id && !viewingPastId ? "Current" : <>Answers <ChevronRight size={13} /></>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <Link
                href="/hire/history"
                className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-neutral-700 hover:text-neutral-900"
              >
                All tries across topics <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {phase === "submitting" && (
          <div className="flex items-center justify-center gap-2 text-neutral-500 py-6">
            <Activity size={14} className="animate-spin" />
            <span className="text-[13px] font-medium">Checking your answers…</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Circular score gauge for the review banner. Pure SVG, no animation libs. */
function ScoreRing({ score, total }: { score: number; total: number }) {
  const safeTotal = Math.max(1, total);
  const pct = Math.min(1, Math.max(0, score / safeTotal));
  const r = 30;
  const c = 2 * Math.PI * r;
  const good = pct >= 0.7;
  const mid = pct >= 0.4;
  const stroke = good ? "#047857" : mid ? "#b45309" : "#dc2626";
  return (
    <div className="relative mx-auto h-24 w-24">
      <svg viewBox="0 0 72 72" className="h-24 w-24 -rotate-90" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f0ede8" strokeWidth="8" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display-hire text-lg font-extrabold tabular-nums text-neutral-900">
          {score}/{safeTotal}
        </span>
      </div>
    </div>
  );
}

/** Elapsed offset carried over from a stored in-progress session, if any. */
function elapsedMsRefSafe(
  stored: { startedAt: number } | null
): number {
  if (!stored || typeof stored.startedAt !== "number") return 0;
  const elapsed = Date.now() - stored.startedAt;
  if (!Number.isFinite(elapsed) || elapsed < 0) return 0;
  // Sanity cap: 3h (mirrors the server cap).
  return Math.min(elapsed, 3 * 60 * 60 * 1000);
}
