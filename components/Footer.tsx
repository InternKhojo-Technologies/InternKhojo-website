"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Linkedin, Youtube, ChevronDown } from "lucide-react";

// Custom X (Twitter) Icon
function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer() {
  // Mobile accordion state (stores index of open section)
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  // 🎯 YAHAN DIRECT LINK KE BAGAL MEIN URL CHANGE KARO:
  const footerSections = [
    {
      title: "For Client",
      links: [
        { name: "How to hire", href: "/" },
        { name: "Hire freelancer", href: "/" },
        { name: "Dashboard", href: "/" },
      ],
    },
    {
      title: "For Talent",
      links: [
        { name: "Find work", href: "/" },
        { name: "Direct contact", href: "/" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help center", href: "/" },
        { name: "Features", href: "/" },
        { name: "Blog", href: "/" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/" },
        { name: "Partners", href: "/" },
        { name: "Trust & safety", href: "/trust" },
      ],
    },
  ];

  const socialLinks = [
    { Icon: XIcon, href: "https://x.com", label: "X" },
    {
      Icon: Instagram,
      href: "https://www.instagram.com/internkhojo/",
      label: "Instagram",
    },
    {
      Icon: Linkedin,
      href: "https://linkedin.com/company/internkhojo",
      label: "LinkedIn",
    },
    { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  return (
    <footer className="w-full pt-1 pb-20 md:pb-4 px-2 lg:px-4 antialiased">
      <div
        className="
          bg-[#080808] 
          text-white 
          rounded-[28px] md:rounded-[32px]
          px-5 sm:px-8 lg:px-12 
          py-10 md:py-12
          relative
          overflow-hidden
          border border-white/[0.05]
          shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        "
      >
        {/* Optical Depth Glows */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-red-600/[0.02] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] md:w-[300px] h-[250px] md:h-[300px] bg-white/[0.01] blur-[100px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10">
          {/* HEADER ARCHITECTURE */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-10 mb-10 md:mb-12">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4 cursor-default">
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src="/logo-2.png"
                    alt="InternKhojo Logo"
                    width={38}
                    height={38}
                    className="brightness-110"
                  />
                </div>
                <h2 className="text-[30px] md:text-[36px] font-extrabold tracking-normal leading-none text-white">
                  InternKhojo<span className="text-red-600">.</span>
                </h2>
              </div>
              <p className="text-[13px] md:text-[14px] text-gray-300 font-semibold leading-tight tracking-tight max-w-lg">
                Standardizing early-career talent pipelines for Bharat.
              </p>
            </div>

            {/* SOCIAL LINKS */}
            <div className="space-y-3 md:space-y-4 w-full md:w-auto md:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 md:text-gray-600 leading-none">
                Follow Us
              </p>
              <div className="flex gap-3 justify-start md:justify-end">
                {socialLinks.map(({ Icon, href, label }, i) => (
                  <Link
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 md:w-11 md:md:h-11 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-full hover:bg-red-600 hover:border-red-600 text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:shadow-red-600/20 backdrop-blur-sm"
                  >
                    <Icon size={18} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP NAVIGATION GRID (Visible on md+) */}
          <div className="hidden md:grid md:grid-cols-4 gap-6 mb-12 pt-10 border-t border-white/[0.06]">
            {footerSections.map((section, i) => (
              <div key={i} className="group space-y-5">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.2em] text-gray-100 group-hover:text-red-500 transition-colors duration-300">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-gray-400 hover:text-white transition-all duration-200 font-medium inline-flex items-center gap-1 group/link"
                      >
                        <span className="group-hover/link:translate-x-1.5 transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* MOBILE ACCORDION / DROPDOWN (Visible on mobile only) */}
          <div className="md:hidden mb-10 pt-4 border-t border-white/[0.06] divide-y divide-white/[0.06]">
            {footerSections.map((section, i) => {
              const isOpen = openSection === i;
              return (
                <div key={i} className="py-3.5">
                  <button
                    onClick={() => toggleSection(i)}
                    className="w-full flex items-center justify-between py-1 text-left"
                  >
                    <span className="text-[13px] font-bold uppercase tracking-[0.15em] text-gray-200">
                      {section.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-red-500" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden space-y-2.5 pt-3 pb-1 pl-2"
                      >
                        {section.links.map((link, j) => (
                          <li key={j}>
                            <Link
                              href={link.href}
                              className="text-[13px] text-gray-400 hover:text-white transition-colors duration-200 block py-1"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* BOTTOM LEGAL BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 md:pt-10 border-t border-white/[0.04]">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-3">
              <span className="text-[13px] md:text-[14px] font-black tracking-tight text-gray-500 whitespace-nowrap">
                © 2026 Corvian Ventures LLP
              </span>

              <div className="flex items-center gap-6">
                <Link
                  href="/terms"
                  className="text-[12px] font-black tracking-tight text-gray-500 hover:text-red-500 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-[12px] font-black tracking-tight text-gray-500 hover:text-red-500 transition-colors"
                >
                  Privacy
                </Link>
              </div>
            </div>

            {/* Bharat Capsule */}
            <div
              className="
                flex items-center gap-3.5
                bg-white/[0.03] border border-white/[0.08]
                px-5 py-2
                rounded-full
                group hover:bg-white/[0.06] hover:border-red-600/30 transition-all duration-300 cursor-default backdrop-blur-md
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
              <span className="text-[10px] font-black uppercase tracking-[0.08em] text-gray-400 group-hover:text-white transition-colors duration-300">
                PROUDLY MADE IN BHARAT{" "}
                <span className="ml-1 opacity-70 group-hover:opacity-100 inline-block transition-transform group-hover:scale-110">
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
