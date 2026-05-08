"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Container from "./ui/Container";
import { Briefcase, Users, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HowToUse() {
  const router = useRouter();

  const [mode, setMode] = useState("user");
  const [active, setActive] = useState(-1); // -1 means all cards are equal size by default

  const userSteps = [
    {
      title: "Discover Startups",
      desc: "Browse high-growth companies looking for fresh talent.",
      img: "/illustrations/User 1.png",
    },
    {
      title: "Connect & Apply",
      desc: "Skip the queues. Apply directly to founders.",
      img: "/illustrations/User 2.png",
    },
    {
      title: "Build Experience",
      desc: "Work on real-world projects that matter.",
      img: "/illustrations/User 3.png",
    },
    {
      title: "Grow Career",
      desc: "Transition from student to professional.",
      img: "/illustrations/User 4.png",
    },
  ];

  const hireSteps = [
    {
      title: "Post Opportunities",
      desc: "Get your gig in front of 50k+ students.",
      img: "/illustrations/R1.png",
    },
    {
      title: "Find Top Talent",
      desc: "Access a curated pool of hungry creators.",
      img: "/illustrations/R2.png",
    },
    {
      title: "Hire Faster",
      desc: "Streamlined dashboard to manage applications.",
      img: "/illustrations/R3.png",
    },
    {
      title: "Scale Your Team",
      desc: "Build a pipeline of talent for future growth.",
      img: "/illustrations/R4.png",
    },
  ];

  const content =
    mode === "user"
      ? {
          eyebrow: "FOR TALENT",
          title1: "Build your.",
          title2: "Future.",
          desc: "InternKhojo is the bridge between ambitious students and the world's most exciting startups. Stop searching, start building.",
          accent: "text-blue-600",
        }
      : {
          eyebrow: "FOR STARTUPS",
          title1: "Hire your.",
          title2: "Team.",
          desc: "Stop sifting through junk resumes. Access a curated pool of hungry talent ready to build from day one.",
          accent: "text-red-600",
        };

  const steps = mode === "user" ? userSteps : hireSteps;

  return (
    <section className="bg-white py-24 lg:py-40 overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center bg-gray-100/50 border border-gray-200/50 rounded-2xl p-1.5 shadow-inner">
              <button
                onClick={() => {
                  setMode("user");
                  setActive(-1);
                }}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  mode === "user"
                    ? "bg-white text-black shadow-md"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Briefcase size={16} /> Work
              </button>

              <button
                onClick={() => {
                  setMode("hire");
                  setActive(-1);
                }}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  mode === "hire"
                    ? "bg-white text-black shadow-md"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Users size={16} /> Hire
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="mt-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`h-[2px] w-10 ${
                      mode === "user" ? "bg-blue-600" : "bg-red-600"
                    }`}
                  />

                  <span className="text-xs font-black tracking-[0.25em] text-gray-400 uppercase">
                    {content.eyebrow}
                  </span>
                </div>

                <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.85] text-black">
                  {content.title1}
                  <br />

                  <span className={`relative inline-block ${content.accent}`}>
                    {content.title2}

                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3"
                      viewBox="0 0 200 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 15C50 5 150 5 195 15"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h2>

                <p className="mt-10 text-lg leading-relaxed text-gray-500 max-w-md font-medium">
                  {content.desc}
                </p>

                <button
                  onClick={() =>
                    router.push(
                      mode === "user"
                        ? "/signup?role=candidate"
                        : "/signup?role=recruiter",
                    )
                  }
                  className={`mt-10 group flex items-center gap-2 font-bold text-sm uppercase tracking-widest transition-colors ${content.accent}`}
                >
                  Get Started{" "}
                  <ArrowUpRight
                    size={18}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT ACCORDION CARDS */}
          <div className="lg:col-span-7 flex gap-3 h-[580px] w-full">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(-1)}
                animate={{
                  flex: active === i ? 2.5 : 1,
                }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="relative rounded-[2.5rem] overflow-hidden cursor-pointer border-[6px] border-white shadow-[0_10px_35px_rgba(0,0,0,0.08)]"
              >
                {/* CONTENT OVERLAY */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  <motion.div
                    animate={{
                      y: active === i ? 0 : 0,
                      opacity: 1,
                    }}
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-widest mb-2">
                      Step 0{i + 1}
                    </span>

                    <h3 className="text-white text-xl font-black tracking-tighter leading-tight mb-2">
                      {step.title}
                    </h3>

                    <AnimatePresence>
                      {active === i && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-gray-300 text-xs font-medium leading-tight max-w-[200px] overflow-hidden"
                        >
                          {step.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* IMAGE COMPONENT */}
                <div className="absolute inset-0 z-10">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    priority={i === 1}
                    className="object-cover transition-transform duration-700"
                  />

                  {/* Subtle Darkening for better text readability on all cards */}
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
