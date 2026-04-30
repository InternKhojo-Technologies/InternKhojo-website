"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Zap,
  Fingerprint,
  Command,
  Cpu,
  Globe,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";

// --- Sophisticated Animation Wrapper ---
const Reveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-white text-[#0a0a0a] selection:bg-red-600 selection:text-white antialiased overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 lg:px-20 overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#fef2f2_0%,rgba(255,255,255,0)_50%)] opacity-70" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        </motion.div>

        <div className="max-w-[1500px] mx-auto w-full relative z-10">
          <Reveal>
            <div className="flex items-center gap-5 mb-16">
              <span className="h-[2px] w-16 bg-red-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-red-600">
                The Recruitment Standard
              </span>
            </div>

            <h1 className="text-[clamp(4rem,16vw,11rem)] font-[950] leading-[0.8] tracking-[-0.07em] mb-20 uppercase">
              ENGINEERING <br />
              <span className="text-red-600 inline-flex items-baseline">
                AMBITION
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                    times: [0, 0.5],
                  }}
                  className="ml-2 h-[0.12em] w-[0.4em] bg-red-600 inline-block align-baseline"
                />
              </span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-7">
                <p className="text-2xl md:text-4xl font-light leading-[1.1] text-gray-400 tracking-tight">
                  InternKhojo is a career laboratory. We dismantle legacy hiring
                  models to forge elite connections between talent and industry.
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-3">
                <div className="text-[90px] font-black tracking-tighter leading-none italic text-black">
                  2026
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Scaling Early Talent Globally
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. THE PROTOCOL GRID */}
      <section className="py-48 px-6 lg:px-20 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-32 gap-16">
          <Reveal>
            <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none italic">
              The InternKhojo <br />{" "}
              <span className="text-red-600">Protocol.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-2xl text-gray-400 max-w-xl font-light leading-snug">
              We trade in impact, not just applications. Our ecosystem is built
              on four pillars of professional authority.
            </p>

            <div className="text-red-500 font-mono text-[10px]">
              // SYSTEM_PROTOCOL: TALENT_FIRST
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Command, // Changed from <Command /> to Command
              title: "Curation",
              text: "Manual vetting for every role.",
            },
            {
              icon: Fingerprint, // Changed from <Fingerprint /> to Fingerprint
              title: "DNA",
              text: "Identity built on Proof of Work.",
            },
            {
              icon: Zap, // Changed from <Zap /> to Zap
              title: "Velocity",
              text: "Instant loops, zero ghosting.",
            },
            {
              icon: Award, // Changed from <Award /> to Award
              title: "Mentorship",
              text: "Direct 1:1 Industry Mentorship.",
            },
          ].map((item, idx) => {
            const Icon = item.icon; // TypeScript now recognizes this as a valid component
            return (
              <Reveal key={idx} delay={idx * 0.1}>
                <div className="p-10 bg-[#fafafa] rounded-[40px] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500 group h-full flex flex-col justify-between">
                  <div className="text-black group-hover:text-red-600 transition-colors duration-500 mb-16">
                    <Icon size={36} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 font-medium tracking-tight leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 3. MENTORSHIP & EXPERTISE SECTION */}
      <section className="py-24 px-4 lg:px-10">
        <div className="bg-[#080808] text-white rounded-[70px] p-12 lg:p-32 relative overflow-hidden">
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-600/10 blur-[180px] rounded-full pointer-events-none" />

          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-12 uppercase">
                  Access <br />
                  <span className="text-red-600 italic">The Boardroom.</span>
                </h2>
                <p className="text-xl text-gray-400 font-light leading-relaxed mb-12 max-w-lg">
                  Don't just apply—evolve. Connect with senior executives and
                  industry veterans who provide the blueprint for your career
                  growth.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 group cursor-default">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 transition-colors">
                      <ShieldCheck className="text-red-600" />
                    </div>
                    <p className="text-lg font-bold tracking-tight">
                      Vetted Expert Network
                    </p>
                  </div>
                  <div className="flex items-center gap-6 group cursor-default">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 transition-colors">
                      <ArrowUpRight className="text-red-600" />
                    </div>
                    <p className="text-lg font-bold tracking-tight">
                      1:1 Strategy Sessions
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square bg-[#111] rounded-[50px] border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="text-[200px] font-black opacity-5 select-none text-white">
                  IK
                </div>
                <div className="absolute inset-0 p-12 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-red-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white">
                      Live Session
                    </div>
                    <div className="text-gray-500 font-mono text-[10px]">
                      AUTH_MODE: MENTOR
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-1.5 w-full bg-white/5 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-red-600 rounded-full"
                      />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Bridging Talent Gap
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. ROOTED IN BHARAT */}
      <section className="pt-48 pb-12 px-6 lg:px-20 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="flex-1 pt-12 space-y-12">
            <Reveal>
              <div className="inline-block py-1 px-4 bg-red-50 border border-red-100 rounded-full mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-1.5 h-1.5 bg-red-600 rounded-full"
                  />
                  Operating from Bharat
                </p>
              </div>
              <h2 className="text-7xl md:text-8xl font-black tracking-[-0.05em] leading-[0.85] mb-8 uppercase">
                ROOTED IN <br />
                <span className="text-red-600 italic">BHARAT.</span>
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed max-w-md font-medium">
                Bharat is the world’s talent engine. We aren’t just starting
                here because it’s home—we’re starting here because this is where
                the most ambitious builders are born.
              </p>
              <div className="flex items-center gap-6 mt-12 pt-6">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
                    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop",
                    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop",
                  ].map((src, i) => (
                    <motion.img
                      key={i}
                      src={src}
                      className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 object-cover"
                      alt="Builder"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-black/80">
                  Join 10k+ Builders
                </p>
              </div>
            </Reveal>
          </div>

          <div className="flex-1 relative h-[600px] w-full max-w-[600px]">
            <motion.div
              whileHover={{ y: -15, rotate: -4, scale: 1.05 }}
              className="group absolute top-0 right-[45%] w-[240px] h-[240px] bg-red-600 rounded-[48px] shadow-2xl shadow-red-500/20 p-10 flex flex-col justify-end transition-all cursor-pointer"
            >
              <span className="text-white text-3xl font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-all duration-300">
                Bharat
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -15, rotate: 4, scale: 1.05 }}
              className="group absolute top-[40px] right-0 w-[240px] h-[240px] bg-black rounded-[48px] flex flex-col justify-end p-10 shadow-2xl shadow-black/20 transition-all cursor-pointer"
            >
              <span className="text-white text-3xl font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-all duration-300">
                Scale
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -15, rotate: -4, scale: 1.05 }}
              className="group absolute top-[260px] right-[45%] w-[240px] h-[240px] bg-white border border-gray-100 shadow-xl rounded-[48px] flex flex-col justify-end p-10 transition-all cursor-pointer"
            >
              <span className="text-black/20 text-3xl font-black uppercase tracking-tighter group-hover:text-black group-hover:opacity-100 transition-all duration-300">
                Impact
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -15, rotate: 4, scale: 1.05 }}
              className="group absolute top-[300px] right-0 w-[240px] h-[240px] bg-gray-50 rounded-[48px] flex flex-col justify-center items-center p-10 transition-all cursor-pointer"
            >
              <Globe
                size={48}
                className="text-gray-200 group-hover:text-red-600 transition-all duration-700 mb-6"
              />
              <span className="text-gray-300 text-2xl font-black uppercase tracking-tighter group-hover:text-black transition-all duration-300">
                Global
              </span>
            </motion.div>
            <div className="absolute inset-0 bg-red-500/5 blur-[120px] rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="pb-40 pt-12 px-6 max-w-[1300px] mx-auto">
        <div className="bg-white border border-gray-100 shadow-[0_60px_150px_-30px_rgba(0,0,0,0.12)] rounded-[80px] p-16 md:p-32 text-center relative overflow-hidden">
          <Reveal>
            <div className="relative z-10 space-y-16">
              <h2 className="text-6xl md:text-[110px] font-black mb-12 leading-[0.8] tracking-tighter uppercase italic">
                Choose Your <br />
                <span className="text-red-600">Pathway.</span>
              </h2>
              <p className="text-gray-400 text-2xl font-light max-w-lg mx-auto leading-relaxed">
                Whether you are building your first project or scaling your next
                unicorn, the journey starts here.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                <Link
                  href="/find"
                  className="group px-14 py-7 bg-black text-white rounded-full flex items-center gap-5 transition-all hover:bg-red-600 hover:scale-105 shadow-2xl shadow-black/10 active:scale-95"
                >
                  <span className="text-[12px] font-[900] uppercase tracking-[0.4em]">
                    Find Opportunities
                  </span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-3 transition-transform duration-500"
                  />
                </Link>

                <Link
                  href="/hire"
                  className="group px-14 py-7 bg-white border border-black text-black rounded-full flex items-center gap-5 transition-all hover:bg-black hover:text-white hover:scale-105 active:scale-95"
                >
                  <span className="text-[12px] font-[900] uppercase tracking-[0.4em]">
                    Hire Talent
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-12 lg:px-20 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-16">
        <div className="text-4xl font-black tracking-tighter italic">
          IK<span className="text-red-600">.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-16 text-[12px] font-black uppercase tracking-[0.4em] text-gray-300">
          <a href="#" className="hover:text-red-600 transition-colors">
            X
          </a>
          <a href="#" className="hover:text-red-600 transition-colors">
            LinkedIn
          </a>
          <a href="#" className="hover:text-red-600 transition-colors">
            Instagram
          </a>
        </div>
        <div className="text-[10px] font-mono text-gray-200 uppercase tracking-widest select-none">
          Architect_Rel_2026_Master
        </div>
      </footer>
    </div>
  );
}
