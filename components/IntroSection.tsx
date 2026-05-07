"use client";

import Container from "./ui/Container";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function IntroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-transparent py-28 sm:py-36 -mt-32">
      {/* PREMIUM RED GLOW
      <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-red-500/5 blur-[180px] rounded-full" /> */}

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
              500+ startups joined this month
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
                "
              >
                Hire Talent
              </motion.button>
            </div>
          </motion.div>

          {/* FLOATING STATS */}
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
              ["10K+", "Students"],
              ["2K+", "Startups"],
              ["50+", "Skillsets"],
              ["Remote", "Hybrid Friendly"],
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
                <h3 className="text-3xl font-black text-black">{item[0]}</h3>

                <p className="mt-2 text-gray-500 font-medium">{item[1]}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
