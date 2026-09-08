import React from "react";
import Link from "next/link";
import PrivacyClient from "./PrivacyClient";
import {
  Building2,
  Globe,
  FileText,
  Calendar,
  Shield,
  Lock,
  Eye,
  Share2,
  UserCheck,
  Database,
  Cookie,
  AlertTriangle,
  Phone,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Privacy & Platform Policy",
  description:
    "Learn how InternKhojo collects, uses, protects, and manages data for Candidates and Companies.",
};

const EFFECTIVE_DATE = "August 09, 2026";
const LAST_UPDATED = "August 09, 2026";

export default function PrivacyPolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://internkhojo.com/privacy#webpage",
        url: "https://internkhojo.com/privacy",
        name: "Privacy & Platform Policy | InternKhojo",
        description:
          "Learn how InternKhojo collects, uses, protects, and manages data for Candidates and Companies.",
        inLanguage: "en-IN",
        datePublished: "2026-08-09",
        dateModified: "2026-08-09",
      },
      {
        "@type": "Organization",
        "@id": "https://internkhojo.com/#organization",
        name: "Corvian Ventures LLP",
        legalName: "Corvian Ventures LLP",
        alternateName: "InternKhojo",
        url: "https://internkhojo.com",
        telephone: "+918766330925",
        email: "legal@internkhojo.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Delhi",
          addressLocality: "New Delhi",
          addressRegion: "Delhi",
          postalCode: "110085",
          addressCountry: "IN",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-100 selection:text-red-900 scroll-smooth font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Page Header */}
        <header className="mb-8 border-b border-slate-200 pb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold uppercase tracking-wider mb-3">
            Platform Policy
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">
            Privacy &amp; Platform <span className="text-red-700">Policy.</span>
          </h1>
          <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-900">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm">
              <Calendar
                className="w-3.5 h-3.5 text-red-700"
                aria-hidden="true"
              />
              <span>
                Effective Date: <strong>{EFFECTIVE_DATE}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm">
              <Calendar
                className="w-3.5 h-3.5 text-red-700"
                aria-hidden="true"
              />
              <span>
                Last Updated: <strong>{LAST_UPDATED}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Company Meta Card */}
        <section
          aria-label="Company Overview"
          className="mb-8 bg-white rounded-xl border border-slate-300 p-5 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Building2
                  className="w-3.5 h-3.5 text-red-700"
                  aria-hidden="true"
                />{" "}
                Operated By
              </span>
              <p className="font-bold text-slate-900 text-sm">
                Corvian Ventures LLP
              </p>
              <p className="text-slate-600">d/b/a InternKhojo</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Globe
                  className="w-3.5 h-3.5 text-red-700"
                  aria-hidden="true"
                />{" "}
                Registered Office
              </span>
              <p className="font-bold text-slate-900 text-sm">
                Delhi, New Delhi
              </p>
              <p className="text-slate-600">110085, India</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Globe
                  className="w-3.5 h-3.5 text-red-700"
                  aria-hidden="true"
                />{" "}
                Website &amp; Version
              </span>
              <p className="font-bold text-slate-900 text-sm">
                <a
                  href="https://internkhojo.com"
                  className="text-red-700 underline hover:text-red-800"
                >
                  internkhojo.com
                </a>
              </p>
              <p className="text-slate-600">Version 2.0</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <FileText
                  className="w-3.5 h-3.5 text-red-700"
                  aria-hidden="true"
                />{" "}
                Privacy Contact
              </span>
              <p className="font-bold text-slate-900 text-sm">
                <a
                  href="mailto:legal@internkhojo.com"
                  className="text-red-700 underline hover:text-red-800"
                >
                  legal@internkhojo.com
                </a>
              </p>
              <p className="text-slate-600">+91 8766330925</p>
            </div>
          </div>
        </section>

        {/* Dynamic Client Component Layout */}
        <PrivacyClient>
          {/* Introduction */}
          <section className="border-b border-slate-200 pb-6">
            <p className="text-sm font-medium leading-relaxed mb-3">
              This Privacy &amp; Platform Policy explains how InternKhojo,
              operated by Corvian Ventures LLP, handles information and
              maintains a reliable platform for Candidates and Companies.
            </p>
            <p className="text-sm font-medium leading-relaxed">
              By using InternKhojo, you acknowledge the practices described in
              this Policy. Your use of the platform is also subject to our{" "}
              <Link
                href="/terms"
                className="text-red-700 font-bold underline hover:text-red-800"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/trust"
                className="text-red-700 font-bold underline hover:text-red-800"
              >
                Trust &amp; Safety Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Eye
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              1. INFORMATION WE COLLECT
            </h2>
            <p className="mb-3 font-semibold text-slate-900">
              Depending on how you use InternKhojo, we may collect:
            </p>

            <div className="space-y-4 text-xs sm:text-sm font-medium">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Account Information
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Login credentials and account parameters</li>
                  <li>Profile information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Candidate Information
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Education, skills, experience, and resumes</li>
                  <li>Portfolios, projects, and application details</li>
                  <li>
                    Other career-related information you choose to provide
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Company Information
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Company name, description, website, and business information
                  </li>
                  <li>Recruiter information and listings</li>
                  <li>
                    Information provided during registration or verification
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Platform and Technical Information
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>IP address, browser, and device parameters</li>
                  <li>Operating system and usage metrics</li>
                  <li>
                    Log, security information, cookies, and similar technologies
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-xs sm:text-sm font-medium">
              We may also collect information voluntarily provided through
              forms, communications, support requests, or platform reports.
            </p>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Shield
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              2. HOW WE USE INFORMATION
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              We may use information to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs sm:text-sm">
              <li>Create and manage accounts;</li>
              <li>Provide and personalise the Services;</li>
              <li>Display Candidate profiles and Company information;</li>
              <li>Display job and internship opportunities;</li>
              <li>Process and manage applications;</li>
              <li>
                Facilitate communication between Candidates and Companies;
              </li>
              <li>Provide notifications, support, and technical updates;</li>
              <li>
                Maintain security, detect and prevent fraud, abuse, and misuse;
              </li>
              <li>
                Investigate reported activity and analyze platform usage; and
              </li>
              <li>Comply with applicable legal and regulatory requirements.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Share2
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              3. HOW INFORMATION IS SHARED
            </h2>
            <p className="mb-3">
              We may share information when reasonably necessary to provide the
              Services. For example:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-xs sm:text-sm">
              <li>
                Candidate information may be made available to Companies where
                relevant to recruitment or applications.
              </li>
              <li>
                Company information and job listings may be visible to
                Candidates and platform visitors as part of the Services.
              </li>
              <li>
                Application information is shared directly with the Company to
                which a Candidate applies.
              </li>
              <li>
                Information may be shared with trusted service providers
                assisting in platform operations.
              </li>
              <li>
                Information may be disclosed where required by law or to protect
                user safety and platform security.
              </li>
            </ul>
            <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 uppercase">
              WE DO NOT SELL PERSONAL INFORMATION SIMPLY AS A SOURCE OF REVENUE.
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <UserCheck
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              4. PUBLIC AND USER-VISIBLE INFORMATION
            </h2>
            <p className="mb-3">
              Information placed on a profile, job listing, Company page,
              portfolio, or other public area may be visible to other Users or
              visitors.
            </p>
            <p className="font-semibold text-slate-900">
              Do not publish information that you do not want to be visible to
              others.
            </p>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Lock
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              5. DATA SECURITY
            </h2>
            <p className="mb-3">
              We use reasonable technical and organizational measures designed
              to protect information against unauthorized access, loss, misuse,
              alteration, or disclosure.
            </p>
            <p>
              However, no online service can guarantee absolute security. You
              remain responsible for maintaining the security of your account
              credentials.
            </p>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Database
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              6. DATA RETENTION
            </h2>
            <p className="mb-3">
              We retain information for as long as reasonably necessary to
              provide the Services, maintain accounts, support recruitment
              workflows, satisfy legal obligations, and maintain platform
              security.
            </p>
            <p>
              When information is no longer required, we may delete or anonymize
              it in accordance with applicable law.
            </p>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <FileText
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              7. YOUR DATA RIGHTS
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              Subject to applicable law, you may have rights regarding your
              personal data, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-xs sm:text-sm">
              <li>Requesting access to your information;</li>
              <li>Requesting correction of inaccurate information;</li>
              <li>Requesting deletion where applicable;</li>
              <li>
                Withdrawing consent where processing relies on consent; and
              </li>
              <li>Raising privacy-related concerns or complaints.</li>
            </ul>
            <p>
              You may contact us at{" "}
              <a
                href="mailto:legal@internkhojo.com"
                className="text-red-700 font-bold underline hover:text-red-800"
              >
                legal@internkhojo.com
              </a>{" "}
              for privacy-related requests. Identity verification may be
              required to protect your account.
            </p>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Cookie
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              8. COOKIES AND SIMILAR TECHNOLOGIES
            </h2>
            <p className="mb-3">
              InternKhojo uses cookies and similar technologies for
              authentication, security, preferences, analytics, and platform
              improvements.
            </p>
            <p>
              You may control cookies through your browser settings. Disabling
              certain cookies may affect platform functionality.
            </p>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Share2
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              9. THIRD-PARTY SERVICES
            </h2>
            <p className="mb-3">
              InternKhojo may use third-party service providers for hosting,
              authentication, analytics, communications, storage, or security
              operations.
            </p>
            <p>
              Third-party websites and services linked from InternKhojo are
              governed by their own privacy policies.
            </p>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <UserCheck
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              10. CHILDREN&apos;S AND MINOR USERS
            </h2>
            <p className="mb-3">
              InternKhojo is designed primarily for students, Candidates, and
              Companies. Where a User is a minor, applicable parental or
              guardian consent requirements must be followed.
            </p>
            <p>
              We do not knowingly collect children&apos;s personal data except
              as permitted by applicable law and for legitimate purposes.
            </p>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <AlertTriangle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              11. PLATFORM INTEGRITY AND SAFETY
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              We process information to investigate and prevent:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs sm:text-sm">
              <li>Fake accounts, impersonation, and fraudulent listings;</li>
              <li>
                Spam, harassment, security incidents, and platform abuse; and
              </li>
              <li>
                Violations of our Terms or{" "}
                <Link
                  href="/trust"
                  className="text-red-700 font-bold underline hover:text-red-800"
                >
                  Trust &amp; Safety Policy
                </Link>
                .
              </li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="section-12" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Shield
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              12. LEGAL AND REGULATORY COMPLIANCE
            </h2>
            <p>
              We may collect, retain, use, or disclose information where
              necessary to comply with applicable Indian laws, legal processes,
              government requests, court orders, or regulatory requirements.
            </p>
          </section>

          {/* Section 13 */}
          <section id="section-13" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <FileText
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              13. POLICY UPDATES
            </h2>
            <p>
              We may update this Policy when our Services, practices, or laws
              change. Material changes may be communicated through the Services,
              email, or other reasonable means where required by law.
            </p>
          </section>

          {/* Section 14 / Contact Section */}
          <section
            id="section-14"
            role="contentinfo"
            className="pt-6 border-t border-slate-200 scroll-mt-8"
          >
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
              14. CONTACT US
            </h2>
            <p className="text-xs sm:text-sm font-medium mb-3">
              For privacy questions, requests, or complaints:
            </p>
            <address className="not-italic bg-slate-100 p-5 rounded-lg border border-slate-300 text-xs sm:text-sm space-y-1.5 text-slate-900 font-semibold">
              <p className="font-bold text-sm sm:text-base">
                Corvian Ventures LLP
              </p>
              <p>Doing Business As: InternKhojo</p>
              <p>Delhi, New Delhi, Delhi 110085, India</p>
              <p className="flex items-center gap-2">
                <Phone
                  className="w-3.5 h-3.5 text-red-600"
                  aria-hidden="true"
                />{" "}
                +91 8766330925
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                <a
                  href="mailto:legal@internkhojo.com"
                  className="text-red-700 font-bold underline hover:text-red-800"
                >
                  legal@internkhojo.com
                </a>
              </p>
              <p className="flex items-center gap-2 pt-1">
                <Globe
                  className="w-3.5 h-3.5 text-red-600"
                  aria-hidden="true"
                />
                <a
                  href="https://internkhojo.com"
                  className="text-red-700 font-bold underline hover:text-red-800"
                >
                  https://internkhojo.com
                </a>
              </p>
            </address>
          </section>

          {/* Footer Card */}
          <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-xl scroll-mt-8">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-2 text-red-500">
              Platform Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              InternKhojo operates in full compliance with applicable Indian
              privacy laws, including provisions under the Digital Personal Data
              Protection Act, 2023.
            </p>
            <p className="mt-4 text-xs font-mono text-slate-300 border-t border-slate-800 pt-3">
              © 2026 Corvian Ventures LLP. All rights reserved.
            </p>
          </section>
        </PrivacyClient>
      </div>
    </main>
  );
}
