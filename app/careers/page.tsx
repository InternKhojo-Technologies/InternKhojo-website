"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Briefcase,
  Users,
  Code,
  PenTool,
  TrendingUp,
  Smartphone,
  DollarSign,
  Cpu,
  Sparkles,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Clock,
  Compass,
  CheckCircle2,
  Zap,
} from "lucide-react";
import Link from "next/link";

const COMPANY_ID = "e62becf7-d450-4f1f-80d2-10b88a336afc";

// 🛠️ HELPER: Strip raw HTML tags and get clean 5-6 words snippet
const cleanTextSnippet = (rawHtml?: string) => {
  if (!rawHtml) return "High-ownership role building core systems.";
  const cleanText = rawHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanText.split(" ");
  if (words.length <= 6) return cleanText;
  return words.slice(0, 6).join(" ") + "...";
};

export default function CompanyCareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
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

  const toggleExpand = (id: string) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white pb-24">
      {/* 🖼️ HERO SECTION WITH IMAGE GALLERY */}
      <section className="pt-12 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="max-w-2xl mx-auto mb-14">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight mt-5 mb-4 leading-[1.08]">
            Build Your Future <br />
            <span className="text-blue-600">With Us</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto">
            Discover exciting opportunities and grow your career in a
            high-ownership, supportive environment.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-center">
          <div className="space-y-5">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 text-left">
              <p className="text-xs font-semibold text-slate-600 leading-snug italic">
                &ldquo;We merge creativity with strategy to build real digital
                experiences.&rdquo;
              </p>
            </div>
            <div className="h-48 rounded-3xl overflow-hidden shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
                alt="Team working"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="h-80 rounded-3xl overflow-hidden shadow-md group">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
              alt="Office culture"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="h-72 rounded-3xl overflow-hidden shadow-md bg-amber-400 p-2 group">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
              alt="Collaboration"
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="h-52 rounded-3xl overflow-hidden shadow-md group">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80"
              alt="Workspace"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 💡 WHY JOIN US (BENTO GRID BENEFITS) */}
      <section className="py-24 bg-white border-y border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-14">
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest block mb-2">
              Why Join Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Experience a workplace that values your{" "}
              <span className="text-blue-600">
                growth, creativity & well-being.
              </span>
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-3">
              Fulfilling career trajectories with flexibility, high autonomy,
              and supportive team culture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#FAFBFD] border border-slate-200/80 p-7 rounded-3xl flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 hover:border-slate-300 transition-all">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg mb-2">
                  Advance quickly with clear growth opportunities.
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
                  Accelerate your career path with defined leadership
                  opportunities and continuous skill advancement.
                </p>
              </div>
              <div className="h-36 rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
                  alt="Growth"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAFBFD] border border-slate-200/80 p-7 rounded-3xl space-y-6 hover:shadow-lg hover:shadow-slate-100 hover:border-slate-300 transition-all">
              <div>
                <div className="w-11 h-11 bg-blue-100/70 border border-blue-200/60 rounded-2xl flex items-center justify-center text-blue-700 mb-4 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">
                  Flexible Work Environment
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Enjoy a healthy work-life balance with options for
                  remote-first work and flexible scheduling.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200/80">
                <div className="w-11 h-11 bg-amber-100/70 border border-amber-200/60 rounded-2xl flex items-center justify-center text-amber-700 mb-4 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">
                  High-Impact Projects
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Work on production systems that deliver real-world value
                  directly to thousands of users.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAFBFD] border border-slate-200/80 p-7 rounded-3xl flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 hover:border-slate-300 transition-all">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg mb-2">
                  Comprehensive Benefits Package
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
                  Competitive stipends/compensation, health coverage options,
                  and tailored perks built for long-term retention.
                </p>
              </div>
              <div className="h-44 rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=500&q=80"
                  alt="Team Benefits"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌿 OUR VALUES SECTION */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                alt="Our Team"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
              <div className="flex -space-x-2.5">
                <span className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white text-xs font-black flex items-center justify-center shadow-xs">
                  A
                </span>
                <span className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white text-white text-xs font-black flex items-center justify-center shadow-xs">
                  R
                </span>
                <span className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white text-white text-xs font-black flex items-center justify-center shadow-xs">
                  S
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold text-slate-900">
                  Expert Core Team
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Collaborative Culture
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">
              Our Pillars
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight mb-2">
              How We&apos;re Guided
            </h2>
            <p className="text-xs font-medium text-slate-500 mb-10">
              Dedicated to transparency, swift execution, and high engineering
              standards.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                <div className="w-9 h-9 bg-amber-100/70 text-amber-700 rounded-xl flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="font-extrabold text-sm text-slate-900 mb-0.5">
                  Honesty
                </p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Clear feedback loops and intuitive collaborative workflows.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                <div className="w-9 h-9 bg-blue-100/70 text-blue-700 rounded-xl flex items-center justify-center mb-3">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <p className="font-extrabold text-sm text-slate-900 mb-0.5">
                  Creativity
                </p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Building scalable solutions from zero to production.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                <div className="w-9 h-9 bg-sky-100/70 text-sky-700 rounded-xl flex items-center justify-center mb-3">
                  <Compass className="w-5 h-5" />
                </div>
                <p className="font-extrabold text-sm text-slate-900 mb-0.5">
                  Quality
                </p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Striving for excellence across codebases and design systems.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                <div className="w-9 h-9 bg-purple-100/70 text-purple-700 rounded-xl flex items-center justify-center mb-3">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <p className="font-extrabold text-sm text-slate-900 mb-0.5">
                  Teamwork
                </p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Tight-knit synchronization without bureaucracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💼 OPEN POSITIONS SECTION (EXACT MATCHING UI FROM YOUR IMAGE) */}
      <section
        className="py-20 bg-[#FAFBFD] border-t border-slate-200/80"
        id="openings"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Section Heading */}
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            NOW HIRING
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Open Positions Available
          </h2>
          <p className="text-xs font-medium text-slate-500 mb-8 max-w-lg mx-auto">
            &ldquo;Join us for exciting opportunities in a team that values
            growth and innovation.&rdquo;
          </p>

          {/* Pill Tabs & Search Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            {/* Round Filter Container */}
            <div className="bg-white border border-slate-200/90 rounded-full p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap justify-center">
              {/* Job Type Pills */}
              <button
                type="button"
                onClick={() => setJobType("internship")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  jobType === "internship"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Internship
              </button>
              <button
                type="button"
                onClick={() => setJobType("full-time")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  jobType === "full-time"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Full-Time
              </button>

              <div className="h-4 w-[1px] bg-slate-200 my-auto hidden sm:block" />

              {/* Category Pills */}
              {(["all", "tech", "non-tech"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    category === cat
                      ? "bg-red-500 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat === "all"
                    ? "All"
                    : cat === "tech"
                      ? "Development"
                      : "Management"}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search openings..."
                className="w-full bg-white border border-slate-200/90 pl-9 pr-4 py-2 rounded-full text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Card List (Exact Layout from Image) */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white border border-slate-200/90 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-5 text-left">
              {filteredJobs.map((job) => {
                const isClosed = job.status?.toLowerCase() === "closed";
                const isExpanded = expandedJobId === job.id;

                return (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-6 md:p-7 transition-all shadow-xs hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Title & Exp Subtitle */}
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                          <span>
                            {job.location || "Remote"} •{" "}
                            {job.stipend || "Competitive Stipend"}
                          </span>
                        </div>
                      </div>

                      {/* Apply Button & Expand Toggle */}
                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <Link
                          href={`/find/jobs/${job.id}`}
                          className="inline-flex items-center gap-1.5 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs active:scale-95"
                        >
                          Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => !isClosed && toggleExpand(job.id)}
                          className="w-9 h-9 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expand Details */}
                    {isExpanded && (
                      <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-600">
                        <p className="mb-3 font-medium leading-relaxed">
                          {cleanTextSnippet(job.description)}
                        </p>
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.map((s: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-medium"
                              >
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              No positions matching your filters right now.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
