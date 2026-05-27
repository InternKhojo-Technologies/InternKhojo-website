"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ArrowRight,
  Zap,
  ChevronRight,
  Verified,
  Users,
  Banknote,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

function getRelativeTime(date: string) {
  const diff = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );
  if (diff < 86400) return "Today";
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FindPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    let isMounted = true;
    async function fetchData() {
      try {
        await new Promise((r) => setTimeout(r, 200));

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const [compRes, jobRes] = await Promise.all([
          supabase.from("companies").select("*").limit(5),
          supabase
            .from("jobs")
            .select(`*, companies(name, logo_url)`)
            .eq("status", "open")
            .gte("created_at", threeDaysAgo.toISOString())
            .order("created_at", { ascending: false }),
        ]);

        if (isMounted) {
          setCompanies(compRes.data || []);
          setJobs(jobRes.data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job: any) => {
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
      })
      .slice(0, 6);
  }, [jobs, titleQuery, locationQuery, payType, selectedSkill]);

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-20">
      {/* 1. HERO */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            The Startup Directory
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 mb-16">
          Where the next <br />
          <span className="text-red-600">unicorns</span> are built.
        </h1>

        {/* 2. 🔥 FULLY RESPONSIVE SEARCH BAR SYSTEM */}
        <div className="max-w-4xl mx-auto relative px-2" ref={filterRef}>
          {/* Changed from forced rounded-full p-2 to responsive rounded edges and block structures */}
          <div className="bg-white border border-slate-200 rounded-2xl md:rounded-full p-3 md:p-2 shadow-2xl shadow-slate-100/70 flex flex-col md:flex-row items-center gap-2 md:gap-0">
            {/* Input Block 1: Title */}
            <div className="flex items-center px-4 md:px-6 border-b md:border-b-0 md:border-r border-slate-100 py-3 md:py-0 w-full flex-1">
              <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
              <input
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                placeholder="Job title..."
                className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* Input Block 2: Location */}
            <div className="flex items-center px-4 md:px-6 py-3 md:py-0 w-full flex-1">
              <MapPin className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location"
                className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* Action Buttons Block */}
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

          {/* FILTER DROPBOX (Responsive Matrix) */}
          {showFilters && (
            <div className="absolute top-full mt-4 left-2 right-2 md:left-0 right-0 z-50 bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left animate-in fade-in zoom-in-95 duration-150">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Compensation
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
                          : "border-slate-100 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Skills
                </p>
                <input
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  placeholder="e.g. React, Figma"
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-red-200 font-bold text-slate-700"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. LISTINGS */}
      <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12">
        {/* JOBS SECTION */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600 fill-red-600" /> New Listings
            </h2>
          </div>

          <div className="grid gap-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-50 rounded-2xl animate-pulse"
                />
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job: any) => {
                const isPaid =
                  job.stipend &&
                  job.stipend !== "0" &&
                  job.stipend.toLowerCase() !== "unpaid";
                return (
                  <Link
                    href={`/find/jobs/${job.id}`}
                    key={job.id}
                    className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/30 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2 flex-shrink-0">
                        <img
                          src={job.companies?.logo_url}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-red-600 transition-colors leading-tight mb-1 uppercase tracking-tight">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="text-slate-800">
                            {job.companies?.name}
                          </span>
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          <span
                            className={`flex items-center gap-1 ${isPaid ? "text-emerald-600 font-black" : "text-slate-300"}`}
                          >
                            <Banknote className="w-3 h-3" />
                            {isPaid
                              ? job.stipend.match(/\d/)
                                ? job.stipend
                                : "PAID"
                              : "UNPAID"}
                          </span>
                          <span className="text-slate-400">
                            {getRelativeTime(job.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                );
              })
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 font-bold italic">
                No new listings in the last 72 hours.
              </div>
            )}

            <Link
              href="/find/jobs"
              className="w-full py-5 bg-slate-900 text-white rounded-2xl text-center font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all"
            >
              Browse all 500+ Openings
            </Link>
          </div>
        </div>

        {/* COMPANIES SIDEBAR */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight">
              Top Startups
            </h2>
          </div>

          <div className="grid gap-4">
            {loading
              ? [1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-slate-50 rounded-2xl animate-pulse"
                  />
                ))
              : companies.map((company: any) => (
                  <Link
                    href={`/companies/${company.id}`}
                    key={company.id}
                    className="block p-6 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex-shrink-0">
                        <img
                          src={company.logo_url}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-red-600 leading-none mb-2 uppercase tracking-tight">
                          {company.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {company.size && (
                            <span className="flex items-center gap-1 text-slate-500 font-bold">
                              <Users className="w-3 h-3" />
                              {company.size}
                            </span>
                          )}
                          {company.industry && (
                            <>
                              <span className="text-slate-200">•</span>
                              <span className="text-red-500 italic">
                                {company.industry}
                              </span>
                            </>
                          )}
                          {company.headquarters && (
                            <>
                              <span className="text-slate-200">•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {company.headquarters}
                              </span>
                            </>
                          )}
                        </div>
                        {company.description && (
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-3 leading-relaxed">
                            {company.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}

            <Link
              href="/companies"
              className="flex items-center justify-center gap-2 py-4 border border-slate-100 rounded-2xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              View all Verified Platforms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
