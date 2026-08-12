"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Star, Check } from "lucide-react";

export function ReviewSection({
  user,
  role,
  name,
}: {
  user: any;
  role: string;
  name: string;
}) {
  const isCandidate = role !== "recruiter";
  const starFillClass = isCandidate
    ? "fill-blue-600 text-blue-600"
    : "fill-red-500 text-red-500";

  const [reviewType, setReviewType] = useState<"platform" | "company">(
    "platform",
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [designation, setDesignation] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [eligibleCompanies, setEligibleCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    if (isCandidate) {
      fetchAppliedCompanies();
    }
  }, [isCandidate, user?.id]);

  const fetchAppliedCompanies = async () => {
    if (!user?.id) return;
    setLoadingCompanies(true);

    try {
      const { data: apps, error: appErr } = await supabase
        .from("applications")
        .select("job_id, status, stage")
        .eq("user_id", user.id);

      if (appErr) throw appErr;

      if (apps && apps.length > 0) {
        const jobIds = [...new Set(apps.map((a: any) => a.job_id))].filter(
          Boolean,
        );

        if (jobIds.length > 0) {
          const { data: jobs, error: jobErr } = await supabase
            .from("jobs")
            .select("id, company_id, companies(id, name)")
            .in("id", jobIds);

          if (jobErr) throw jobErr;

          const uniqueCompanies = new Map();
          jobs?.forEach((j: any) => {
            const comp = j.companies;
            if (comp && comp.id && !uniqueCompanies.has(comp.id)) {
              uniqueCompanies.set(comp.id, {
                id: comp.id,
                name: comp.name || "Company",
              });
            }
          });

          const compList = Array.from(uniqueCompanies.values());
          setEligibleCompanies(compList);
          if (compList.length > 0) {
            setSelectedCompanyId(compList[0].id);
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching companies:", err.message);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please write your feedback before posting.");
      return;
    }

    setSubmitting(true);
    const t = toast.loading("Posting review...");

    try {
      const finalDesignation =
        designation.trim() || (isCandidate ? "Candidate" : "Recruiter");

      if (reviewType === "platform" || !isCandidate) {
        const { error } = await supabase.from("reviews").insert([
          {
            user_id: user.id,
            name: name || user.email?.split("@")[0] || "User",
            role: role === "recruiter" ? "Recruiter" : "Candidate",
            designation: finalDesignation,
            content: content.trim(),
            rating: rating,
            featured: false,
          },
        ]);
        if (error) throw error;
      } else {
        if (!selectedCompanyId) {
          toast.error("Please select a company to review.");
          setSubmitting(false);
          return;
        }

        const { error } = await supabase.from("company_reviews").insert([
          {
            user_id: user.id,
            company_id: selectedCompanyId,
            designation: finalDesignation,
            content: content.trim(),
            rating: rating,
          },
        ]);
        if (error) throw error;
      }

      toast.success("Review posted successfully!", { id: t });
      setContent("");
      setDesignation("");
      setRating(5);
    } catch (err: any) {
      toast.error(err.message || "Failed to post review", { id: t });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {isCandidate && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setReviewType("platform")}
            className={`p-5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
              reviewType === "platform"
                ? "border-black bg-gray-50/80 shadow-sm"
                : "border-gray-100 hover:border-gray-200 bg-white"
            }`}
          >
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">
                InternKhojo Platform
              </h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">
                Share your overall experience using the platform.
              </p>
            </div>
            {reviewType === "platform" && (
              <Check size={16} className="text-black ml-2 shrink-0" />
            )}
          </div>

          <div
            onClick={() => setReviewType("company")}
            className={`p-5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
              reviewType === "company"
                ? "border-black bg-gray-50/80 shadow-sm"
                : "border-gray-100 hover:border-gray-200 bg-white"
            }`}
          >
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">
                Applied Company
              </h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">
                Review a company you applied, interviewed, or worked with.
              </p>
            </div>
            {reviewType === "company" && (
              <Check size={16} className="text-black ml-2 shrink-0" />
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isCandidate && reviewType === "company" && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Select Company
            </label>
            {loadingCompanies ? (
              <div className="p-4 bg-gray-50 rounded-2xl text-xs font-bold text-gray-400 animate-pulse">
                Fetching your applied companies...
              </div>
            ) : eligibleCompanies.length > 0 ? (
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer"
              >
                {eligibleCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-5 bg-gray-50 rounded-2xl text-xs font-medium text-gray-500 border border-gray-100">
                No company applications found on your profile yet.
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            {isCandidate ? "Your Position / Designation" : "Company Position"}
          </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder={
              isCandidate
                ? "e.g. College Student, Software Intern, CS Student at TIET"
                : "e.g. Founder, CEO, HR Lead, Talent Acquisition"
            }
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Overall Rating — {hoverRating !== null ? hoverRating : rating} / 5.0
          </label>

          <div className="flex items-center gap-2 bg-gray-50 px-6 py-4 rounded-2xl w-fit">
            {[1, 2, 3, 4, 5].map((star) => {
              const activeVal = hoverRating !== null ? hoverRating : rating;
              const isFull = activeVal >= star;
              const isHalf = activeVal === star - 0.5;

              return (
                <div
                  key={star}
                  className="relative cursor-pointer group"
                  onMouseLeave={() => setHoverRating(null)}
                >
                  <div
                    className="absolute left-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => setHoverRating(star - 0.5)}
                    onClick={() => setRating(star - 0.5)}
                  />
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                  />

                  <div className="relative">
                    <Star
                      size={24}
                      className={`transition-colors ${
                        isFull ? starFillClass : "fill-gray-200 text-gray-200"
                      }`}
                    />
                    {isHalf && (
                      <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                        <Star size={24} className={starFillClass} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Your Experience
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              !isCandidate || reviewType === "platform"
                ? "What did you like about InternKhojo? Anything we can improve?"
                : "Describe your hiring, interview, or work experience..."
            }
            disabled={
              isCandidate &&
              reviewType === "company" &&
              eligibleCompanies.length === 0
            }
            className="w-full p-6 bg-gray-50 rounded-[2rem] border-none focus:ring-2 focus:ring-black outline-none font-medium min-h-[140px] text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={
            submitting ||
            (isCandidate &&
              reviewType === "company" &&
              eligibleCompanies.length === 0)
          }
          className="bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-40"
        >
          {submitting ? "Posting..." : "Post Review"}
        </button>
      </form>
    </div>
  );
}
