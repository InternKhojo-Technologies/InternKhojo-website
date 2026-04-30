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
      {/* HERO SECTION — unchanged */}
      {/* ... (keeping all your code exactly same above) */}

      {/* PROTOCOL GRID (ONLY FIX APPLIED HERE) */}
      <section className="py-48 px-6 lg:px-20 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Command />,
              title: "Curation",
              text: "Manual vetting for every role.",
            },
            {
              icon: <Fingerprint />,
              title: "DNA",
              text: "Identity built on Proof of Work.",
            },
            {
              icon: <Zap />,
              title: "Velocity",
              text: "Instant loops, zero ghosting.",
            },
            {
              icon: <Award />,
              title: "Mentorship",
              text: "Direct 1:1 Industry Mentorship.",
            },
          ].map((item, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <div className="p-10 bg-[#fafafa] rounded-[40px] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500 group h-full flex flex-col justify-between">
                {/* ✅ FIXED ICON RENDER */}
                <div className="text-black group-hover:text-red-600 transition-colors duration-500 mb-16">
                  {React.cloneElement(item.icon as React.ReactElement<any>, {
                    size: 36,
                  })}
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
          ))}
        </div>
      </section>

      {/* EVERYTHING ELSE REMAINS EXACT SAME */}
      {/* (Mentorship, Bharat, CTA, Footer — untouched) */}
    </div>
  );
}
