"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "./ui/Container";
import { supabase } from "@/lib/supabase";

export default function Stats() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState({
    candidates: 0,
    openings: 0,
    hired: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { count: candidateCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "candidate");
    const { count: jobsCount } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true });
    const { count: hiredCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("stage", "hired");
    const { data: companyData } = await supabase
      .from("companies")
      .select("id, name, logo_url")
      .not("logo_url", "is", null)
      .limit(20);

    setCompanies(companyData || []);
    setStats({
      candidates: candidateCount || 0,
      openings: jobsCount || 0,
      hired: hiredCount || 0,
    });
  };

  return (
    <div className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Background Glow Hata Diya Hai (Poora Clean Dark) */}

      <Container>
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* CARD 1 */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-[#0A0A0A] rounded-[2.5rem] p-12 text-center border border-white/5 shadow-2xl"
          >
            <h3 className="text-6xl font-black text-white tracking-tighter">
              {stats.candidates.toLocaleString()}+
            </h3>
            <p className="text-gray-500 mt-3 font-medium uppercase tracking-wider text-xs">
              Candidates Registered
            </p>
          </motion.div>

          {/* CARD 2 - HIGHLIGHTED */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-gradient-to-br from-black to-[#111] rounded-[2.5rem] shadow-[0_20px_80px_rgba(239,68,68,0.15)] p-12 text-center border border-red-500/20"
          >
            <h3 className="text-6xl font-black text-white tracking-tighter">
              {stats.openings.toLocaleString()}+
            </h3>
            <p className="text-white/70 mt-3 font-medium uppercase tracking-wider text-xs">
              Active Openings
            </p>
          </motion.div>

          {/* CARD 3 */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-[#0A0A0A] rounded-[2.5rem] p-12 text-center border border-white/5 shadow-2xl"
          >
            <h3 className="text-6xl font-black text-red-500 tracking-tighter">
              {stats.hired.toLocaleString()}+
            </h3>
            <p className="text-gray-500 mt-3 font-medium uppercase tracking-wider text-xs">
              Got Work via InternKhojo
            </p>
          </motion.div>
        </div>

        {/* NETWORK GROWTH - ORIGINAL LOOK RESTORED */}
        <div className="mt-28 flex items-center justify-center gap-4">
          {" "}
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-red-600" />{" "}
          <p className="text-red-600 font-black text-xs uppercase tracking-[0.5em] italic">
            {" "}
            Network Growth{" "}
          </p>{" "}
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-red-600" />{" "}
        </div>

        <p className="text-center mt-6 text-gray-500 font-medium relative z-10 text-lg italic opacity-80">
          Companies hiring through InternKhojo
        </p>
      </Container>

      {/* CONTINUOUS COMPANY STRIP */}
      <div className="mt-16 overflow-hidden relative z-10 w-full bg-white/[0.02] py-10 border-y border-white/5">
        <motion.div
          className="flex w-max items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
        >
          {/* 4x Duplication for Unending Effect */}
          {[...companies, ...companies, ...companies, ...companies].map(
            (company, i) => (
              <div key={i} className="flex items-center gap-6 mx-8">
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-16 h-16 object-contain brightness-110"
                />

                <span className="text-3xl font-black tracking-tighter text-white uppercase italic whitespace-nowrap">
                  {company.name}
                </span>

                {/* Red Dot Separator */}
                <div className="ml-6 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
              </div>
            ),
          )}
        </motion.div>

        {/* Edge Fades for the 'Unending' effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#050505] via-[#050505]/90 to-transparent z-20" />
      </div>
    </div>
  );
}
