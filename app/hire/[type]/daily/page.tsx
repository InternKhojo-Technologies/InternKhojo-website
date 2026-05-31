"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import {
  Timer,
  Terminal,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Activity,
} from "lucide-react";

// =========================================================================
// THE MASTER DATA POOL (ALL 7 RECRUITMENT DOMAINS)
// =========================================================================

const APTITUDE_POOL = [
  {
    id: "apt-01",
    question:
      "In a high-frequency trading server architecture, 1% of the connected node ports experience sudden memory leaks. A real-time automation watch script detects 90% of actual leaks, but has a 5% false-positive rate on healthy nodes. If a node triggers an alert loop, what is the exact probability that it actually has a memory leak?",
    options: ["15.3%", "23.1%", "90.0%", "8.2%"],
    correct: "15.3%",
    hint: "Apply Bayes Theorem: P(Leak|Alert) = P(Alert|Leak) * P(Leak) / P(Alert).",
  },
];

const PUZZLE_POOL = [
  {
    id: "puz-01",
    question:
      "Three ants are sitting on the three corners of an equilateral triangle. Each ant randomly chooses a direction and starts moving along the edge of the triangle. What is the probability that none of the ants collide with each other?",
    options: ["0.25 (25%)", "0.50 (50%)", "0.125 (12.5%)", "0.33 (33.3%)"],
    correct: "0.25 (25%)",
    hint: "Collision only avoids if all ants move clockwise or all move counter-clockwise.",
  },
];

const DSA_POOL = [
  {
    id: "dsa-01",
    question:
      "Given an array of integers 'nums' and an integer 'target', you need to find the indices of two numbers such that they add up to the target. To optimize for Tier-1 engineering benchmarks, what is the best achievable time complexity?",
    options: [
      "O(N^2) Space-Efficient",
      "O(N log N) Sorted Pivot",
      "O(N) Hash Map Optimization",
      "O(1) Constant",
    ],
    correct: "O(N) Hash Map Optimization",
    hint: "Using a single pass with a companion hash map yields sub-linear lookups.",
  },
];

const FINANCE_POOL = [
  {
    id: "fin-01",
    question:
      "An organization holds ₹5,00,500 in liquid cash equivalents and short-term market blocks, with total current liabilities locked at ₹2,50,250. Calculate the precise Acid-Test (Quick) Ratio metrics for this allocation stream.",
    options: ["1.5 : 1", "2.0 : 1", "0.75 : 1", "2.5 : 1"],
    correct: "2.0 : 1",
    hint: "Quick Ratio = (Current Assets - Inventory) / Current Liabilities.",
  },
];

const MARKETING_POOL = [
  {
    id: "mkt-01",
    question:
      "A product growth campaign reports a Customer Acquisition Cost (CAC) of ₹1,200. If the structural Lifetime Value (LTV) of the acquired cohort metrics computes to ₹4,800, what is the clear unit economic health ratio?",
    options: [
      "1:1 (Break-even)",
      "2:1 (Under-performing)",
      "4:1 (Highly Profitable)",
      "1:4 (Negative ROI)",
    ],
    correct: "4:1 (Highly Profitable)",
    hint: "LTV to CAC ratio over 3:1 is the healthy benchmark for enterprise startup trajectories.",
  },
];

const DESIGN_POOL = [
  {
    id: "dsn-01",
    question:
      "According to standard UI/UX Heuristic Evaluation rules (Jakob's Law), how should an automated service interface structure its interactive buttons and components?",
    options: [
      "Use extreme unconventional patterns to look creative",
      "Align layouts to match familiar mental models users already know",
      "Keep switching navigation flows per page to test alertness",
      "Avoid using any text labels to force minimalist abstract styles",
    ],
    correct: "Align layouts to match familiar mental models users already know",
    hint: "Users spend most of their time on other sites, meaning they prefer yours to work similarly.",
  },
];

const BACKEND_POOL = [
  {
    id: "bnd-01",
    question:
      "A high-traffic transaction log table lacks proper indexing on frequently filtered columns, causing massive sequential scans. Which database configuration block is best suited to index arbitrary JSONB query arrays?",
    options: [
      "B-Tree Index Path",
      "Hash Index Vector",
      "GIN (Generalized Inverted Index)",
      "Partial Cluster Map",
    ],
    correct: "GIN (Generalized Inverted Index)",
    hint: "GIN indexes are engineered to index composite components and multi-value parameters.",
  },
];

// =========================================================================

export default function ActiveGameArenaPage() {
  const params = useParams();
  const router = useRouter();
  const trackType = params?.type as string;

  // Hydration Guard
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Game State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answersLog, setAnswersLog] = useState<Record<string, string>>({});

  // Execution Metrics
  const [seconds, setSeconds] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Custom Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({
    show: false,
    msg: "",
    type: "success",
  });

  useEffect(() => {
    setMounted(true);
    fetchLiveChallengeMatrix();

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [trackType]);

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const fetchLiveChallengeMatrix = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: databasePool, error } = await supabase
        .from("game_challenges")
        .select("*")
        .eq("type", trackType);

      if (error) throw error;

      if (!databasePool || databasePool.length === 0) {
        triggerToast(
          "No active challenge sequence instances deployed for this branch",
          "error",
        );
        setTimeout(() => router.push("/hire"), 2000);
        return;
      }

      setQuestions(databasePool);
      startTimeRef.current = Date.now();
    } catch (err: any) {
      console.error("Failed to compile database stream:", err);
      triggerToast("Data extraction synchronization interrupted", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatClockTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (option: string) => {
    setSelectedAnswer(option);
  };

  const advanceSequenceRoute = () => {
    if (!selectedAnswer) {
      triggerToast("Please commit a matrix value sequence selection", "error");
      return;
    }

    const currentQuestion = questions[currentIdx];

    // ✨ TypeScript Explicit Record Definition - Fixes indexing type error
    const updatedAnswers: Record<string, string> = {
      ...answersLog,
      [currentQuestion.id]: selectedAnswer,
    };

    setAnswersLog(updatedAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(updatedAnswers[questions[currentIdx + 1].id] || null);
    } else {
      commitPipelineTransaction(updatedAnswers);
    }
  };

  const regressSequenceRoute = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setSelectedAnswer(answersLog[questions[currentIdx - 1].id] || null);
    }
  };

  const commitPipelineTransaction = async (
    finalAnswers: Record<string, string>,
  ) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmissionLoading(true);

    const totalDurationSeconds = Math.floor(
      (Date.now() - startTimeRef.current) / 1000,
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const insertPromises = questions.map((q) => {
        const isCorrect = finalAnswers[q.id] === q.correct_answer;
        return supabase.from("game_submissions").insert({
          user_id: user.id,
          challenge_id: q.id,
          game_type: trackType,
          time_taken_seconds: totalDurationSeconds / questions.length,
          points_awarded: isCorrect ? 10 : 0,
          is_correct: isCorrect,
        });
      });

      await Promise.all(insertPromises);
      setGameFinished(true);
    } catch (err) {
      console.error("Metrics submission commit transaction crashed:", err);
      triggerToast("Data stream submission pipeline sync error", "error");
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (!mounted) return null;

  if (loading || submissionLoading)
    return (
      <div className="h-screen w-full bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="flex items-center gap-2">
          <Activity size={12} className="animate-spin text-neutral-400" />
          <span className="text-[10px] font-mono tracking-wider text-neutral-400">
            PIPELINE_TRANSACTION_ACTIVE...
          </span>
        </div>
      </div>
    );

  const activeQuestion = questions[currentIdx];

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-32 antialiased">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-neutral-950 text-neutral-100 px-4 py-2.5 rounded border border-neutral-800 shadow-lg"
          >
            <Terminal size={12} className="text-neutral-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider leading-none">
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-12 sm:pt-20 space-y-8">
        {!gameFinished ? (
          <div className="space-y-8">
            <header className="flex items-center justify-between border-b border-neutral-200/60 pb-6">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#FF3B30] uppercase tracking-widest">
                  // TRACK_RUN: {trackType?.toUpperCase()}
                </span>
                <h1 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                  Segment Progress {currentIdx + 1}/{questions.length}
                </h1>
              </div>
              <div className="flex items-center gap-2 bg-white border border-neutral-200/60 px-3 py-1.5 rounded-lg font-mono text-xs font-bold shadow-sm">
                <Timer size={13} className="animate-pulse text-neutral-600" />
                <span>{formatClockTime(seconds)}</span>
              </div>
            </header>

            <div className="bg-white border border-neutral-200/60 p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
              <div className="text-[9px] font-mono text-neutral-300 font-bold tracking-wider">
                // EVALUATION_QUERY_STATEMENT
              </div>
              <p className="text-sm sm:text-base font-medium leading-relaxed text-neutral-900">
                {activeQuestion?.question}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeQuestion?.options.map((option: string, i: number) => {
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-4 text-left rounded-xl border text-xs sm:text-sm transition-colors duration-100 font-medium cursor-pointer flex justify-between items-center ${isSelected ? "bg-neutral-950 border-neutral-950 text-white" : "bg-white border-neutral-200/50 text-neutral-800 hover:bg-[#F9F9F9]"}`}
                  >
                    <span>{option}</span>
                    <span
                      className={`text-[10px] font-mono ${isSelected ? "text-neutral-400" : "text-neutral-200"}`}
                    >
                      [KEY_{i + 1}]
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200/40">
              <button
                onClick={regressSequenceRoute}
                disabled={currentIdx === 0}
                className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider rounded border transition-colors ${currentIdx === 0 ? "text-neutral-300 border-neutral-100 cursor-not-allowed" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"}`}
              >
                // BACK
              </button>
              <button
                onClick={advanceSequenceRoute}
                className="bg-neutral-950 text-white px-5 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#FF3B30] transition-colors cursor-pointer shadow-sm"
              >
                {currentIdx === questions.length - 1
                  ? "COMPILE RECORD"
                  : "NEXT VALUE"}{" "}
                <ArrowRight size={10} />
              </button>
            </div>

            {activeQuestion?.hint && (
              <div className="bg-neutral-50 border border-neutral-200/40 p-4 rounded-xl flex items-start gap-3">
                <HelpCircle
                  size={14}
                  className="text-neutral-400 mt-0.5 flex-shrink-0"
                />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                    Reference Hint Token
                  </span>
                  <p className="text-[11px] text-neutral-400 font-medium leading-normal">
                    {activeQuestion.hint}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200/60 p-8 rounded-xl text-center space-y-6 shadow-sm py-12"
          >
            <div className="w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle size={20} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black uppercase tracking-tight text-neutral-950">
                Submissions Log Compiled
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Your runtime calculations executed perfectly within{" "}
                <span className="text-neutral-900 font-bold font-mono">
                  [{formatClockTime(seconds)}]
                </span>{" "}
                parameters. Leadership logs upgraded.
              </p>
            </div>
            <button
              onClick={() => router.push("/hire")}
              className="bg-neutral-950 text-white px-5 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Return To Arena
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
