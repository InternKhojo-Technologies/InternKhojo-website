"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  ExternalLink,
  Briefcase,
  ChevronRight,
  Building2,
  Info,
} from "lucide-react";

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, [params.id]);

  const loadCompanyData = async () => {
    try {
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", params.id)
        .single();
      if (companyData) {
        setCompany(companyData);
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*")
          .eq("company_id", params.id)
          .eq("status", "open");
        setJobs(jobsData || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  if (!company) return null;

  return (
    <div className="bg-[#FCFCFC] min-h-screen text-slate-900 font-sans selection:bg-black selection:text-white pb-20">
      {/* --- REFINED BREADCRUMB (NON-STICKY) --- */}
      <div className="max-w-[1100px] mx-auto px-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="hover:text-[#FF3B30] transition-colors p-1 bg-white border border-slate-200 rounded-md shadow-sm"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Directory
            </span>
            <span className="text-[9px] font-black text-slate-300">/</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">
              {company.name}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="lg:grid lg:grid-cols-12 gap-6 items-start">
          {/* --- LEFT: ENTITY CORE --- */}
          <div className="lg:col-span-8 space-y-6">
            {/* PROFILE HEADER */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-5 shadow-sm">
              <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2.5 flex-shrink-0 shadow-sm">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    className="w-full h-full object-contain"
                    alt={company.name}
                  />
                ) : (
                  <Building2 size={20} className="text-slate-200" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-black tracking-tight uppercase truncate">
                    {company.name}
                  </h1>
                  {company.verified && (
                    <ShieldCheck
                      size={14}
                      className="text-[#10B981]"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} className="text-[#FF3B30]" />{" "}
                    {company.headquarters || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={10} className="text-[#FF3B30]" />{" "}
                    {company.size || "0"} EMP
                  </span>
                </div>
              </div>
            </section>

            {/* DESCRIPTION BOX */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full" />
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                  Manifest_Summary
                </h2>
              </div>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                {company.description || "System data pending for this entity."}
              </p>
            </section>

            {/* JOBS SECTION */}
            <section className="space-y-3">
              <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 italic">
                Active_Cycles ({jobs.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/find/jobs/${job.id}`}
                    className="group bg-white border border-slate-200 p-3.5 rounded-xl hover:border-black transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <Briefcase size={12} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[11px] font-black uppercase tracking-tight truncate group-hover:text-[#FF3B30] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                          {job.location || "Remote"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={12}
                      className="text-slate-200 group-hover:text-black group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* --- RIGHT: TECHNICAL SIDEBAR --- */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 italic">
                Core_Metrics
              </h3>
              <div className="space-y-3.5 text-[10px]">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-[8px]">
                    Sector
                  </span>
                  <span className="font-black uppercase italic text-right">
                    {company.industry || "General"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-[8px]">
                    Status
                  </span>
                  <span className="font-black uppercase italic text-[#10B981]">
                    Online
                  </span>
                </div>
              </div>

              {/* SURGICAL PORTAL NOTE */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-start gap-2 text-[8px] font-bold text-slate-400 uppercase leading-relaxed tracking-tighter opacity-60 italic">
                <Info
                  size={11}
                  className="flex-shrink-0 mt-0.5 text-[#FF3B30]"
                />
                <p>
                  All hiring processes within this entity are strictly managed
                  through the InternKhojo Portal.
                </p>
              </div>
            </div>

            {/* EXTERNAL LINK ACTION */}
            {company.website && (
              <a
                href={
                  company.website.startsWith("http")
                    ? company.website
                    : `https://${company.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#FF3B30] transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.05)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              >
                Visit Site <ExternalLink size={12} />
              </a>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
