import React from "react";
import Link from "next/link";
import TrustClient from "./TrustClient";
import {
  Building2,
  Globe,
  FileText,
  Calendar,
  ShieldAlert,
  UserCheck,
  Briefcase,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "Trust & Safety Policy | InternKhojo",
  description:
    "Learn about InternKhojo's safety standards, candidate protection rules, company expectations, and platform reporting guidelines.",
};

const EFFECTIVE_DATE = "August 09, 2026";
const LAST_UPDATED = "August 09, 2026";

export default function TrustAndSafetyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://internkhojo.com/trust#webpage",
        url: "https://internkhojo.com/trust",
        name: "Trust & Safety Policy | InternKhojo",
        description:
          "Learn about InternKhojo's safety standards, candidate protection rules, company expectations, and platform reporting guidelines.",
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
            Safety Policy
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">
            Trust &amp; <span className="text-red-700">Safety.</span>
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
                Safety Reports
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

        {/* Dynamic Client Layout */}
        <TrustClient>
          {/* Introduction */}
          <section className="border-b border-slate-200 pb-6">
            <p className="text-sm font-medium leading-relaxed mb-3">
              InternKhojo is built to help Candidates find genuine opportunities
              and Companies connect with suitable talent.
            </p>
            <p className="text-sm font-medium leading-relaxed mb-3">
              We want InternKhojo to remain a professional and trustworthy
              environment for everyone using the platform.
            </p>
            <p className="text-sm font-medium leading-relaxed">
              This Trust &amp; Safety Policy explains what we prohibit, what
              Users should watch for, and what InternKhojo may do when safety or
              platform integrity is at risk. Your use of InternKhojo is also
              governed by our{" "}
              <Link
                href="/terms"
                className="text-red-700 font-bold underline hover:text-red-800"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-red-700 font-bold underline hover:text-red-800"
              >
                Privacy &amp; Platform Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldAlert
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              1. WHAT WE DO NOT ALLOW
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              InternKhojo does not allow:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-sm">
              <li>fake or fraudulent internships or jobs;</li>
              <li>fake Companies or Candidate accounts;</li>
              <li>impersonation;</li>
              <li>scams or phishing;</li>
              <li>
                requests for passwords, OTPs, PINs, or authentication
                credentials;
              </li>
              <li>misleading job or internship descriptions;</li>
              <li>fraudulent recruitment schemes;</li>
              <li>deceptive collection of personal information;</li>
              <li>harassment, threats, abuse, or intimidation;</li>
              <li>unlawful discrimination;</li>
              <li>spam or mass unsolicited communication;</li>
              <li>malicious software or harmful code;</li>
              <li>fraudulent applications or credentials;</li>
              <li>
                manipulation of reviews, applications, or platform activity; or
              </li>
              <li>activity that violates our Terms or applicable law.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <UserCheck
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              2. SAFETY FOR CANDIDATES
            </h2>
            <p className="mb-3 font-semibold text-slate-900">
              Before accepting an internship or job:
            </p>

            <div className="space-y-4 text-xs sm:text-sm font-medium">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Verify the Company
                </h3>
                <p>
                  Check the Company&apos;s website, official contact
                  information, online presence, and other available information.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Be Careful With Payments
                </h3>
                <p className="mb-2">
                  Be cautious if someone asks you to pay money for:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>an interview;</li>
                  <li>a job or internship;</li>
                  <li>registration;</li>
                  <li>training;</li>
                  <li>equipment;</li>
                  <li>a security deposit; or</li>
                  <li>a guaranteed placement.</li>
                </ul>
                <p className="mt-2 text-xs font-bold text-slate-900 uppercase">
                  InternKhojo does not guarantee any opportunity or employment
                  outcome.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Protect Your Credentials
                </h3>
                <p className="mb-2">Never share:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>passwords;</li>
                  <li>OTPs;</li>
                  <li>banking PINs;</li>
                  <li>authentication codes;</li>
                  <li>card credentials; or</li>
                  <li>other sensitive security credentials</li>
                </ul>
                <p className="mt-2">
                  with someone claiming to represent a Company or InternKhojo.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Watch for Red Flags
                </h3>
                <p className="mb-2">Be cautious of:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>unrealistic compensation;</li>
                  <li>guaranteed jobs;</li>
                  <li>urgent payment demands;</li>
                  <li>requests for unnecessary sensitive information;</li>
                  <li>suspicious email addresses;</li>
                  <li>
                    pressure to move communication to unknown platforms; or
                  </li>
                  <li>requests that do not match the advertised role.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Briefcase
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              3. SAFETY FOR COMPANIES
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              Companies and recruiters are expected to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>publish genuine opportunities;</li>
              <li>accurately describe roles and requirements;</li>
              <li>use authorised company information;</li>
              <li>communicate professionally;</li>
              <li>protect Candidate information;</li>
              <li>avoid deceptive recruitment practices; and</li>
              <li>comply with applicable laws.</li>
            </ul>
            <p className="font-semibold text-slate-900">
              Companies should not request unnecessary sensitive information
              from Candidates.
            </p>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Lock
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              4. PROTECTING CANDIDATE INFORMATION
            </h2>
            <p className="mb-3">
              Companies must use Candidate information obtained through
              InternKhojo only for legitimate purposes connected with
              recruitment or other authorised interactions.
            </p>
            <p className="mb-2 font-bold text-slate-900">Companies must not:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-sm">
              <li>sell Candidate information;</li>
              <li>misuse Candidate information;</li>
              <li>
                publish Candidate information without appropriate authority;
              </li>
              <li>use Candidate information for unrelated spam; or</li>
              <li>disclose Candidate information unlawfully.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <AlertTriangle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              5. REPORT SUSPICIOUS ACTIVITY
            </h2>
            <p className="mb-3">
              If you encounter a suspicious job or internship, Company,
              Candidate, profile, message, application, or other activity,
              please report it to us.
            </p>
            <p className="mb-2 font-bold text-slate-900">
              Include, where possible:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-4 font-medium text-sm">
              <li>the relevant profile or listing;</li>
              <li>what happened;</li>
              <li>screenshots or supporting information; and</li>
              <li>any other information that may help us investigate.</li>
            </ul>
            <div className="p-4 bg-red-100 rounded-lg border-l-4 border-red-700 text-red-950 font-bold text-xs sm:text-sm">
              Report via Email:{" "}
              <a
                href="mailto:legal@internkhojo.com"
                className="underline hover:text-red-800"
              >
                legal@internkhojo.com
              </a>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldAlert
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              6. WHAT INTERNKHOJO MAY DO
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              When we receive a report or identify suspicious activity, we may:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>investigate the matter;</li>
              <li>request additional information;</li>
              <li>restrict or remove a listing;</li>
              <li>limit account functionality;</li>
              <li>suspend an account;</li>
              <li>terminate an account;</li>
              <li>prevent repeated abuse;</li>
              <li>preserve relevant information where appropriate; and</li>
              <li>
                cooperate with law-enforcement or regulatory authorities where
                required or permitted by law.
              </li>
            </ul>
            <p>
              We may take action even when we cannot publicly disclose the
              details of an investigation.
            </p>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <CheckCircle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              7. ACCOUNT VERIFICATION
            </h2>
            <p className="mb-3">
              InternKhojo may introduce or use verification measures for
              Candidates, Companies, recruiters, listings, or other Users.
            </p>
            <p className="mb-3">
              Verification may involve information or documents reasonably
              necessary to establish authenticity.
            </p>
            <p>
              A verification badge or similar indicator, where provided, does
              not constitute a guarantee of a User&apos;s conduct,
              qualifications, financial condition, or future behaviour.
            </p>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <HelpCircle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              8. OUR ROLE IN SAFETY
            </h2>
            <p className="mb-3">
              InternKhojo provides tools and processes intended to reduce fraud,
              abuse, and harmful activity. However, no platform can guarantee
              that every fraudulent or harmful activity will be detected or
              prevented.
            </p>
            <p className="mb-3">
              InternKhojo does not guarantee the identity, legitimacy, conduct,
              qualifications, financial condition, or intentions of every User.
            </p>
            <p>
              Users should conduct reasonable due diligence before entering into
              an internship, employment, financial, or other relationship with
              another User.
            </p>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <AlertTriangle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              9. IMMEDIATE SAFETY CONCERNS
            </h2>
            <p className="mb-3 font-semibold text-slate-900">
              If you believe there is an immediate threat to your physical
              safety or another person is in immediate danger, contact the
              appropriate local emergency or law-enforcement authorities first.
            </p>
            <p className="text-xs uppercase font-bold text-slate-900">
              InternKhojo&apos;s reporting system should not be treated as an
              emergency response service.
            </p>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <FileText
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              10. POLICY UPDATES
            </h2>
            <p>
              We may update this Trust &amp; Safety Policy as InternKhojo&apos;s
              Services, safety practices, or applicable laws develop. Material
              changes may be communicated through the Services or other
              reasonable means where required by law.
            </p>
          </section>

          {/* Section 11 / Contact Section */}
          <section
            id="section-11"
            role="contentinfo"
            className="pt-6 border-t border-slate-200 scroll-mt-8"
          >
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
              11. CONTACT US
            </h2>
            <p className="text-xs sm:text-sm font-medium mb-3">
              For safety reports, abuse complaints, suspicious activity, or
              Trust &amp; Safety concerns:
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
              Community Protection
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              We continually update our automated detection and reporting
              workflows to maintain a safe, fraud-free environment across all
              candidate and recruiter interactions.
            </p>
            <p className="mt-4 text-xs font-mono text-slate-300 border-t border-slate-800 pt-3">
              © 2026 Corvian Ventures LLP. All rights reserved.
            </p>
          </section>
        </TrustClient>
      </div>
    </main>
  );
}
