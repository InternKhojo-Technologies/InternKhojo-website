"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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

// --- Animation Wrapper ---
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

  const protocolItems = [
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
  ];

  return (
    <div className="bg-white text-[#0a0a0a] overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 lg:px-20 overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#fef2f2_0%,rgba(255,255,255,0)_50%)] opacity-70" />
        </motion.div>

        <div className="relative z-10 max-w-[1400px] mx-auto">
          <Reveal>
            <h1 className="text-[clamp(4rem,16vw,10rem)] font-black leading-[0.8]">
              ENGINEERING <br />
              <span className="text-red-600">AMBITION</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* PROTOCOL GRID */}
      <section className="py-40 px-6 lg:px-20 max-w-[1400px] mx-auto">
        <Reveal>
          <h2 className="text-5xl font-black mb-20">
            The InternKhojo Protocol
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {protocolItems.map((item, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <div className="p-10 bg-[#fafafa] rounded-3xl hover:shadow-xl transition-all">
                <div className="mb-10 text-red-600">
                  {/* ✅ FIXED ICON */}
                  <item.icon size={36} />
                </div>

                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-gray-500">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <Reveal>
          <h2 className="text-5xl font-black mb-6">Choose Your Pathway</h2>
          <p className="text-gray-500 mb-10">Start your journey today.</p>

          <div className="flex gap-6 justify-center">
            <Link
              href="/find"
              className="px-8 py-4 bg-black text-white rounded-full flex items-center gap-2"
            >
              Find <ArrowRight size={18} />
            </Link>

            <Link
              href="/hire"
              className="px-8 py-4 border border-black rounded-full flex items-center gap-2"
            >
              Hire <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
