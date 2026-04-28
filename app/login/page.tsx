"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Mail, Lock, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
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
      const role =
        searchParams.get("role") ||
        localStorage.getItem("signup_role") ||
        "candidate";
      const finalRole = role.toLowerCase();

      // Professional background sync
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || "",
        role: finalRole,
      });

      if (error) {
        toast.error("Profile synchronization failed");
      }

      localStorage.removeItem("signup_role");
      window.history.replaceState({}, document.title, window.location.pathname);

      if (finalRole === "recruiter") {
        router.push("/dashboard/recruiter");
      } else {
        router.push("/find/jobs");
      }
    };

    handleSession();
  }, [searchParams, router]);

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

    toast.success("Welcome back");
    router.push(redirect);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/login` },
    });
    if (error) toast.error("Google login failed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF] font-sans text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white px-6">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-[400px]">
        {/* Header Section */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Welcome Back
          </h1>
          <p className="text-[13px] text-zinc-500 mt-3 font-medium">
            Sign in to your InternKhojo workspace.
          </p>
        </header>

        {/* Input Fields */}
        <div className="space-y-3">
          <div className="group relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
            />
            <input
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="group relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-zinc-900 text-white py-3 rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-zinc-100"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Sign In
              <ChevronRight size={16} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100"></div>
          </div>
          <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <span className="bg-white px-4">Secure Access</span>
          </div>
        </div>

        {/* Social Login */}
        <button
          onClick={handleGoogle}
          className="w-full border border-zinc-200 rounded-xl py-3 flex items-center justify-center gap-3 text-[14px] font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.99]"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-4 h-4"
            alt="Google"
          />
          Continue with Google
        </button>

        {/* Signup Link */}
        <div className="mt-8 text-center">
          <p className="text-[13px] font-medium text-zinc-500">
            New to InternKhojo?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-zinc-900 font-bold hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </div>

      {/* Footer Text */}
      <footer className="mt-12 text-[11px] text-zinc-400 font-medium max-w-[300px] text-center leading-relaxed">
        By signing in, you agree to our{" "}
        <span className="text-zinc-900 cursor-pointer">Terms</span>.
      </footer>
    </div>
  );
}
