"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users,
  Sparkles,
  MessageSquare,
  Briefcase,
  Video,
  Bell,
  CheckCircle2,
  ArrowRight,
  X,
  UserCheck,
  Award,
} from "lucide-react";

export default function MentorStagingPage() {
  const router = useRouter();
  // NOTE: no `mounted`/full-page loading gate here on purpose — the hero,
  // waitlist modal and preview content are static and must paint from SSR
  // HTML immediately. evaluateUser() below only prefills the email field
  // and waitlist status as progressive enhancement.
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Waitlist Modal States (Forced Open)
  const [notifyModalOpen, setNotifyModalOpen] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"candidate" | "mentor">(
    "candidate",
  );
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Toast Alert State
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
    evaluateUser();
  }, []);

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const evaluateUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setSessionUser(user);
        setEmailInput(user.email || "");
      }

      const localWaitlist = localStorage.getItem("waitlist_mentor_network");
      if (localWaitlist) setAlreadyApplied(true);
    } catch (err) {
      console.error("User sync error:", err);
    }
  };

  // REDIRECT TO HOME ON CANCEL/CROSS CLICK
  const handleExitToHome = () => {
    router.push("/");
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) return;

    setSubmittingEmail(true);

    try {
      const { data: existing } = await supabase
        .from("waitlist")
        .select("id")
        .eq("email", cleanEmail)
        .eq("source", "mentor_network");

      if (existing && existing.length > 0) {
        setAlreadyApplied(true);
        localStorage.setItem("waitlist_mentor_network", cleanEmail);
        triggerToast("You are already registered on the Mentor waitlist!");
        setSubmittingEmail(false);
        return;
      }

      const { error } = await supabase.from("waitlist").insert({
        email: cleanEmail,
        role: selectedRole,
        user_id: sessionUser?.id || null,
        source: "mentor_network",
      });

      if (error) {
        if (error.code === "23505") {
          setAlreadyApplied(true);
          localStorage.setItem("waitlist_mentor_network", cleanEmail);
          triggerToast("You are already registered on the Mentor waitlist!");
        } else {
          throw error;
        }
      } else {
        setAlreadyApplied(true);
        localStorage.setItem("waitlist_mentor_network", cleanEmail);
        triggerToast("Saved! Registered for the Mentor Network Early Pass!");
      }
    } catch (err: any) {
      console.error("Waitlist Error:", err);
      triggerToast(err.message || "Failed to join waitlist", "error");
    } finally {
      setSubmittingEmail(false);
    }
  };

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

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-32 antialiased relative overflow-hidden">
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" />

      {/* TOAST ALERT */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            role="status"
            className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${
              toast.type === "error"
                ? "bg-red-950 text-red-200 border-red-800"
                : "bg-neutral-950 text-neutral-100 border-neutral-800"
            }`}
          >
            <Sparkles size={16} className="text-[#FF3B30]" />
            <span className="text-xs font-bold leading-none">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 POPUP WINDOW WITH REDIRECT ON EXIT */}
      <AnimatePresence>
        {notifyModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[150] flex items-center justify-center p-4 cursor-pointer"
            onClick={handleExitToHome}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mentor-waitlist-title"
              className="bg-white rounded-[2.5rem] border border-neutral-200/80 p-8 sm:p-10 max-w-md w-full shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative space-y-6 cursor-default"
            >
              <button
                onClick={handleExitToHome}
                aria-label="Close and return to home"
                className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors p-2 rounded-full hover:bg-neutral-100 cursor-pointer"
                title="Return to Home"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                <Award size={22} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Building Phase Active
                </div>
                <h3 id="mentor-waitlist-title" className="text-2xl font-black text-neutral-950 tracking-tight">
                  Join Mentor Network Waitlist
                </h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  We are actively onboarding tech leads, product managers, and
                  quant veterans. Reserve your spot early.
                </p>
              </div>

              {alreadyApplied ? (
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-3 text-emerald-800">
                  <CheckCircle2
                    size={20}
                    className="text-emerald-600 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide">
                      Already Registered
                    </p>
                    <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                      Your email is queued on our mentor priority pass list.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-email" className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Your Email Address
                    </label>
                    <input
                      id="mentor-email"
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-xs font-bold outline-none focus:border-black transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="mentor-interest" className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Select Your Interest
                    </label>
                    <select
                      id="mentor-interest"
                      value={selectedRole}
                      onChange={(e: any) => setSelectedRole(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-xs font-bold outline-none focus:border-black cursor-pointer"
                    >
                      <option value="candidate">
                        I want Mentorship (Mentee / Student)
                      </option>
                      <option value="mentor">
                        I want to become a Mentor (Expert / Leader)
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEmail}
                    className="w-full bg-black text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {submittingEmail
                      ? "Registering..."
                      : "Join Priority Roster"}
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-12 sm:pt-20 space-y-12 sm:space-y-16 relative z-10 pointer-events-none select-none blur-sm">
        {/* HERO BANNER SECTION */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-8 sm:p-14 text-white overflow-hidden shadow-2xl border border-neutral-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Verified Professional Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
              Mentor Networks<span className="text-[#FF3B30]">.</span>
            </h1>

            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-medium">
              Connect 1-on-1 with industry veterans from premium institutions
              and companies. Get direct resume breakdowns, mock interview
              simulations, and specialized tech guidance.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button className="bg-white text-black px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                {alreadyApplied ? (
                  <UserCheck size={14} className="text-emerald-600" />
                ) : (
                  <Users size={14} />
                )}
                {alreadyApplied ? "Already Registered" : "Join Mentor Waitlist"}
              </button>
            </div>
          </div>
        </div>

        {/* FEATURED MENTORS GRID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-4">
            <h2 className="text-lg font-black tracking-tight text-neutral-950 uppercase flex items-center gap-2">
              <Users size={18} className="text-emerald-600" /> Featured
              Ecosystem Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {placeholderMentors.map((mentor, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200/80 rounded-3xl p-6 flex flex-col justify-between relative shadow-sm"
              >
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-100 w-fit">
                    {mentor.tag}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-neutral-900 tracking-tight leading-none">
                      {mentor.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium">
                      {mentor.role}
                    </p>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                    {mentor.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 mt-6 flex items-center justify-between text-neutral-400 text-xs font-semibold">
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
