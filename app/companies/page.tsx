"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Globe,
  Plus,
  Building2,
  ShieldCheck,
  ListFilter,
  ChevronRight,
} from "lucide-react";

export default function CompaniesLibrary() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndustry, setActiveIndustry] = useState("All");
  const [sizeRange, setSizeRange] = useState(5000);

  const industries = [
    "All",
    "SaaS",
    "Fintech",
    "HealthTech",
    "Consumer",
    "AI",
    "Design",
    "EdTech",
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data } = await supabase.from("companies").select("*");
      if (data) {
        setCompanies(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesIndustry =
        activeIndustry === "All" || c.industry === activeIndustry;
      const sizeValue = parseInt(c.size?.toString().replace(/\D/g, "") || "0");
      return (
        matchesSearch &&
        matchesIndustry &&
        (sizeValue <= sizeRange || sizeRange === 5000)
      );
    });
  }, [searchQuery, activeIndustry, sizeRange, companies]);

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-slate-900 font-sans selection:bg-black selection:text-white">
      {/* --- HEADER (NON-STICKY) --- */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">
                COM<span className="text-[#FF3B30]">PANIES</span>
              </h1>
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {companies.length} Nodes Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group min-w-[280px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="SEARCH DATABASE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/50 border border-slate-200 py-2 pl-9 pr-4 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all uppercase tracking-tight"
                />
              </div>
              <Link
                href="/signup?role=recruiter"
                className="bg-black text-white px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-[#FF3B30] transition-all flex items-center gap-2 whitespace-nowrap shadow-sm active:scale-95"
              >
                <Plus size={14} strokeWidth={3} /> Register Entity
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 pt-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* --- MINIMALIST FILTER BAR --- */}
          <aside className="lg:w-[240px] flex-shrink-0 space-y-8 h-fit lg:sticky lg:top-24">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                <ListFilter size={14} /> Sector Index
              </div>
              <div className="flex flex-col gap-1">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setActiveIndustry(ind)}
                    className={`text-left px-3 py-2 rounded-md text-[11px] font-bold transition-all ${
                      activeIndustry === ind
                        ? "bg-black text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {ind.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                <span>Scaling</span>
                <span className="text-black">
                  {sizeRange === 5000 ? "MAX" : `< ${sizeRange}`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="5000"
                step="100"
                value={sizeRange}
                onChange={(e) => setSizeRange(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF3B30]"
              />
            </div>
          </aside>

          {/* --- DENSE CARD GRID --- */}
          <section className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-44 bg-slate-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((company) => (
                    <motion.div
                      key={company.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="group bg-white border border-slate-200 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2 transition-transform duration-500 group-hover:rotate-[-3deg]">
                            {company.logo_url ? (
                              <img
                                src={company.logo_url}
                                alt=""
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building2 size={20} className="text-slate-200" />
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {company.verified && (
                              <ShieldCheck
                                size={16}
                                className="text-[#FF3B30]"
                              />
                            )}
                            <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                              {company.industry || "GENERAL"}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-black tracking-tight text-slate-900 transition-colors group-hover:text-[#FF3B30] truncate leading-none uppercase italic">
                          {company.name}
                        </h3>
                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed line-clamp-2 mt-2 uppercase tracking-tight">
                          {company.description ||
                            "Leading innovations in the modern landscape."}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            <MapPin size={10} className="text-[#FF3B30]" />
                            <span className="truncate max-w-[60px]">
                              {company.headquarters || "Global"}
                            </span>
                          </div>
                          {company.website && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter transition-colors">
                              <Globe size={10} className="text-[#FF3B30]" />
                              <span>Site</span>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/companies/${company.id}`}
                          className="text-slate-300 group-hover:text-[#FF3B30] transition-all"
                        >
                          <ChevronRight size={18} strokeWidth={3} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
