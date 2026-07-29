"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Lock,
  Briefcase,
  Users,
  Code,
  PenTool,
  TrendingUp,
  Smartphone,
  DollarSign,
  Cpu,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const COMPANY_ID = "e62becf7-d450-4f1f-80d2-10b88a336afc";

export default function CompanyCareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [jobType, setJobType] = useState<"internship" | "full-time">(
    "internship",
  );
  const [category, setCategory] = useState<"all" | "tech" | "non-tech">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyAndJobs() {
      setLoading(true);

      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", COMPANY_ID)
        .single();

      if (company) {
        setCompanyInfo(company);
      }

      const { data: companyJobs } = await supabase
        .from("jobs")
        .select(`*, companies(name, logo_url)`)
        .eq("company_id", COMPANY_ID)
        .order("created_at", { ascending: false });

      setJobs(companyJobs || []);
      setLoading(false);
    }

    fetchCompanyAndJobs();
  }, []);

  // Filter Computation Match Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      const jobTypeStr = (
        job.type ||
        job.job_type ||
        "internship"
      ).toLowerCase();
      const matchesType =
        jobType === "internship"
          ? jobTypeStr.includes("intern")
          : !jobTypeStr.includes("intern");

      const isTech =
        job.category?.toLowerCase() === "tech" ||
        job.skills?.some((s: string) =>
          [
            "react",
            "node",
            "python",
            "ai",
            "ml",
            "mobile",
            "backend",
            "next.js",
          ].includes(s.toLowerCase()),
        );
      const matchesCategory =
        category === "all" ? true : category === "tech" ? isTech : !isTech;

      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills?.some((s: string) =>
          s.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [jobs, jobType, category, searchQuery]);

  const getJobIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("ai") || t.includes("machine") || t.includes("data"))
      return <Cpu className="w-5 h-5 text-slate-800" />;
    if (t.includes("content") || t.includes("design") || t.includes("writer"))
      return <PenTool className="w-5 h-5 text-slate-800" />;
    if (t.includes("human") || t.includes("hr") || t.includes("people"))
      return <Users className="w-5 h-5 text-slate-800" />;
    if (t.includes("marketing") || t.includes("growth"))
      return <TrendingUp className="w-5 h-5 text-slate-800" />;
    if (
      t.includes("mobile") ||
      t.includes("app") ||
      t.includes("ios") ||
      t.includes("android")
    )
      return <Smartphone className="w-5 h-5 text-slate-800" />;
    if (
      t.includes("backend") ||
      t.includes("frontend") ||
      t.includes("dev") ||
      t.includes("engineer")
    )
      return <Code className="w-5 h-5 text-slate-800" />;
    if (
      t.includes("finance") ||
      t.includes("strategy") ||
      t.includes("business")
    )
      return <DollarSign className="w-5 h-5 text-slate-800" />;
    return <Briefcase className="w-5 h-5 text-slate-800" />;
  };

  const toggleExpand = (id: string) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-slate-900 pb-28 antialiased">
      {/* 🌟 1. HERO BANNER */}
      <header className="bg-[#0B101D] text-white py-14 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              {/* Logo Box */}
              <div className="w-14 h-14 bg-white rounded-2xl p-2.5 shadow-lg flex items-center justify-center flex-shrink-0">
                {companyInfo?.logo_url ? (
                  <img
                    src={companyInfo.logo_url}
                    alt={companyInfo?.name || "InternKhojo Logo"}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm">
                    ik
                  </div>
                )}
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1 border border-red-500/30">
                  <Sparkles className="w-3 h-3" /> WE'RE HIRING!
                </span>
                <h1 className="text-2xl md:text-4xl font-[950] tracking-tight">
                  Careers at <span className="text-red-600">InternKhojo</span>
                </h1>
              </div>
            </div>

            <a
              href="#openings"
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              VIEW OPENINGS <ArrowUpRight className="w-4 h-4 text-red-600" />
            </a>
          </div>

          <div className="max-w-3xl mb-10">
            <p className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">
              We're not building a normal hiring platform. We're building{" "}
              <span className="text-red-500 underline decoration-red-500 decoration-2">
                experience infrastructure
              </span>
              .
            </p>
            <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
              Most platforms are saturated and filled with fake openings. We
              solve the deeper problem: finding the right people with the right
              ones.
            </p>
          </div>

          {/* Quick Stats Line */}
          <div className="flex items-center gap-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-lg font-black leading-none">{jobs.length}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  OPEN ROLES
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-lg font-black leading-none">Global</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  HQ LOCATION
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 🌟 2. ROLES LIST SECTION */}
      <main className="max-w-6xl mx-auto px-6 pt-12" id="openings">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-[950] tracking-tight uppercase text-slate-900 mb-1">
            Join the <span className="text-red-600 italic">Core Team</span>
          </h2>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            {jobType === "internship"
              ? "Internship Program"
              : "Full-Time Opportunities"}
          </p>
        </div>

        {/* Filters Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle 1: Internship / FTE Pill */}
            <div className="bg-white border border-slate-200 p-1.5 rounded-full flex items-center shadow-sm">
              <button
                type="button"
                onClick={() => setJobType("internship")}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  jobType === "internship"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Internship
              </button>
              <button
                type="button"
                onClick={() => setJobType("full-time")}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  jobType === "full-time"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Full-Time (FTE)
              </button>
            </div>

            {/* Toggle 2: Tech / Non-Tech Pill */}
            <div className="bg-white border border-slate-200 p-1.5 rounded-full flex items-center shadow-sm">
              {(["all", "tech", "non-tech"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                    category === cat
                      ? "bg-red-600 text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-full text-xs font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-black transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Accordion Openings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white border border-slate-200 animate-pulse rounded-[20px]"
              />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const isClosed = job.status?.toLowerCase() === "closed";
              const isExpanded = expandedJobId === job.id;
              const openSeats = job.openings_count || job.openings || "10";
              const isTech =
                job.category?.toLowerCase() === "tech" ||
                job.skills?.some((s: string) =>
                  ["react", "node", "python", "ai", "ml", "mobile"].includes(
                    s.toLowerCase(),
                  ),
                );

              return (
                <div
                  key={job.id}
                  className={`bg-white border border-slate-200 rounded-[20px] transition-all shadow-sm overflow-hidden ${
                    isClosed ? "opacity-60 bg-slate-50" : "hover:border-black"
                  }`}
                >
                  {/* Job Bar */}
                  <div
                    onClick={() => !isClosed && toggleExpand(job.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        {getJobIcon(job.title)}
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight mb-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {isTech ? "TECH" : "NON-TECH"}
                          </span>
                          <span>•</span>
                          <span>{job.location || "REMOTE"}</span>
                          <span>•</span>
                          <span>{job.stipend || "STIPEND OFFERED"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isClosed ? (
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                          <Lock className="w-3.5 h-3.5" /> Seats Filled
                        </div>
                      ) : (
                        <>
                          {/* 🔵 BLUE FAMILY BADGE ACCENT */}
                          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                            {openSeats} Openings
                          </div>
                          <button className="w-9 h-9 bg-slate-50 hover:bg-black hover:text-white rounded-full flex items-center justify-center border border-slate-200 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && !isClosed && (
                    <div className="px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-xs md:text-sm text-slate-600 mb-5 font-bold leading-relaxed">
                        {job.description ||
                          "Join our core team to design, execute, and deliver impactful solutions in a high-ownership environment."}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {job.skills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[9px] font-black uppercase bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Posted:{" "}
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/find/jobs/${job.id}`}
                          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                        >
                          Apply Now{" "}
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold italic bg-white">
            No active openings match your selected filters right now.
          </div>
        )}
      </main>
    </div>
  );
}
