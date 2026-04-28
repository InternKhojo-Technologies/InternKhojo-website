"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

    const jobIds = apps.map((a) => a.job_id);

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

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-20">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <div className="mt-8 space-y-4">

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

      <Footer />

    </div>
  );
}