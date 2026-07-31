"use client";

import { useEffect, useState } from "react";
import Container from "./ui/Container";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 🔥 MANUAL OVERRIDE CONFIG
// Set 'enabled' to true ONLY if you want to explicitly override database counts.
const MANUAL_OVERRIDE = {
  enabled: false,
  badgeText: "500+ startups joined this month",
  stats: {
    students: "1,240+",
    startups: "85+",
    skills: "50+",
    remoteTitle: "Remote",
    remoteSubtitle: "Hybrid Friendly",
  },
};

export default function IntroSection() {
  const router = useRouter();

  const [loading, setLoading] = useState(!MANUAL_OVERRIDE.enabled);
  const [stats, setStats] = useState({
    students: "",
    startups: "",
    skills: "",
    remoteTitle: "Remote",
    remoteSubtitle: "Hybrid Friendly",
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // 1. If Override is enabled, set manual numbers instantly without skeleton loading
    if (MANUAL_OVERRIDE.enabled) {
      setStats(MANUAL_OVERRIDE.stats);
      setLoading(false);
      return;
    }

    // 2. Fetch Real Database Counts
    try {
      setLoading(true);

      // Fetch Students / Candidate Count
      const { count: candidateCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "candidate");

      // Fetch Companies / Startups Count
      const { count: companyCount } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true });

      // Fetch Jobs to calculate unique skillsets
      const { data: jobsData } = await supabase.from("jobs").select("skills");

      let uniqueSkillsCount = 0;
      if (jobsData) {
        const skillsSet = new Set<string>();
        jobsData.forEach((job) => {
          if (Array.isArray(job.skills)) {
            job.skills.forEach((s: string) =>
              skillsSet.add(s.trim().toUpperCase()),
            );
          }
        });
        uniqueSkillsCount = skillsSet.size;
      }

      setStats({
        students: `${(candidateCount || 0).toLocaleString()}+`,
        startups: `${(companyCount || 0).toLocaleString()}+`,
        skills: `${uniqueSkillsCount || 0}+`,
        remoteTitle: "Remote",
        remoteSubtitle: "Hybrid Friendly",
      });
    } catch (error) {
      console.error("Error loading IntroSection stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-transparent py-28 sm:py-36 -mt-32">
      {/* GRID BACKGROUND */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.018]
          [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
          [background-size:60px_60px]
          [mask-image:linear-gradient(to_bottom,transparent,white_18%,white)]
        "
      />

      <Container>
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* TOP BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
              mb-10
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-white/90
              backdrop-blur-xl
              border
              border-white
              px-5
              py-2
              shadow-[0_10px_40px_rgba(0,0,0,0.05)]
            "
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

            <span className="text-sm font-semibold text-gray-600">
              {MANUAL_OVERRIDE.enabled ? (
                MANUAL_OVERRIDE.badgeText
              ) : loading ? (
                <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse align-middle" />
              ) : (
                //  `${stats.startups} startups hiring on platform`
                `Top startups actively hiring talent today.`
              )}
            </span>
          </motion.div>

          {/* MAIN HEADING */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[-0.06em] leading-[0.95] text-black">
              Find work that
              <br />
              <span className="relative inline-block">
                <span className="text-red-500">actually</span>

                <svg
                  className="absolute -bottom-3 left-0 w-full"
                  viewBox="0 0 300 20"
                  fill="none"
                >
                  <path
                    d="M2 15C60 2 120 2 298 15"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              builds your career.
            </h1>

            {/* SUBTEXT */}
            <p className="mt-10 text-lg sm:text-xl leading-9 text-gray-500 max-w-3xl mx-auto font-medium">
              InternKhojo connects ambitious students with startups,
              internships, freelance work, and opportunities that matter —
              without the noise of traditional job boards.
            </p>

            {/* BUTTONS */}
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5">
              {/* FIND WORK */}
              <motion.button
                onClick={() => router.push("/find")}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="
                  group
                  relative
                  overflow-hidden
                  px-9
                  py-5
                  bg-black
                  text-white
                  rounded-2xl
                  font-bold
                  text-lg
                  shadow-[0_15px_50px_rgba(0,0,0,0.18)]
                  cursor-pointer
                "
              >
                <span className="relative z-10">Find Work</span>

                <div className="absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>

              {/* HIRE TALENT */}
              <motion.button
                onClick={() => router.push("/hire")}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="
                  px-9
                  py-5
                  bg-white/90
                  backdrop-blur-xl
                  border
                  border-white
                  text-black
                  rounded-2xl
                  font-bold
                  text-lg
                  shadow-[0_10px_40px_rgba(0,0,0,0.05)]
                  hover:bg-white
                  transition-all
                  cursor-pointer
                "
              >
                Hire Talent
              </motion.button>
            </div>
          </motion.div>

          {/* DYNAMIC STATS CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="
              mt-24
              grid
              grid-cols-2
              md:grid-cols-4
              gap-5
              w-full
              max-w-5xl
            "
          >
            {[
              [stats.students, "Students"],
              [stats.startups, "Startups"],
              [stats.skills, "Skillsets"],
              [stats.remoteTitle, stats.remoteSubtitle],
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="
                  bg-white/90
                  backdrop-blur-xl
                  rounded-[2rem]
                  border
                  border-white
                  shadow-[0_10px_40px_rgba(0,0,0,0.05)]
                  px-8
                  py-7
                "
              >
                {loading ? (
                  <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse mb-1" />
                ) : (
                  <h3 className="text-3xl font-black text-black">{item[0]}</h3>
                )}

                <p className="mt-2 text-gray-500 font-medium">{item[1]}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
