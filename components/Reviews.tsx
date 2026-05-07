"use client";

import { motion } from "framer-motion";
import Container from "./ui/Container";
import { Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Aarav Sharma",
    role: "Frontend Intern",
    content:
      "I got my first startup internship through InternKhojo and later got hired full time. Direct and seamless.",
    avatar: "AS",
  },
  {
    name: "Rohan Mehta",
    role: "Startup Founder",
    content:
      "We hired 3 developers using InternKhojo. Super fast. Recommended for early-stage teams.",
    avatar: "RM",
    featured: true,
  },
  {
    name: "Neha Verma",
    role: "UI Designer",
    content:
      "As a beginner I couldn't get a job, but InternKhojo gave me the real experience I needed for my portfolio.",
    avatar: "NV",
  },
];

export default function Reviews() {
  return (
    <section className="py-20 lg:py-28 bg-[#050505] relative overflow-hidden border-y border-white/5">
      <Container>
        {/* COMPACT HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-[1.5px] bg-red-600" />
              <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] italic">
                Testimonials
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              BUILT WITH <span className="text-red-600 italic">TALENT.</span>
            </h2>
          </div>

          <p className="text-gray-500 font-medium text-sm max-w-[280px] border-l border-red-600/30 pl-5 text-left leading-snug">
            Bridging the gap between learning and professional experience.
          </p>
        </div>

        {/* COMPACT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`
                relative p-8 rounded-[2rem] border transition-all duration-300
                ${
                  review.featured
                    ? "bg-gradient-to-br from-red-600/5 to-transparent border-red-600/20"
                    : "bg-[#0A0A0A] border-white/5 hover:border-white/10"
                }
              `}
            >
              <Quote
                className={`mb-6 ${review.featured ? "text-red-600" : "text-white/10"}`}
                size={28}
              />

              <blockquote className="text-gray-400 text-base font-medium leading-relaxed mb-8 italic tracking-tight">
                "{review.content}"
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  <span className="text-white font-black text-[10px] opacity-40">
                    {review.avatar}
                  </span>
                </div>

                <div>
                  <p className="text-white font-black text-sm uppercase italic tracking-tighter leading-none mb-1">
                    {review.name}
                  </p>
                  <p className="text-red-600 text-[9px] font-bold uppercase tracking-widest">
                    {review.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
