"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

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

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, []);

  const loadJob = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`*, companies(name, logo_url)`)
      .eq("id", jobId)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setJob(data);
    setLoading(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!job) return <div className="p-6">Job not found</div>;

  return (
    <div className="bg-[#F5F6F8] min-h-screen p-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
              {job.companies?.logo_url ? (
                <img
                  src={job.companies.logo_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{job.companies?.name?.[0]}</span>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">
                {job.companies?.name} • {timeAgo(job.created_at)}
              </p>

              <h1 className="text-2xl font-semibold">{job.title}</h1>
            </div>
          </div>

          {/* SKILLS */}
          <div className="flex gap-2 mt-5 flex-wrap">
            {job.skills?.map((skill: string, i: number) => (
              <span
                key={i}
                className="text-xs bg-gray-100 px-3 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className="mt-8">
            <h2 className="font-semibold mb-2">Job Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {job.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit sticky top-6">
          <ApplyButton job={job} />

          <div className="mt-6 space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Stipend</p>
              <p className="font-medium">{job.stipend || "Unpaid"}</p>
            </div>

            <div>
              <p className="text-gray-400">Location</p>
              <p className="font-medium">{job.location || "Remote"}</p>
            </div>

            <div>
              <p className="text-gray-400">Type</p>
              <p className="font-medium">{job.job_type}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔥 APPLY MODAL SYSTEM
function ApplyButton({ job }: { job: any }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("resume_url")
      .eq("id", user.id)
      .single();

    if (!profile?.resume_url) {
      alert("Upload resume first");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", job.id)
      .eq("user_id", user.id);

    if (existing && existing.length > 0) {
      alert("Already applied");
      setLoading(false);
      return;
    }

    if (job.questions?.length > 0) {
      if (Object.keys(answers).length !== job.questions.length) {
        alert("Please answer all questions");
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("applications").insert({
      job_id: job.id,
      user_id: user.id,
      stage: "pending",
      answers,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Applied successfully!");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          console.log("CLICKED APPLY"); // 👈 ADD THIS
          setOpen(true);
        }}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        Apply now
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">
              Apply for {job.title}
            </h2>

            {job.questions?.length > 0 ? (
              <div className="space-y-4">
                {job.questions.map((q: string, i: number) => (
                  <div key={i}>
                    <p className="text-sm mb-1">{q}</p>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [i]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No additional questions</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={apply}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                {loading ? "Applying..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
