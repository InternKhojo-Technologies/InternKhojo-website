"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Search,
  MapPin,
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Zap,
  Filter,
  Banknote,
} from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [titleQuery, setTitleQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [payType, setPayType] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("");

  const filterRef = useRef<HTMLDivElement>(null);

  // Click Outside to Close Filters Dropbox
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await supabase
        .from("jobs")
        .select(`*, companies(name, logo_url)`)
        .eq("status", "open")
        .order("created_at", { ascending: false });
      setJobs(data || []);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  // Filter Computation Match Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      const matchesTitle = job.title
        .toLowerCase()
        .includes(titleQuery.toLowerCase());
      const matchesLocation = (job.location || "")
        .toLowerCase()
        .includes(locationQuery.toLowerCase());

      const isPaid =
        job.stipend &&
        job.stipend !== "0" &&
        job.stipend.toLowerCase() !== "unpaid";
      const matchesPay =
        payType === "all" ? true : payType === "paid" ? isPaid : !isPaid;

      const matchesSkill =
        selectedSkill === ""
          ? true
          : job.skills?.some((s: string) =>
              s.toLowerCase().includes(selectedSkill.toLowerCase()),
            );

      return matchesTitle && matchesLocation && matchesPay && matchesSkill;
    });
  }, [jobs, titleQuery, locationQuery, payType, selectedSkill]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-black pb-20 select-none antialiased">
      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation & Header Controls */}
        <div className="pt-10 flex items-center justify-between gap-6 mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* 🔥 HIGH-PERFORMANCE RESPONSIVE FILTER BAR */}
        <div
          className="max-w-4xl mx-auto relative mb-16 w-full"
          ref={filterRef}
        >
          <div className="bg-white border border-slate-200 rounded-2xl md:rounded-full p-3 md:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-2 md:gap-0">
            {/* Input 1: Job Search */}
            <div className="flex items-center px-4 md:px-6 border-b md:border-b-0 md:border-r border-slate-100 py-3 md:py-0 w-full flex-1">
              <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
              <input
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                placeholder="Search position or key keywords..."
                className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              />
            </div>

            {/* Input 2: Location Search */}
            <div className="flex items-center px-4 md:px-6 py-3 md:py-0 w-full flex-1">
              <MapPin className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location / Remote"
                className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              />
            </div>

            {/* Actions Triggers */}
            <div className="flex items-center justify-between md:justify-end gap-2 pr-0 md:pr-2 w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3.5 rounded-xl md:rounded-full transition-all flex items-center justify-center ${
                  showFilters
                    ? "bg-slate-100 text-red-600"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>

              <button className="bg-slate-900 text-white px-8 md:px-10 py-3.5 rounded-xl md:rounded-full font-black text-xs uppercase tracking-wider hover:bg-black transition-all flex-1 md:flex-none text-center">
                Search
              </button>
            </div>
          </div>

          {/* DYNAMIC METRIC SELECTION DROPBOX */}
          {showFilters && (
            <div className="absolute top-full mt-4 left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left animate-in fade-in zoom-in-95 duration-150">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Compensation structure
                </p>
                <div className="flex flex-wrap gap-2">
                  {["all", "paid", "unpaid"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPayType(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        payType === t
                          ? "bg-red-600 border-red-600 text-white"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Target Competence / Skills
                </p>
                <input
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  placeholder="e.g. Next.js, Figma, Tailwind"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-black font-bold text-slate-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* Title Group */}
        <div className="flex items-center gap-3 mb-10">
          <Zap className="w-5 h-5 text-red-600 fill-red-600" />
          <h1 className="text-3xl font-[950] tracking-tight uppercase">
            Available <span className="text-red-600 italic">Opportunities</span>
          </h1>
        </div>

        {/* Side-by-Side Job Grid (Sleek UI Layout Updated) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-white border border-slate-100 animate-pulse rounded-[20px]"
              />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const isPaid =
                job.stipend &&
                job.stipend !== "0" &&
                job.stipend.toLowerCase() !== "unpaid";

              return (
                <Link
                  href={`/find/jobs/${job.id}`}
                  key={job.id}
                  className="group bg-white p-6 rounded-[20px] border border-slate-200 hover:border-black hover:shadow-xl hover:shadow-black/[0.02] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 group-hover:scale-105 transition-transform flex-shrink-0">
                        <img
                          src={job.companies?.logo_url}
                          className="w-full h-full object-contain"
                          alt=""
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-black rounded-lg transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <h2 className="text-xl font-black leading-[1.15] text-slate-900 group-hover:text-red-600 transition-colors mb-2 tracking-tight uppercase line-clamp-2">
                      {job.title}
                    </h2>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-5">
                      <span className="text-slate-800">
                        {job.companies?.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || "Remote"}
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {job.skills
                        ?.slice(0, 2)
                        .map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="text-[9px] font-black uppercase bg-slate-50 px-2.5 py-1 rounded border border-slate-100 text-slate-500"
                          >
                            {skill}
                          </span>
                        ))}
                      {job.skills?.length > 2 && (
                        <span className="text-[9px] font-black uppercase bg-red-50 px-2.5 py-1 rounded text-red-600 border border-red-100">
                          +{job.skills.length - 2} More
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Segment Area */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-lg font-black tracking-tight text-slate-900 leading-none">
                        {job.salary || job.stipend || "Competitive"}
                      </p>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider block mt-1 ${isPaid ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {isPaid ? "Paid Track" : "Unpaid Exposure"}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-900 group-hover:bg-black group-hover:text-white rounded-xl flex items-center justify-center transition-all">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold italic">
            No matching openings found matching current options filters.
          </div>
        )}
      </div>
    </div>
  );
}
