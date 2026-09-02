"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, KeyRound, Sparkles } from "lucide-react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import posthog from "posthog-js";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const user = session.user;

      /*
       * Google signup stores the selected role in localStorage
       * before OAuth starts.
       *
       * handle_new_user() runs before we return to /login and
       * creates the profile with the fallback role "candidate".
       *
       * Therefore, if signup_role exists, we use it to correct
       * the profile created during this Google signup flow.
       */
      const savedRole =
        localStorage.getItem("signup_role") || searchParams.get("role");

      const normalizedSavedRole =
        savedRole === "recruiter" || savedRole === "candidate"
          ? savedRole
          : null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        toast.error("Error fetching profile");
        return;
      }

      /*
       * If no profile exists, create one using the saved role.
       */
      if (!profile) {
        const finalRole = normalizedSavedRole || "candidate";

        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          role: finalRole,
        });

        if (insertError) {
          toast.error("Profile creation failed");
          return;
        }

        localStorage.removeItem("signup_role");

        if (finalRole === "recruiter") {
          router.push(redirect !== "/" ? redirect : "/dashboard/recruiter");
        } else {
          router.push(redirect !== "/" ? redirect : "/find/jobs");
        }

        return;
      }

      /*
       * IMPORTANT:
       *
       * For a fresh Google signup, handle_new_user() has already
       * created the profile with "candidate".
       *
       * If signup_role exists, this means the user came from the
       * signup flow and explicitly selected a role.
       *
       * Correct the role before redirecting.
       */
      if (normalizedSavedRole) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            role: normalizedSavedRole,
            email: user.email,
          })
          .eq("id", user.id);

        if (updateError) {
          toast.error("Unable to save account role");
          return;
        }

        localStorage.removeItem("signup_role");

        if (normalizedSavedRole === "recruiter") {
          router.push(redirect !== "/" ? redirect : "/dashboard/recruiter");
        } else {
          router.push(redirect !== "/" ? redirect : "/find/jobs");
        }

        return;
      }

      /*
       * Normal existing login.
       *
       * Never use localStorage here because there is no signup
       * role selection involved.
       */
      const finalRole = profile.role;

      if (finalRole === "recruiter") {
        router.push(redirect !== "/" ? redirect : "/dashboard/recruiter");
      } else {
        router.push(redirect !== "/" ? redirect : "/find/jobs");
      }
    };

    handleSession();
  }, [searchParams, router, redirect]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Enter your credentials");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      posthog.capture("user_logged_in", {
        authentication_method: "password",
      });
    }
    toast.success("Welcome back");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
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
      toast.error("Google login failed");
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
          <div className="space-y-8">
            <h2 className="text-5xl font-[950] tracking-tight leading-[1.05] text-black uppercase">
              Welcome Back to <br />
              the{" "}
              <span className="text-black italic underline decoration-red-600 decoration-4">
                Ecosystem.
              </span>
            </h2>

            <p className="text-gray-500 font-medium text-lg leading-relaxed">
              Log in to manage your active early-career applications, handle
              incoming talent assessment responses, or orchestrate
              high-authority boardroom interactions.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                  <KeyRound size={16} />
                </div>
                Robust Authentication Shield Protocol
              </div>

              <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
                  <Sparkles size={16} />
                </div>
                Cached Fast Session Dashboard Redirection
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest relative z-10">
          Standardizing early-career pathways // 2026
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center items-center px-6 sm:px-12 py-12 md:py-16 relative">
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
            Welcome Back
          </h1>

          <p className="text-sm text-gray-400 mb-8 font-medium text-center lg:text-left">
            Enter your credentials to enter the ecosystem
          </p>

          {/* LOGIN FIELDS */}
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

          {/* LOGIN ACTIONS */}
          <div className="space-y-3.5 mt-8">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-2 shadow-md shadow-black/5"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="flex items-center my-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
              <div className="flex-1 h-[1px] bg-gray-100" />
              <span className="px-3">or</span>
              <div className="flex-1 h-[1px] bg-gray-100" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full border border-gray-200 py-3.5 rounded-xl text-sm font-bold text-gray-700 bg-white flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] hover:bg-gray-50 hover:border-gray-300"
            >
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
              Continue with Google
            </button>
          </div>

          {/* SIGN UP */}
          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            Don't have an account?{" "}
            <Link
              className="text-black font-black hover:underline cursor-pointer ml-1"
              href="/signup"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
