"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id);

    if (!apps) return;

    const jobIds = apps.map((a) => a.job_id).filter(Boolean);

    // Supabase rejects `.in()` with an empty list — skip the second query.
    if (jobIds.length === 0) {
      setApplications(apps);
      return;
    }

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .in("id", jobIds);

    const merged = apps.map((a) => ({
      ...a,
      job: jobs?.find(
        (j) => j.id === a.job_id
      ),
    }));

    setApplications(merged);
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-20 w-full">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <div className="mt-8 space-y-4">

          {applications.length === 0 && (
            <p className="text-gray-500">
              You haven&apos;t applied to any jobs yet.
            </p>
          )}

          {applications.map((app) => (

            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl"
            >

              <h2>
                {app.job?.title}
              </h2>

              <p>
                {app.job?.type}
              </p>

              <p>
                Status:
                {" "}
                <b>
                  {app.status}
                </b>
              </p>

              <Link
                href={`/find/jobs/${app.job_id}`}
                className="text-blue-600"
              >
                View job
              </Link>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}