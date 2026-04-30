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

  const features = [
    {
      icon: Command,
      title: "Curation",
      text: "Manual vetting for every role.",
    },
    {
      icon: Fingerprint,
      title: "DNA",
      text: "Proof-of-work driven identity.",
    },
    {
      icon: Zap,
      title: "Velocity",
      text: "Instant hiring loops.",
    },
    {
      icon: Award,
      title: "Mentorship",
      text: "1:1 expert guidance.",
    },
  ];

  return (
    <div className="bg-white text-black overflow-x-hidden">
      {/* HERO */}
      <section className="min-h-[90vh] flex items-center px-6 lg:px-20 relative">
        <motion.div style={{ opacity: heroOpacity }}>
          <h1 className="text-[clamp(4rem,14vw,10rem)] font-black leading-[0.8] tracking-[-0.05em]">
            ENGINEERING <br />
            <span className="text-red-600">AMBITION</span>
          </h1>

          <p className="mt-8 text-xl text-gray-500 max-w-xl">
            InternKhojo is redefining how talent meets opportunity.
          </p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-32 px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;

            return (
              <Reveal key={idx} delay={idx * 0.1}>
                <div className="p-10 bg-gray-50 rounded-3xl hover:shadow-xl transition-all">
                  {/* FIXED ICON (IMPORTANT) */}
                  <div className="mb-10 text-red-600">
                    <Icon size={36} />
                  </div>

                  <h4 className="text-2xl font-bold mb-3">{item.title}</h4>

                  <p className="text-gray-500">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* MENTORSHIP */}
      <section className="py-24 px-6 lg:px-20 bg-black text-white">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-6xl font-black leading-tight">
              Access the <br />
              <span className="text-red-500">Boardroom</span>
            </h2>

            <p className="mt-6 text-gray-400">
              Connect with industry leaders and accelerate your career growth.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck />
                <span>Verified Experts</span>
              </div>

              <div className="flex items-center gap-3">
                <ArrowUpRight />
                <span>1:1 Mentorship</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl h-[400px] flex items-center justify-center text-6xl opacity-30">
            IK
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center px-6">
        <h2 className="text-6xl font-black">Choose Your Path</h2>

        <p className="mt-6 text-gray-500">Start your journey today.</p>

        <div className="mt-10 flex justify-center gap-6">
          <Link href="/find">
            <button className="px-8 py-4 bg-black text-white rounded-full flex items-center gap-2">
              Find Jobs <ArrowRight size={16} />
            </button>
          </Link>

          <Link href="/hire">
            <button className="px-8 py-4 border rounded-full flex items-center gap-2">
              Hire Talent <ArrowUpRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center text-gray-400 text-sm">
        © 2026 InternKhojo
      </footer>
    </div>
  );
}
