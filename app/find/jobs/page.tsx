"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Search,
  MapPin,
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-black pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation & Search Row */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold hover:bg-black hover:text-white transition-all shadow-sm active:scale-95 self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="relative group w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500" />
            <input
              placeholder="Search by title, skill, or company..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-red-500/5 outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-10">
          <Zap className="w-6 h-6 text-red-600 fill-red-600" />
          <h1 className="text-4xl font-black tracking-tighter">
            Latest <span className="text-red-600">Openings</span>
          </h1>
        </div>

        {/* Side-by-Side Job Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-white border border-gray-100 animate-pulse rounded-[2.5rem]"
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs
              .filter((j) =>
                j.title.toLowerCase().includes(search.toLowerCase()),
              )
              .map((job) => (
                <Link
                  href={`/find/jobs/${job.id}`}
                  key={job.id}
                  className="group bg-white p-8 rounded-[3rem] border border-gray-100 hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/[0.05] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                        <img
                          src={job.companies?.logo_url}
                          className="w-full h-full object-contain"
                          alt=""
                        />
                      </div>
                      <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    <h2 className="text-2xl font-black leading-[1.1] group-hover:text-red-600 transition-colors mb-3 tracking-tight">
                      {job.title}
                    </h2>

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                      <span className="text-black">{job.companies?.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || "Remote"}
                      </span>
                    </div>

                    {/* Smart Skills Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {job.skills
                        ?.slice(0, 3)
                        .map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1.5 rounded-lg text-gray-500 border border-gray-50"
                          >
                            {skill}
                          </span>
                        ))}
                      {job.skills?.length > 3 && (
                        <span className="text-[10px] font-black uppercase bg-red-50 px-3 py-1.5 rounded-lg text-red-600 border border-red-100">
                          +{job.skills.length - 3} More
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-xl font-black tracking-tighter text-black leading-none">
                        {job.salary || job.stipend || "Competitive"}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1 tracking-widest">
                        Apply Instantly
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all shadow-lg">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
