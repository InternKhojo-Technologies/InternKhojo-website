"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users,
  Sparkles,
  Activity,
  MessageSquare,
  Briefcase,
  Video,
} from "lucide-react";

export default function MentorStagingPage() {
  // Hydration Sync Guard
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom Floating Toast Alert State
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  useEffect(() => {
    setMounted(true);
    // Mimic authentication mapping setup token load
    const timer = setTimeout(() => setLoading(false), 8000000 / 10000000); // Quick sync fade
    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 4000);
  };

  // Mock Premium Mentor Cards to set up beautiful blurred contours
  const placeholderMentors = [
    {
      name: "Amanpreet Singh",
      role: "Staff Software Engineer @ Google",
      tag: "Tech & Core Architecture",
      bio: "Ex-Directi. Specialized in scaling distributed microservices and advanced DSA system rounds layout design.",
    },
    {
      name: "Riya Sharma",
      role: "Product Manager @ McKinsey & Co",
      tag: "Product & Strategy",
      bio: "Helping students crack product management roles, case interviews, and strategy roadmaps mechanics.",
    },
    {
      name: "Karan Malhotra",
      role: "Quantitative Analyst @ AlphaGrep",
      tag: "Finance & Analytics",
      bio: "High-frequency trading desk veteran. Expert in algorithmic mathematics, financial loops, and mental shortcuts.",
    },
  ];

  if (!mounted) return null;

  if (loading)
    return (
      <div className="h-screen w-full bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="flex items-center gap-3">
          <Activity size={14} className="animate-spin text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-500 tracking-tight">
            Syncing connection...
          </span>
        </div>
      </div>
    );

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-32 antialiased relative">
      {/* MINIMAL TOAST ALERT */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] bg-neutral-950 text-neutral-100 px-4 py-3 rounded-xl shadow-xl border border-neutral-800"
          >
            <span className="text-xs font-medium leading-none truncate">
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-12 sm:pt-24 space-y-12 sm:space-y-16">
        {/* ================= MODERN PREMIUM NAV HEADER ================= */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-200/50 pb-8 sm:pb-10 gap-6">
          <div className="space-y-3 w-full md:max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Verified Professional Roster
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
              Mentor Networks<span className="text-[#FF3B30]">.</span>
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed font-medium">
              Connect 1-on-1 with industry veterans from premium institutions
              and companies. Get direct resume breakdowns, mock interview
              simulations, and specialized tech guidance.
            </p>
          </div>

          <div className="w-full md:w-auto flex-shrink-0">
            <button
              onClick={() =>
                triggerToast(
                  "Mentor scheduling streams will open up along with profile dashboard synchronizations.",
                )
              }
              className="w-full md:w-auto bg-neutral-950 text-white px-5 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-sm"
            >
              <Users size={14} /> Browse All Mentors
            </button>
          </div>
        </header>

        {/* ================= GRID WITH LIVE COMING SOON BLUR ================= */}
        <div className="space-y-6">
          <div className="text-xs font-bold text-neutral-400 tracking-tight uppercase">
            Featured Ecosystem Leaders
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative">
            {placeholderMentors.map((mentor, i) => {
              return (
                <div
                  key={i}
                  className="bg-white border border-neutral-200/60 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] opacity-30 select-none pointer-events-none transition-all duration-150 relative shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Top Meta Tag */}
                    <div className="text-[11px] font-semibold text-neutral-400 tracking-tight">
                      {mentor.tag}
                    </div>

                    {/* Name & Title */}
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-neutral-900 tracking-tight leading-none">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        {mentor.role}
                      </p>
                    </div>

                    {/* Bio text */}
                    <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                      {mentor.bio}
                    </p>
                  </div>

                  {/* Operational Shortcuts Mock Blocks */}
                  <div className="pt-4 border-t border-neutral-100 mt-6 flex items-center justify-between text-neutral-300 text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} /> Chat
                    </span>
                    <span className="flex items-center gap-1">
                      <Video size={12} /> 1:1 Meet
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} /> Referrals
                    </span>
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
                    Mentor Profiles Initializing
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    We are currently onboarding top-tier software engineers,
                    product experts, and consultants. Session scheduling booking
                    channels will activate soon.
                  </p>
                </div>
                <div className="inline-block text-[10px] font-semibold px-3 py-1 bg-neutral-50 rounded-full border border-neutral-200 text-neutral-500 tracking-tight">
                  Status: Verification Pending
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
