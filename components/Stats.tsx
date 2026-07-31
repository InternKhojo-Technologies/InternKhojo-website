"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Container from "./ui/Container";
import { supabase } from "@/lib/supabase";

// 🔥 MANUAL OVERRIDE CONFIG
const MANUAL_OVERRIDE = {
  enabled: false,
  stats: {
    candidates: 1240,
    openings: 85,
    hired: 420,
  },
};

export default function Stats() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(!MANUAL_OVERRIDE.enabled);
  const [stats, setStats] = useState({
    candidates: 0,
    openings: 0,
    hired: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (MANUAL_OVERRIDE.enabled) {
      setStats(MANUAL_OVERRIDE.stats);
      setLoading(false);
    } else {
      try {
        setLoading(true);

        const { count: candidateCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "candidate");

        const { count: jobsCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true });

        const { data: hiredCount } = await supabase.rpc("get_hired_count");

        setStats({
          candidates: candidateCount || 0,
          openings: jobsCount || 0,
          hired: Number(hiredCount) || 0,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }

    const { data: companyData } = await supabase
      .from("companies")
      .select("id, name, logo_url")
      .not("logo_url", "is", null)
      .limit(20);

    setCompanies(companyData || []);
  };

  // 🔥 10x REPEAT ARRAY FOR INFINITE ZOOM OUT CONTINUITY
  const infiniteCompanies = useMemo(() => {
    if (!companies.length) return [];
    return Array(10).fill(companies).flat();
  }, [companies]);

  return (
    <div className="py-32 bg-[#050505] relative overflow-hidden">
      <Container>
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Candidates Card */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-[#0A0A0A] rounded-[2.5rem] p-12 text-center border border-white/5 shadow-2xl flex flex-col items-center justify-center"
          >
            {loading ? (
              <div className="h-14 w-36 bg-white/10 rounded-2xl animate-pulse mb-3" />
            ) : (
              <h3 className="text-6xl font-black text-white tracking-tighter">
                {stats.candidates.toLocaleString()}+
              </h3>
            )}
            <p className="text-gray-500 mt-3 font-medium uppercase tracking-wider text-xs">
              Candidates Registered
            </p>
          </motion.div>

          {/* Active Openings Card (Highlighted) */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-gradient-to-br from-black to-[#111] rounded-[2.5rem] shadow-[0_20px_80px_rgba(239,68,68,0.15)] p-12 text-center border border-red-500/20 flex flex-col items-center justify-center"
          >
            {loading ? (
              <div className="h-14 w-28 bg-white/10 rounded-2xl animate-pulse mb-3" />
            ) : (
              <h3 className="text-6xl font-black text-white tracking-tighter">
                {stats.openings.toLocaleString()}+
              </h3>
            )}
            <p className="text-white/70 mt-3 font-medium uppercase tracking-wider text-xs">
              Active Openings
            </p>
          </motion.div>

          {/* Hired Card */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-[#0A0A0A] rounded-[2.5rem] p-12 text-center border border-white/5 shadow-2xl flex flex-col items-center justify-center"
          >
            {loading ? (
              <div className="h-14 w-32 bg-red-500/20 rounded-2xl animate-pulse mb-3" />
            ) : (
              <h3 className="text-6xl font-black text-red-500 tracking-tighter">
                {stats.hired.toLocaleString()}+
              </h3>
            )}
            <p className="text-gray-500 mt-3 font-medium uppercase tracking-wider text-xs">
              Got Work via InternKhojo
            </p>
          </motion.div>
        </div>

        {/* NETWORK GROWTH SECTION */}
        <div className="mt-28 flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-red-600" />
          <p className="text-red-600 font-black text-xs uppercase tracking-[0.5em] italic">
            Network Growth
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-red-600" />
        </div>

        <p className="text-center mt-6 text-gray-500 font-medium relative z-10 text-lg italic opacity-80">
          Companies hiring through InternKhojo
        </p>
      </Container>

      {/* INFINITE SEAMLESS LOGO STRIP */}
      <div className="mt-16 overflow-hidden relative z-10 w-full bg-white/[0.02] py-10 border-y border-white/5">
        {infiniteCompanies.length > 0 && (
          <motion.div
            className="flex w-max items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 40,
              repeat: Infinity,
            }}
          >
            {infiniteCompanies.map((company, i) => (
              <div
                key={i}
                className="flex items-center gap-6 mx-8 flex-shrink-0"
              >
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-16 h-16 object-contain brightness-110"
                  />
                )}
                <span className="text-3xl font-black tracking-tighter text-white uppercase italic whitespace-nowrap">
                  {company.name}
                </span>
                <div className="ml-6 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)] flex-shrink-0" />
              </div>
            ))}
          </motion.div>
        )}

        {/* Edge Fades for visual smoothness */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#050505] via-[#050505]/90 to-transparent z-20" />
      </div>
    </div>
  );
}
