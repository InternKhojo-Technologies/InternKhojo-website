"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    /* 🔥 Added pb-20 on mobile to clear the navbar, md:pb-4 for desktop */
    <footer className="w-full pt-1 pb-20 md:pb-4 px-1 lg:px-2 antialiased">
      <div
        className="
          bg-[#080808] 
          text-white 
          rounded-[32px] 
          px-6 lg:px-12 
          py-12
          /* 🔥 Added pb-16 only on mobile to give extra internal room */
          pb-16 md:pb-12
          relative
          overflow-hidden
          border border-white/[0.05]
          shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        "
      >
        {/* Optical Depth Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/[0.02] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/[0.01] blur-[100px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10">
          {/* HEADER ARCHITECTURE */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-4 cursor-default">
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src="/logo-2.png"
                    alt="InternKhojo Logo"
                    width={38}
                    height={38}
                    className="brightness-110"
                  />
                </div>
                <h2 className="text-[36px] font-extrabold tracking-normal leading-none text-white">
                  InternKhojo<span className="text-red-600">.</span>
                </h2>
              </div>
              <p className="text-[14px] text-gray-300 font-semibold leading-tight tracking-tight max-w-lg">
                Standardizing early-career talent pipelines for Bharat.
              </p>
            </div>

            <div className="space-y-4 md:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 leading-none">
                Follow Us
              </p>
              <div className="flex gap-3 justify-start md:justify-end">
                {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="w-11 h-11 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-full hover:bg-red-600 hover:border-red-600 text-gray-400 hover:text-white transition-all duration-500 shadow-lg hover:shadow-red-600/20 backdrop-blur-sm"
                  >
                    <Icon size={19} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* NAVIGATION GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-6 mb-12 pt-10 border-t border-white/[0.06]">
            {[
              {
                title: "For Client",
                links: ["How to hire", "Hire freelancer", "Dashboard"],
              },
              {
                title: "For Talent",
                links: ["Find work", "Direct contact"],
              },
              {
                title: "Resources",
                links: ["Help center", "Features", "Blog"],
              },
              {
                title: "Company",
                links: [
                  "About",
                  "Careers",
                  "Contact",
                  "Partners",
                  "Trust & safety",
                ],
              },
            ].map((section, i) => (
              <div key={i} className="group space-y-6">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.2em] text-gray-100 group-hover:text-red-500 transition-colors duration-500">
                  {section.title}
                </h4>
                <ul className="space-y-3.5">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href="#"
                        className="text-[13px] text-gray-400 hover:text-white transition-all duration-300 font-medium inline-flex items-center gap-1 group/link"
                      >
                        <span className="group-hover/link:translate-x-1.5 transition-transform duration-300">
                          {link}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* BOTTOM LEGAL BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-white/[0.04]">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-10 gap-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-black tracking-tight text-gray-500 whitespace-nowrap">
                  © 2026 InternKhojo LLP
                </span>
                <span className="text-[8px] bg-white/[0.05] border border-white/[0.05] px-1.5 py-0.5 rounded font-mono text-gray-600 select-none">
                  TM
                </span>
              </div>

              <div className="flex items-center gap-8">
                <Link
                  href="/terms"
                  className="text-[12px] font-black tracking-tight text-gray-500 hover:text-red-500 transition-all"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-[12px] font-black tracking-tight text-gray-500 hover:text-red-500 transition-all"
                >
                  Privacy
                </Link>
              </div>
            </div>

            {/* Premium Bharat Capsule */}
            <div
              className="
                flex items-center gap-4
                bg-white/[0.03] border border-white/[0.08]
                px-6 py-2.5
                rounded-full
                group hover:bg-white/[0.06] hover:border-red-600/30 transition-all duration-700 cursor-default backdrop-blur-md
              "
            >
              <div className="relative flex h-2 w-2">
                <motion.span
                  animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="absolute inline-flex h-full w-full rounded-full bg-red-600"
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.08em] text-gray-400 group-hover:text-white transition-colors duration-500">
                PROUDLY MADE IN BHARAT{" "}
                <span className="ml-1 opacity-70 group-hover:opacity-100 group-hover:scale-110 inline-block transition-all">
                  🇮🇳
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
