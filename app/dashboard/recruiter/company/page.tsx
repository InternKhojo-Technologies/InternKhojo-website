"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function CompanyPage() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      setLoading(false);
      return;
    }

    if (!name) {
      alert("Company name required");
      setLoading(false);
      return;
    }

    // 🔥 PREVENT DUPLICATE COMPANY
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (existing) {
      alert("You already created a company");
      setLoading(false);
      return;
    }

    // 🔥 CREATE COMPANY
    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        name,
        website,
        description,
        owner_id: user.id,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 🔥 UPDATE PROFILE
    await supabase
      .from("profiles")
      .update({
        company_id: company.id,
      })
      .eq("id", user.id);

    // 🔥 ADD TO MEMBERS TABLE
    const { error: memberError } = await supabase
      .from("company_members")
      .insert({
        company_id: company.id,
        user_id: user.id,
        role: "admin",
      });

    if (memberError) {
      console.error(memberError);
    }

    alert("Company created successfully!");
    window.location.href = "/dashboard/recruiter";
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-20 pb-20 w-full">
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-gray-500 mt-2">Add your company details</p>

        <div className="mt-6 space-y-4">
          <input
            placeholder="Company name"
            className="w-full bg-white rounded-lg px-4 py-3 shadow-sm outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Website"
            className="w-full bg-white rounded-lg px-4 py-3 shadow-sm outline-none"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full bg-white rounded-lg px-4 py-3 shadow-sm outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg w-full"
          >
            {loading ? "Creating..." : "Save company"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
