"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Mail, Lock } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function SignupContent() {
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 🔥 Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      // 🔥 Only create profile ONCE
      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          role: role.toLowerCase(),
        });
      }

      toast.success("Account created successfully!");
      router.push(`/login?role=${role}`);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    localStorage.setItem("signup_role", role.toLowerCase());

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

    if (error) toast.error("Google authentication failed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-[400px]">
        <h1 className="text-4xl font-bold text-center mb-6">Create Account</h1>

        {/* Role Toggle */}
        <div className="flex mb-6 border rounded-xl overflow-hidden">
          <button
            onClick={() => {
              setRole("candidate");
              router.push("/signup?role=candidate", { scroll: false });
            }}
            className={`flex-1 py-2 font-bold ${
              role === "candidate" ? "bg-black text-white" : ""
            }`}
          >
            Candidate
          </button>

          <button
            onClick={() => {
              setRole("recruiter");
              router.push("/signup?role=recruiter", { scroll: false });
            }}
            className={`flex-1 py-2 font-bold ${
              role === "recruiter" ? "bg-black text-white" : ""
            }`}
          >
            Recruiter
          </button>
        </div>

        {/* Inputs */}
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

        {/* Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full mt-5 bg-black text-white py-3 rounded-xl"
        >
          {loading ? "Creating..." : "Continue"}
        </button>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full mt-4 border py-3 rounded-xl"
        >
          Sign up with Google
        </button>

        {/* Login link */}
        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <span
            className="font-bold cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
