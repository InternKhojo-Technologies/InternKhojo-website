"use client";

import React, { useState } from "react";
import { List, ChevronDown } from "lucide-react";

const NAVIGATION_LINKS = [
  { name: "1. About InternKhojo", href: "#section-1" },
  { name: "2. Eligibility", href: "#section-2" },
  { name: "3. Our Role", href: "#section-3" },
  { name: "4. Accounts", href: "#section-4" },
  { name: "5. Jobs and Internships", href: "#section-5" },
  { name: "6. User Responsibilities", href: "#section-6" },
  { name: "7. User Content", href: "#section-7" },
  { name: "8. Intellectual Property", href: "#section-8" },
  { name: "9. Payments", href: "#section-9" },
  { name: "10. Privacy & Policies", href: "#section-10" },
  { name: "11. Third-Party Services", href: "#section-11" },
  { name: "12. Suspension & Termination", href: "#section-12" },
  { name: "13. Availability & Disclaimer", href: "#section-13" },
  { name: "14. Limitation of Liability", href: "#section-14" },
  { name: "15. Indemnification", href: "#section-15" },
  { name: "16. Changes to Terms", href: "#section-16" },
  { name: "17. Governing Law & Disputes", href: "#section-17" },
  { name: "18. General", href: "#section-18" },
  { name: "19. Contact Us", href: "#section-19" },
];

export default function TermsClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Mobile Collapsible TOC */}
      <div className="block lg:hidden mb-6 bg-white rounded-xl border border-slate-300 p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 rounded p-1"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-red-700" aria-hidden="true" />
            <span>On this page</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="mt-3 pt-3 border-t border-slate-200"
          >
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-900">
              {NAVIGATION_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-1.5 px-2 rounded hover:bg-slate-100 hover:text-red-700 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <nav
        aria-label="Table of Contents"
        role="doc-toc"
        className="hidden lg:block lg:col-span-4 bg-white rounded-xl border border-slate-300 p-5 shadow-sm sticky top-6"
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
          <List className="w-4 h-4 text-red-700" aria-hidden="true" />
          <span>On this page</span>
        </h2>
        <ol className="space-y-1 text-xs font-semibold text-slate-900">
          {NAVIGATION_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block py-1.5 px-2.5 rounded hover:text-red-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Main Legal Content Container */}
      <article className="lg:col-span-8 bg-white rounded-xl border border-slate-300 p-6 sm:p-10 shadow-sm space-y-10 leading-relaxed text-slate-900">
        {children}
      </article>
    </div>
  );
}
