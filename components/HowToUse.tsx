"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "./ui/Container";

export default function HowToUse() {
  const [mode, setMode] = useState("user");
  const [active, setActive] = useState(-1);

  const userSteps = [
    { title: "Connect", img: "/illustrations/1.webp" },
    { title: "Meet", img: "/illustrations/1.webp" },
    { title: "Work", img: "/illustrations/1.webp" },
    { title: "Grow", img: "/illustrations/1.webp" },
  ];

  const hireSteps = [
    { title: "Post Job", img: "/illustrations/3.webp" },
    { title: "Find Talent", img: "/illustrations/3.webp" },
    { title: "Hire Fast", img: "/illustrations/3.webp" },
    { title: "Build Team", img: "/illustrations/3.webp" },
  ];

  const steps = mode === "user" ? userSteps : hireSteps;

  return (
    <div className="bg-white">
      {" "}
      {/* ← fixes grey section */}
      <Container>
        <div className="py-32 grid grid-cols-2 gap-16 items-center">
          {/* LEFT */}

          <div>
            <p className="text-sm tracking-widest opacity-60">
              START YOUR JOURNEY
            </p>

            <h2 className="text-5xl font-bold mt-4">
              One Network for your
              <br />
              Amazing Career.
            </h2>

            <p className="mt-4 opacity-70 max-w-md">
              InternKhojo connects students, freelancers and startups to work
              together and build experience.
            </p>

            {/* toggle */}

            <div className="mt-6 bg-white inline-flex rounded-full p-1 shadow-lg">
              <button
                onClick={() => setMode("user")}
                className={`px-4 py-1 rounded-full transition ${
                  mode === "user" ? "bg-blue-600 text-white" : "text-gray-700"
                }`}
              >
                Work
              </button>

              <button
                onClick={() => setMode("hire")}
                className={`px-4 py-1 rounded-full transition ${
                  mode === "hire" ? "bg-blue-600 text-white" : "text-gray-700"
                }`}
              >
                Hire
              </button>
            </div>
          </div>

          {/* RIGHT CARDS */}

          <div
            className="flex gap-4 h-[480px]"
            onMouseLeave={() => setActive(-1)}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                onHoverStart={() => setActive(i)}
                onHoverEnd={() => setActive(-1)}
                animate={{
                  flex: active === i ? 3 : 1,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeInOut",
                }}
                className="
                  relative rounded-2xl overflow-hidden
                  bg-white shadow-xl p-[4px]
                  cursor-pointer
                "
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  {/* IMAGE */}

                  <motion.div
                    animate={{
                      scale: active === i ? 1.08 : 1,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                  </motion.div>

                  {/* SHADOW */}

                  <div
                    className={`
                      absolute bottom-0 left-0 right-0
                      h-[15%]
                      transition
                      ${
                        active === i
                          ? "bg-gradient-to-t from-black/30 to-transparent"
                          : "bg-transparent"
                      }
                    `}
                  />

                  {/* TEXT */}

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={
                      active === i
                        ? { y: 0, opacity: 1 }
                        : { y: 10, opacity: 0 }
                    }
                    transition={{ duration: 0.25 }}
                    className="
                      absolute bottom-4 left-4
                      text-white font-bold text-lg
                    "
                  >
                    {step.title}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
