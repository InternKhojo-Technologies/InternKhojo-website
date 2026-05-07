"use client";

import { motion } from "framer-motion";
import Container from "./ui/Container";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="bg-white py-24 lg:py-32 relative overflow-hidden border-t border-gray-100">
      <Container>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            {/* Left: Text Content */}
            <div className="max-w-xl text-left">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em]">
                  Join the Ecosystem
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[0.95]"
              >
                Stop searching. <br />
                Start{" "}
                <span className="relative inline-block text-red-600 italic">
                  building.
                  {/* Organic Sketchy Underline - High Contrast */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10C30 8 70 11 100 7C130 3 170 1 198 5"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="opacity-90"
                    />
                  </svg>
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-8 text-gray-500 text-lg font-medium leading-relaxed"
              >
                InternKhojo connects India's most ambitious student talent with
                high-growth startups. Direct access, zero noise.
              </motion.p>
            </div>

            {/* Right: Action Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <button
                onClick={() => router.push("/find")}
                className="group flex items-center gap-4 px-10 py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-red-600 active:scale-95 shadow-xl shadow-black/10"
              >
                Find Work
                <MoveRight
                  size={18}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>

              <button
                onClick={() => router.push("/hire")}
                className="px-10 py-5 bg-white border border-gray-200 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
              >
                Hire Talent
              </button>
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Subtle Background Detail (Light Theme) */}
      <div className="absolute top-0 right-0 w-[400px] h-full bg-gray-50 -skew-x-12 translate-x-20 pointer-events-none -z-0" />
    </section>
  );
}
