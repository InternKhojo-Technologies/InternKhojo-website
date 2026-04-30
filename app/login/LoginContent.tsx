"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Mail, Lock, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

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
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast.error("Error fetching profile");
        return;
      }
      // 🔥 If profile doesn't exist → create it USING signup_role
      if (!profile) {
        const savedRole =
          localStorage.getItem("signup_role") ||
          searchParams.get("role") ||
          "candidate";

        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          role: savedRole,
        });

        if (insertError) {
          toast.error("Profile creation failed");
        }

        localStorage.removeItem("signup_role");

        if (savedRole === "recruiter") {
          router.push("/dashboard/recruiter");
        } else {
          router.push("/find/jobs");
        }

        return;
      }

      const finalRole = profile.role;

      localStorage.removeItem("signup_role");

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

    if (error) toast.error("Google login failed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-[400px]">
        <h1 className="text-4xl font-bold text-center mb-6">Welcome Back</h1>

        <div className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full mt-5 bg-black text-white py-3 rounded-xl flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign In"}
        </button>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 border py-3 rounded-xl"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
