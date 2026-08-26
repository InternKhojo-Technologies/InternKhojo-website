"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Check,
  ShieldCheck,
  Zap,
  Target,
  Users,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<string>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const urlRole = searchParams.get("role");

    if (urlRole) {
      const normalizedRole = urlRole.toLowerCase();

      if (normalizedRole === "candidate" || normalizedRole === "recruiter") {
        setRole(normalizedRole);
      }
    }
  }, [searchParams]);

  const handleSignup = async () => {
    if (!acceptedTerms) return;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const normalizedRole = role.toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: normalizedRole,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Account created successfully!");
      router.push(`/login?role=${normalizedRole}`);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    if (!acceptedTerms) return;

    const normalizedRole = role.toLowerCase();

    localStorage.setItem("signup_role", normalizedRole);

    const isLocalhost = window.location.hostname === "localhost";

    const redirectUrl = isLocalhost
      ? "http://localhost:3000/login"
      : "https://internkhojo.com/login";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      toast.error("Google authentication failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white antialiased select-none overflow-x-hidden">
      <Toaster position="top-center" richColors />

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-[50%] bg-[#fafafa] border-r border-gray-100 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="flex items-center gap-2.5 relative z-10">
          <img
            src="/logo-4.png"
            className="w-8 h-8 object-contain"
            alt="Logo"
          />
          <span className="font-black text-xl tracking-tighter text-black">
            InternKhojo.
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg w-full">
          {role === "candidate" ? (
            <div className="space-y-8 transition-opacity duration-200 opacity-100">
              <h2 className="text-5xl font-[950] tracking-tight leading-[1.05] text-black uppercase">
                Build Your Identity <br />
                on <span className="text-blue-600 italic">Proof of Work.</span>
              </h2>

              <p className="text-gray-500 font-medium text-lg leading-relaxed">
                Bypass legacy resumes and mechanical filters. InternKhojo
                connects you directly with top-tier tech startups and service
                platforms based on what you can actually build.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Zap size={16} />
                  </div>
                  Zero Ghosting — Live Application Status
                </div>

                <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Target size={16} />
                  </div>
                  Direct Access to Foundational Tech Roles
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 transition-opacity duration-200 opacity-100">
              <h2 className="text-5xl font-[950] tracking-tight leading-[1.05] text-black uppercase">
                Deploy Elite <br />
                Talent <span className="text-red-600">Pipelines.</span>
              </h2>

              <p className="text-gray-500 font-medium text-lg leading-relaxed">
                Stop parsing generic CVs. Source early-career developers,
                graphic professionals, and builders across Bharat through
                pre-vetted project repositories.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  Curation Engine via Practical Repos
                </div>

                <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                    <Users size={16} />
                  </div>
                  Built-in Pipeline Automation System
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest relative z-10">
          Standardizing early-career pathways // 2026
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center items-center px-6 sm:px-12 py-12 md:py-16 relative">
        {/* MOBILE HEADER */}
        <div className="flex lg:hidden items-center justify-center gap-2 mb-8 w-full">
          <img
            src="/logo-4.png"
            className="w-7 h-7 object-contain"
            alt="Logo"
          />
          <span className="font-black text-xl tracking-tighter text-black">
            InternKhojo.
          </span>
        </div>

        <div className="w-full max-w-[380px] flex flex-col">
          <h1 className="text-3xl font-[950] mb-1 tracking-tight uppercase text-gray-900 text-center lg:text-left">
            Create Account
          </h1>

          <p className="text-sm text-gray-400 mb-8 font-medium text-center lg:text-left">
            Initialize your credentials as a {role}
          </p>

          {/* ROLE SWITCH */}
          <div className="flex mb-6 bg-gray-50 border border-gray-100 p-1 rounded-2xl w-full relative">
            <button
              type="button"
              onClick={() => {
                setRole("candidate");
                router.push("/signup?role=candidate", {
                  scroll: false,
                });
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors duration-300 relative z-10 ${
                role === "candidate"
                  ? "text-white"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              Candidate
              {role === "candidate" && (
                <motion.div
                  layoutId="active-signup-pill"
                  className="absolute inset-0 bg-black rounded-xl -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("recruiter");
                router.push("/signup?role=recruiter", {
                  scroll: false,
                });
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors duration-300 relative z-10 ${
                role === "recruiter"
                  ? "text-white"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              Recruiter
              {role === "recruiter" && (
                <motion.div
                  layoutId="active-signup-pill"
                  className="absolute inset-0 bg-black rounded-xl -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-3.5">
            <div className="relative group">
              <Mail
                className="absolute left-4 top-4 text-gray-400 group-focus-within:text-black transition-colors"
                size={16}
              />

              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock
                className="absolute left-4 top-4 text-gray-400 group-focus-within:text-black transition-colors"
                size={16}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* TERMS */}
          <div className="flex items-start gap-3 mt-5 px-0.5">
            <div
              className="flex items-center mt-0.5 cursor-pointer"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
            >
              <div
                className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${
                  acceptedTerms
                    ? role === "recruiter"
                      ? "bg-red-600 border-red-600"
                      : "bg-blue-600 border-blue-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {acceptedTerms && (
                  <Check size={12} className="text-white stroke-[4]" />
                )}
              </div>
            </div>

            <label className="text-xs text-gray-400 font-semibold leading-normal select-none">
              I accept all the{" "}
              <Link
                href="/terms"
                className="text-black font-black hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-black font-black hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              of the company.
            </label>
          </div>

          {/* ACTIONS */}
          <div className="space-y-3.5 mt-6">
            <button
              onClick={handleSignup}
              disabled={loading || !acceptedTerms}
              className={`w-full text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ${
                !acceptedTerms
                  ? "opacity-25 cursor-not-allowed bg-black"
                  : role === "recruiter"
                    ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/10"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10"
              }`}
            >
              {loading ? "Creating..." : "Continue"}
            </button>

            <div className="flex items-center my-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
              <div className="flex-1 h-[1px] bg-gray-100" />
              <span className="px-3">or</span>
              <div className="flex-1 h-[1px] bg-gray-100" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={!acceptedTerms}
              className={`w-full border border-gray-200 py-3.5 rounded-xl text-sm font-bold text-gray-700 bg-white flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${
                !acceptedTerms
                  ? "opacity-35 cursor-not-allowed"
                  : "hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {/* Google Logo */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.65-5.17 3.65-8.58Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.88-3.05c-1.08.72-2.45 1.16-3.4 1.16-2.61 0-4.82-1.76-5.61-4.12H2.36v3.16C4.18 22.01 7.82 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.39 15.33a7.16 7.16 0 0 1 0-4.66V7.51H2.36a11.93 11.93 0 0 0 0 9.98l4.03-3.16Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.62 0 3.06.56 4.21 1.66L19.1 3.5C17.26 1.79 14.77.75 12 .75 7.82.75 4.18 2.74 2.36 6.35l4.03 3.16c.79-2.36 3-4.12 5.61-4.12Z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            Already have an account?{" "}
            <span
              className="text-black font-black hover:underline cursor-pointer ml-1"
              onClick={() => router.push(`/login?role=${role}`)}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
