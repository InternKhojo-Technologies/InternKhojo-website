"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Mail, Lock } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<string>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole) setRole(urlRole.toLowerCase());
  }, [searchParams]);

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        role: role.toLowerCase(),
      });
      toast.success("Account created successfully!");
      router.push(`/login?role=${role}`);
    }
  };

  const handleGoogle = async () => {
    localStorage.setItem("signup_role", role.toLowerCase());
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/login` },
    });
    if (error) toast.error("Google authentication failed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF] font-sans text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white px-6">
      <Toaster position="top-center" expand={false} richColors />

      <div className="w-full max-w-[400px]">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Create Account
          </h1>
          <p className="text-[13px] text-zinc-500 mt-3 font-medium">
            Join InternKhojo to start your journey.
          </p>
        </header>

        {/* Smoothened Role Toggle */}
        <div className="relative p-1 bg-zinc-100 rounded-xl flex mb-8 border border-zinc-200/50 overflow-hidden">
          {/* Animated Slider Pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-zinc-200/50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              role === "recruiter" ? "translate-x-full" : "translate-x-0"
            }`}
          />

          <button
            onClick={() => {
              setRole("candidate");
              router.push("/signup?role=candidate", { scroll: false });
            }}
            className={`relative z-10 flex-1 py-2.5 text-[13px] font-bold transition-colors duration-300 ${
              role === "candidate" ? "text-zinc-900" : "text-zinc-500"
            }`}
          >
            Candidate
          </button>
          <button
            onClick={() => {
              setRole("recruiter");
              router.push("/signup?role=recruiter", { scroll: false });
            }}
            className={`relative z-10 flex-1 py-2.5 text-[13px] font-bold transition-colors duration-300 ${
              role === "recruiter" ? "text-zinc-900" : "text-zinc-500"
            }`}
          >
            Recruiter
          </button>
        </div>

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
              placeholder="Create password"
              className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full mt-6 bg-zinc-900 text-white py-3 rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? "Creating account..." : "Continue"}
          <ChevronRight size={16} />
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100"></div>
          </div>
          <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <span className="bg-white px-4">Social Access</span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full border border-zinc-200 rounded-xl py-3 flex items-center justify-center gap-3 text-[14px] font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.99]"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-4 h-4"
          />
          Sign up with Google
        </button>

        <div className="mt-8 text-center">
          <p className="text-[13px] font-medium text-zinc-500">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-zinc-900 font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      <footer className="mt-12 text-[11px] text-zinc-400 font-medium max-w-[300px] text-center leading-relaxed">
        By continuing, you agree to our{" "}
        <span className="text-zinc-900 cursor-pointer hover:underline">
          Terms
        </span>{" "}
        and{" "}
        <span className="text-zinc-900 cursor-pointer hover:underline">
          Privacy Policy
        </span>
        .
      </footer>
    </div>
  );
}
