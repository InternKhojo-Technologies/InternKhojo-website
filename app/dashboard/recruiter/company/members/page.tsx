"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { send } from "process";
import posthog from "posthog-js";

export default function CompanyMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) return;

    setCompanyId(profile.company_id);

    const { data } = await supabase
      .from("company_members")
      .select(
        `
        *,
        profiles (
          name,
          email
        )
      `,
      )
      .eq("company_id", profile.company_id);

    setMembers(data || []);
  };

  const sendInvite = async () => {
    if (!email || !companyId) return;

    const { error } = await supabase.from("company_invites").insert({
      email,
      company_id: companyId,
      role: "recruiter",
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      posthog.capture("company_member_invited", {
        company_id: companyId,
        invite_role: "recruiter",
      });
    }
    alert("Invite sent (user will join after signup)");
    setEmail("");
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Company Members</h1>

      {/* ADD MEMBER */}
      <div className="mt-6 flex gap-3">
        <input
          placeholder="Invite via Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 bg-white rounded-lg"
        />

        <button
          onClick={sendInvite}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Member
        </button>
      </div>

      {/* MEMBERS LIST */}
      <div className="mt-6 space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="bg-white p-4 rounded-xl shadow-sm flex justify-between"
          >
            <div>
              <p className="font-medium">{m.profiles?.name || "No Name"}</p>

              <p className="text-sm text-gray-500">{m.profiles?.email}</p>
            </div>

            <span className="text-sm text-gray-400">{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
