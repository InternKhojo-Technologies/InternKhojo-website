"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, ShieldAlert, Lock, Activity, Sparkles } from "lucide-react";

export default function GlobalHirePage() {
  const router = useRouter();

  // Hydration Sync Guard
  const [mounted, setMounted] = useState(false);

  // System Mappings
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"candidate" | "recruiter" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Custom Floating Toast Alert State
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
    evaluateIdentityMetrics();
  }, []);

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const evaluateIdentityMetrics = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setSessionUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    } catch (err) {
      console.error("Identity core sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const masterChallenges = [
    {
      title: "Quantitative Aptitude",
      desc: "Speed calculations, advanced pattern analysis, and quantitative placement parameters.",
      scope: "General Screening",
    },
    {
      title: "Analytical Crosswords",
      desc: "Critical interview riddles and technical crosswords testing out-of-the-box logic.",
      scope: "Brain Teasers",
    },
    {
      title: "Algorithmic Logic (DSA)",
      desc: "Data structures logic, string/array processing, and runtime complexity simulations.",
      scope: "Core Engineering",
    },
    {
      title: "Financial Modeling Loop",
      desc: "Company valuation matrix, balance sheet analytics, and quick financial ratio benchmarks.",
      scope: "Finance & Analytics",
    },
    {
      title: "Growth Hack Simulator",
      desc: "Funnel performance challenge. Rapid analysis of CAC, LTV, ROAS, and live digital marketing loops.",
      scope: "Growth Marketing",
    },
    {
      title: "UI/UX Heuristic Review",
      desc: "Spot layout hierarchy flaws, accessibility standards, and user psychology law violations.",
      scope: "Product & Design",
    },
    {
      title: "Query Optimizer Arena",
      desc: "Fix broken database structures, optimize relational schema indices, and raw join alignments.",
      scope: "Systems & Backend",
    },
  ];

  if (!mounted) return null;

  if (loading)
    return (
      <div className="h-screen w-full bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="flex items-center gap-3">
          <Activity size={14} className="animate-spin text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-500 tracking-tight">
            Loading details...
          </span>
        </div>
      </div>
    );

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-32 antialiased relative">
      {/* TOAST REGISTRATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] flex items-center gap-3 bg-neutral-950 text-neutral-100 px-4 py-3 rounded-xl shadow-xl border border-neutral-800"
          >
            <span className="text-xs font-medium leading-none truncate">
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-12 sm:pt-24 space-y-12 sm:space-y-16">
        {/* ================= MODERN PREMIUM HEADER ================= */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-200/50 pb-8 sm:pb-10 gap-6">
          <div className="space-y-3 w-full md:max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
              Staging Mode Active
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
              InternKhojo Battlegrounds<span className="text-[#FF3B30]">.</span>
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed font-medium">
              Interactive assessment modules mapped to evaluate your real-time
              skills and speed across key domains. Complete daily tracks to get
              direct visibility from top recruiters.
            </p>
          </div>

          <div className="w-full md:w-auto flex-shrink-0">
            <button
              onClick={() =>
                triggerToast(
                  "Global rankings will initialize once the daily rounds go live.",
                  "error",
                )
              }
              className="w-full md:w-auto bg-neutral-950 text-white px-5 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-sm"
            >
              <Trophy size={14} /> View Global Standings
            </button>
          </div>
        </header>

        {/* RECRUITER NOTICE VIEWPORT */}
        {sessionUser && userRole === "recruiter" && (
          <div className="bg-neutral-950 text-neutral-200 p-4 sm:p-5 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={16}
                className="text-neutral-400 mt-0.5 md:mt-0 flex-shrink-0"
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white tracking-tight">
                  Corporate Access Account
                </h4>
                <p className="text-xs text-neutral-400 font-medium">
                  Daily challenges are exclusive to candidate profiles.
                  Recruiter monitors will be available on full launch.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= CLEAN PRODUCT CARD BENTO GRID ================= */}
        <div className="space-y-6">
          <div className="text-xs font-bold text-neutral-400 tracking-tight uppercase">
            Select Your Arena
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative">
            {masterChallenges.map((game, i) => {
              return (
                <div
                  key={i}
                  className="bg-white border border-neutral-200/60 rounded-2xl p-6 flex flex-col justify-between min-h-[190px] sm:min-h-[210px] opacity-35 select-none pointer-events-none transition-all duration-150 relative shadow-sm"
                >
                  {/* Card Content Top */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold text-neutral-400 tracking-tight">
                      {game.scope}
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 tracking-tight leading-none">
                      {game.title}
                    </h3>

                    <p className="text-xs text-neutral-400 leading-relaxed font-medium pr-1">
                      {game.desc}
                    </p>
                  </div>

                  {/* Locked Bottom Trigger Layout */}
                  <div className="pt-4 border-t border-neutral-100 mt-4">
                    <div className="w-full bg-neutral-50 text-neutral-400 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-100">
                      Locked <Lock size={12} className="text-neutral-300" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 🔥 MODERN FLOATING GLASS BANNER SHEET OVERLAY */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-transparent pointer-events-auto">
              <div className="bg-white border border-neutral-200/80 p-6 sm:p-8 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.06)] max-w-sm space-y-4">
                <div className="w-10 h-10 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full flex items-center justify-center mx-auto">
                  <Sparkles size={16} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-950 tracking-tight">
                    Launching Very Soon
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    We are currently populating live premium question pools for
                    each track. Daily technical rounds will open up shortly.
                  </p>
                </div>
                <div className="inline-block text-[10px] font-semibold px-3 py-1 bg-neutral-50 rounded-full border border-neutral-200 text-neutral-500 tracking-tight">
                  Status: Getting Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
