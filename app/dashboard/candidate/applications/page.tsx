"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// 🔥 time ago helper
function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  const days = Math.floor(diff / 86400);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;

  const hours = Math.floor(diff / 3600);
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""} ago`;

  const minutes = Math.floor(diff / 60);
  if (minutes > 0) return `${minutes} min ago`;

  return "Just now";
}

// 🔥 status color
function getStatusColor(stage: string) {
  switch (stage) {
    case "shortlisted":
      return "bg-yellow-100 text-yellow-700";
    case "interview":
      return "bg-blue-100 text-blue-700";
    case "hired":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false); // ✅ FIX (was missing)
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        jobs!applications_job_id_fkey (
          id,
          title,
          stipend,
          location,
          companies (name, logo_url)
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setApplications([]);
      setLoading(false);
      return;
    }

    setApplications(data || []);
    setLoading(false);
  };

  const withdrawApplication = async (id: string) => {
    const confirmDelete = confirm("Withdraw this application?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return <div className="p-6">Loading applications...</div>;
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">My Applications</h1>

        {applications.length === 0 && (
          <p className="text-gray-500 mt-6">
            You haven’t applied to any jobs yet.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <div
              key={app.id} // ✅ FIX (important)
              onClick={() =>
                app.jobs?.id && router.push(`/find/jobs/${app.jobs.id}`)
              }
              className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  {/* LOGO */}
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {app.jobs?.companies?.logo_url ? (
                      <img
                        src={app.jobs.companies.logo_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {app.jobs?.companies?.name?.[0]}
                      </span>
                    )}
                  </div>

                  {/* TEXT */}
                  <div>
                    <h2 className="font-semibold">
                      {app.jobs?.title || "Job"}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {app.jobs?.companies?.name}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Applied {timeAgo(app.created_at)}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-xs rounded-lg font-medium capitalize ${getStatusColor(
                      app.stage || "pending",
                    )}`}
                  >
                    {app.stage || "pending"}
                  </span>

                  <p className="text-xs text-gray-400 mt-2">
                    {app.jobs?.location || "Remote"}
                  </p>

                  {/* 🔥 WITHDRAW BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ VERY IMPORTANT
                      withdrawApplication(app.id);
                    }}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
