"use client"

import { motion } from "framer-motion"
import Container from "./ui/Container"

const companies = [
  "Google",
  "Amazon",
  "Microsoft",
  "Stripe",
  "Notion",
  "Airbnb",
  "Uber",
  "Spotify",
  "Meta",
  "Netflix",
  "OpenAI",
  "Tesla",
]

export default function Stats() {
  return (
    <div
      className="
      py-28
      text-white
      bg-gradient-to-r
      from-[#1b0026]
      to-[#3a004f]
    "
    >
      <Container>
        {/* STATS */}

        <div className="grid grid-cols-3 text-center gap-10">

          <div>
            <h3 className="text-7xl font-bold">
              50K+
            </h3>

            <p className="opacity-70 mt-2">
              Candidates Registered
            </p>
          </div>


          <div>
            <h3 className="text-7xl font-bold">
              8K+
            </h3>

            <p className="opacity-70 mt-2">
              Active Openings
            </p>
          </div>


          <div>
            <h3 className="text-7xl font-bold">
              20K+
            </h3>

            <p className="opacity-70 mt-2">
              Got Work via InternKhojo
            </p>
          </div>

        </div>


        {/* divider */}

        <div className="mt-16 border-t border-white/20" />


        <p className="text-center mt-6 opacity-70">
          Startups who used our platform
        </p>

      </Container>



      {/* STRIP */}

      <div className="mt-10 overflow-hidden">

        <motion.div
          className="flex gap-16 whitespace-nowrap px-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear",
          }}
        >
          {[...companies, ...companies].map(
            (c, i) => (
              <div
                key={i}
                className="
                  text-white/70
                  text-2xl
                  font-semibold
                "
              >
                {c}
              </div>
            )
          )}
        </motion.div>

      </div>
    </div>
  )
}