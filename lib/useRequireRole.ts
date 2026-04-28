"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useRequireRole(requiredRole: string) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ❌ Not logged in
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // 🔥 Get profile
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // ❌ No profile
    if (!data) {
      window.location.href = "/";
      return;
    }

    // ❌ Wrong role
    if (data.role !== requiredRole) {
      window.location.href = "/";
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  return { loading, profile };
}
