"use client"

import { motion } from "framer-motion"

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

export default function CompaniesStrip() {
  return (

    <div className="bg-[#2a0038] py-12 overflow-hidden">

      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
      >

        {[...companies, ...companies].map(
          (c, i) => (

            <div
              key={i}
              className="
                text-white/70
                text-xl
                font-semibold
              "
            >
              {c}
            </div>

          )
        )}

      </motion.div>

    </div>

  )
}