"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Zap,
  Fingerprint,
  Command,
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

// --- FAQ Data ---
const faqData = [
  {
    question: "What is InternKhojo?",
    answer:
      "InternKhojo is a next-generation talent platform that connects ambitious students and early-career professionals with curated internship opportunities across India and beyond. We vet every listing to ensure quality and relevance.",
  },
  {
    question: "How do I apply for an internship?",
    answer:
      "Simply create your profile, browse the available openings on our platform, and hit apply. Your application goes directly to the hiring team—no black holes, no ghosting. You'll receive status updates at every stage.",
  },
  {
    question: "Is InternKhojo free for students?",
    answer:
      "Yes, InternKhojo is completely free for students and job seekers. We believe access to opportunity should never have a paywall. Our revenue model is built around partnerships with companies, not candidates.",
  },
  {
    question: "How are internships vetted?",
    answer:
      "Every internship posted on InternKhojo goes through a manual curation process. We verify company legitimacy, role expectations, stipend transparency, and mentorship quality before any listing goes live.",
  },
  {
    question: "Can companies post internships on InternKhojo?",
    answer:
      "Absolutely. Companies and startups can onboard through our employer portal, create detailed role listings, and access our pool of pre-qualified, motivated candidates. We make hiring early talent effortless.",
  },
  {
    question: "What makes InternKhojo different from other job boards?",
    answer:
      "We're not a job board—we're a career launchpad. Every role is handpicked, every application gets a response, and we offer direct mentorship from industry leaders. No spam, no noise, just signal.",
  },
];

// --- FAQ Accordion Item ---
const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) => (
  <Reveal delay={index * 0.06}>
    <div
      className={`rounded-2xl md:rounded-3xl transition-all duration-400 ease-out ${isOpen
        ? "bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-100"
        : "bg-[#f4f5f7] hover:bg-[#ecedf0] border border-transparent"
        }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-6 md:px-8 py-5 md:py-6 text-left cursor-pointer"
      >
        <span className={`text-sm md:text-base font-semibold tracking-tight pr-6 transition-colors duration-300 ${isOpen ? "text-[#0a0a0a]" : "text-[#11a1a]"
          }`}>
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${isOpen
            ? "bg-red-600 text-white"
            : "bg-white text-[#0a0a0a] shadow-sm border border-gray-100"
            }`}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm md:text-[15px] text-gray-500 font-normal leading-relaxed px-6 md:px-8 pb-6 md:pb-7 max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </Reveal>
);

// --- FAQ Section ---
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-40 px-6 sm:px-12 lg:px-20 max-w-[800px] mx-auto">
      {/* Centered Header */}
      <div className="text-center mb-12 md:mb-16">
        <Reveal>
          <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.35em] text-gray-400 mb-5 md:mb-6">
            Trusted By
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-[#0a0a0a]">
            Frequently{" "}
            <br className="hidden sm:inline" />
            Asked Questions
          </h2>
        </Reveal>
      </div>

      {/* Accordion Items */}
      <div className="flex flex-col gap-3 md:gap-4">
        {faqData.map((item, idx) => (
          <FAQItem
            key={idx}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
};

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-white text-[#0a0a0a] selection:bg-red-600 selection:text-white antialiased overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 md:py-32 overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#fef2f2_0%,rgba(255,255,255,0)_50%)] opacity-70" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        </motion.div>

        <div className="max-w-[1500px] mx-auto w-full relative z-10">
          <Reveal>
            <div className="flex items-center gap-3 md:gap-5 mb-8 md:mb-16">
              <span className="h-[2px] w-12 md:w-16 bg-red-600" />
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-red-600">
                The Recruitment Standard
              </span>
            </div>

            <h1 className="text-[clamp(2.2rem,11vw,9.5rem)] font-[950] leading-[0.85] md:leading-[0.8] tracking-[-0.05em] md:tracking-[-0.07em] mb-12 md:mb-20 uppercase break-words">
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
                  className="ml-1 md:ml-2 h-[0.12em] w-[0.4em] bg-red-600 inline-block align-baseline"
                />
              </span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-end">
              <div className="lg:col-span-7">
                <p className="text-xl md:text-2xl lg:text-4xl font-light leading-[1.2] md:leading-[1.1] text-gray-400 tracking-tight">
                  InternKhojo is a career laboratory. We dismantle legacy hiring
                  models to forge elite connections between talent and industry.
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-1 md:gap-3">
                <div className="text-5xl md:text-7xl lg:text-[90px] font-black tracking-tighter leading-none italic text-black">
                  2026
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400">
                    Scaling Early Talent Globally
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. THE PROTOCOL GRID */}
      <section className="py-24 md:py-48 px-6 sm:px-12 lg:px-20 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-16 md:mb-32 gap-8 lg:gap-16">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none italic">
              The InternKhojo <br className="hidden sm:inline" />{" "}
              <span className="text-red-600">Protocol.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-400 max-w-xl font-light leading-snug mb-2">
              We trade in impact, not just applications. Our ecosystem is built
              on four pillars of professional authority.
            </p>
            <div className="text-red-500 font-mono text-[10px]">
              // SYSTEM_PROTOCOL: TALENT_FIRST
            </div>
          </Reveal>
        </div>
        {/* This is the curation dna velocity wala part */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Command,
              title: "Curation",
              text: "Manual vetting for every role.",
            },
            {
              icon: Fingerprint,
              title: "DNA",
              text: "Identity built on Proof of Work.",
            },
            {
              icon: Zap,
              title: "Velocity",
              text: "Instant loops, zero ghosting.",
            },
            {
              icon: Award,
              title: "Mentorship",
              text: "Direct 1:1 Industry Mentorship.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={idx} delay={idx * 0.1}>
                <div className="p-8 md:p-10 bg-[#fafafa] rounded-[32px] md:rounded-[40px] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500 group h-full flex flex-col justify-between">
                  <div className="text-black group-hover:text-red-600 transition-colors duration-500 mb-12 md:mb-16">
                    <Icon size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl md:text-2xl font-black mb-3 md:mb-4 uppercase tracking-tighter">
                      {item.title}
                    </h4>
                    <p className="text-sm md:text-base text-gray-400 font-medium tracking-tight leading-relaxed">
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
      <section className="py-12 md:py-24 px-4 lg:px-10">
        <div className="bg-[#080808] text-white rounded-[40px] md:rounded-[70px] p-8 sm:p-16 lg:p-32 relative overflow-hidden">
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-red-600/10 blur-[120px] sm:blur-[180px] rounded-full pointer-events-none" />

          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] md:leading-[0.9] mb-6 md:mb-12 uppercase">
                  Access <br />
                  <span className="text-red-600 italic">The Boardroom.</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed mb-8 md:mb-12 max-w-lg">
                  Don't just apply—evolve. Connect with senior executives and
                  industry veterans who provide the blueprint for your career
                  growth.
                </p>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-4 md:gap-6 group cursor-default">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 transition-colors flex-shrink-0">
                      <ShieldCheck className="text-red-600" size={20} />
                    </div>
                    <p className="text-base md:text-lg font-bold tracking-tight">
                      Vetted Expert Network
                    </p>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 group cursor-default">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 transition-colors flex-shrink-0">
                      <ArrowUpRight className="text-red-600" size={20} />
                    </div>
                    <p className="text-base md:text-lg font-bold tracking-tight">
                      1:1 Strategy Sessions
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square w-full max-w-[450px] lg:max-w-[600px] mx-auto bg-[#111] rounded-[32px] md:rounded-[50px] border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="text-[100px] md:text-[200px] font-black opacity-5 select-none text-white">
                  IK
                </div>
                <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 md:p-4 bg-red-600 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] text-white">
                      Live Session
                    </div>
                    <div className="text-gray-500 font-mono text-[9px] md:text-[10px]">
                      AUTH_MODE: MENTOR
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <div className="h-1.5 w-full bg-white/5 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-red-600 rounded-full"
                      />
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
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
      <section className="py-24 md:pt-48 md:pb-12 px-6 sm:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center lg:items-start">
          <div className="w-full lg:flex-1 pt-0 lg:pt-12 space-y-8 md:space-y-12">
            <Reveal>
              <div className="inline-block py-1 px-4 bg-red-50 border border-red-100 rounded-full mb-4 md:mb-8">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-red-600 flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-1.5 h-1.5 bg-red-600 rounded-full"
                  />
                  Operating from Bharat
                </p>
              </div>
              <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[-0.04em] md:tracking-[-0.05em] leading-[0.9] md:leading-[0.85] mb-6 md:mb-8 uppercase">
                ROOTED IN <br />
                <span className="text-red-600 italic">BHARAT.</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-md font-medium">
                Bharat is the world's talent engine. We aren't just starting
                here because it's home—we're starting here because this is where
                the most ambitious builders are born.
              </p>
              <div className="flex items-center gap-4 md:gap-6 mt-8 md:mt-12 pt-4 md:pt-6">
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
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 md:border-4 border-white bg-gray-200 object-cover"
                      alt="Builder"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-black/80">
                  Join 10k+ Builders
                </p>
              </div>
            </Reveal>
          </div>

          {/* 🔥 FIXED ASYMMETRICAL COLUMN OFFSET PATTERN WITHOUT OVERLAPS */}
          <div className="w-full flex-1 max-w-[500px] md:max-w-[600px] mx-auto mt-12 lg:mt-0 select-none">
            {/* Using flex-row split structure to create a natural un-overlapped shifting columns view */}
            <div className="flex gap-4 sm:gap-6 md:gap-8 w-full items-start">
              {/* LEFT COLUMN: Shifted Upward (`-mt-8 sm:-mt-12`) */}
              <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 flex-1 -mt-8 sm:-mt-12">
                {/* Box 1: BHARAT (Red) */}
                <motion.div
                  whileHover={{ y: -8, rotate: -2, scale: 1.03 }}
                  className="group aspect-square bg-red-600 rounded-[28px] sm:rounded-[40px] md:rounded-[48px] shadow-xl shadow-red-500/10 p-6 sm:p-8 md:p-10 flex flex-col justify-end transition-all cursor-pointer"
                >
                  <span className="text-white text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-all duration-300">
                    Bharat
                  </span>
                </motion.div>

                {/* Box 3: IMPACT (White) */}
                <motion.div
                  whileHover={{ y: -8, rotate: -2, scale: 1.03 }}
                  className="group aspect-square bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[28px] sm:rounded-[40px] md:rounded-[48px] flex flex-col justify-end p-6 sm:p-8 md:p-10 transition-all cursor-pointer"
                >
                  <span className="text-black/30 text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tighter group-hover:text-black transition-all duration-300">
                    Impact
                  </span>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: Standard Baseline */}
              <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 flex-1">
                {/* Box 2: SCALE (Black) */}
                <motion.div
                  whileHover={{ y: -8, rotate: 2, scale: 1.03 }}
                  className="group aspect-square bg-black rounded-[28px] sm:rounded-[40px] md:rounded-[48px] shadow-xl shadow-black/10 flex flex-col justify-end p-6 sm:p-8 md:p-10 transition-all cursor-pointer"
                >
                  <span className="text-white text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-all duration-300">
                    Scale
                  </span>
                </motion.div>

                {/* Box 4: GLOBAL (Gray) */}
                <motion.div
                  whileHover={{ y: -8, rotate: 2, scale: 1.03 }}
                  className="group aspect-square bg-gray-50 rounded-[28px] sm:rounded-[40px] md:rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center p-6 sm:p-8 md:p-10 transition-all cursor-pointer"
                >
                  <Globe
                    size={36}
                    className="text-gray-300 group-hover:text-red-600 transition-all duration-700 mb-3 sm:mb-4 flex-shrink-0"
                  />
                  <span className="text-gray-400 text-md sm:text-xl md:text-2xl font-black uppercase tracking-tighter group-hover:text-black transition-all duration-300">
                    Global
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <FAQSection />


      {/* 6. CTA SECTION */}
      <section className="pb-24 md:pb-40 pt-12 px-4 sm:px-6 max-w-[1300px] mx-auto">
        <div className="bg-white border border-gray-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] md:shadow-[0_60px_150px_-30px_rgba(0,0,0,0.12)] rounded-[40px] md:rounded-[80px] p-8 sm:p-16 md:p-32 text-center relative overflow-hidden">
          <Reveal>
            <div className="relative z-10 space-y-10 md:space-y-16">
              <h2 className="text-4xl sm:text-6xl md:text-[100px] lg:text-[110px] font-black mb-6 md:mb-12 leading-[0.9] md:leading-[0.8] tracking-tighter uppercase italic break-words">
                Choose Your <br />
                <span className="text-red-600">Pathway.</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-2xl font-light max-w-lg mx-auto leading-relaxed">
                Whether you are building your first project or scaling your next
                unicorn, the journey starts here.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 pt-4 md:pt-6 w-full max-w-md sm:max-w-none mx-auto">
                <Link
                  href="/find"
                  className="group w-full sm:w-auto px-8 md:px-14 py-5 md:py-7 bg-black text-white rounded-full flex items-center justify-center gap-4 md:gap-5 transition-all hover:bg-red-600 hover:scale-105 shadow-xl active:scale-95 text-center"
                >
                  <span className="text-[10px] md:text-[12px] font-[900] uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap">
                    Find Opportunities
                  </span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-2 transition-transform duration-500 flex-shrink-0"
                  />
                </Link>

                <Link
                  href="/hire"
                  className="group w-full sm:w-auto px-8 md:px-14 py-5 md:py-7 bg-white border border-black text-black rounded-full flex items-center justify-center gap-4 md:gap-5 transition-all hover:bg-black hover:text-white hover:scale-105 active:scale-95 text-center"
                >
                  <span className="text-[10px] md:text-[12px] font-[900] uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap">
                    Hire Talent
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0"
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT PAGE SPECIFIC LOCAL FOOTER */}
      <footer className="py-16 md:py-24 px-6 sm:px-12 lg:px-20 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-16">
        <div className="text-3xl md:text-4xl font-black tracking-tighter italic">
          IK<span className="text-red-600">.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-300">
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
        <div className="text-[9px] md:text-[10px] font-mono text-gray-200 uppercase tracking-widest select-none">
          Architect_Rel_2026_Master
        </div>
      </footer>
    </div>
  );
}
