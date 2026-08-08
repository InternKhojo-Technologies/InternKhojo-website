import React from "react";
import Link from "next/link";
import TermsClient from "./TermsClient";
import {
  Building2,
  Globe,
  FileText,
  Calendar,
  Scale,
  UserCheck,
  Briefcase,
  Lock,
  ShieldAlert,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  Gavel,
  Phone,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Terms of Service | InternKhojo",
  description:
    "The legal agreement governing your access to and use of InternKhojo, operated by Corvian Ventures LLP.",
};

const EFFECTIVE_DATE = "August 09, 2026";
const LAST_UPDATED = "August 09, 2026";

export default function TermsOfServicePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://internkhojo.com/terms#webpage",
        url: "https://internkhojo.com/terms",
        name: "Terms of Service | InternKhojo",
        description:
          "The legal agreement governing your access to and use of InternKhojo, operated by Corvian Ventures LLP.",
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
            Legal Document
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">
            Terms of <span className="text-red-700">Service.</span>
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
                Legal Inquiries
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
        <TermsClient>
          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Scale
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              1. ABOUT INTERNKHOJO
            </h2>
            <p className="mb-3">
              InternKhojo is operated by Corvian Ventures LLP, a company
              registered in India (&quot;InternKhojo&quot;, &quot;we&quot;,
              &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="mb-3">
              InternKhojo operates{" "}
              <a
                href="https://internkhojo.com"
                className="text-red-700 font-bold underline hover:text-red-800"
              >
                https://internkhojo.com
              </a>{" "}
              and related services (collectively, the &quot;Services&quot;).
            </p>
            <p className="mb-3 font-semibold text-slate-900">
              The Services provide a platform connecting:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>
                <strong className="text-slate-900">Candidates</strong> —
                students, graduates, internship seekers, job seekers, and other
                individuals seeking career opportunities; and
              </li>
              <li>
                <strong className="text-slate-900">Companies</strong> —
                companies, startups, organisations, recruiters, and other
                entities seeking Candidates.
              </li>
            </ul>
            <p className="mb-3">
              InternKhojo may provide profiles, job and internship listings,
              applications, communication tools, search, recruitment features,
              and other related services.
            </p>
            <p className="mb-3">
              By accessing, registering for, or using InternKhojo, you agree to
              these Terms of Service (&quot;Terms&quot;).
            </p>
            <div className="p-4 bg-red-100 rounded-lg border-l-4 border-red-700 text-red-950 font-bold text-xs sm:text-sm uppercase tracking-wide my-4">
              IF YOU DO NOT AGREE WITH THEM, YOU MUST NOT USE THE SERVICES.
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <UserCheck
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              2. ELIGIBILITY
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-sm">
              <li>
                You must provide accurate and current information when creating
                or using an account.
              </li>
              <li>
                If you are under 18, you may use InternKhojo only with the
                involvement and consent of a parent or legal guardian where
                required by applicable law.
              </li>
              <li>
                Companies and recruiters must have appropriate authority to
                represent the organisation they register or act for.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Briefcase
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              3. OUR ROLE
            </h2>
            <p className="mb-3">
              InternKhojo is a platform and facilitator. We provide technology
              that allows Candidates and Companies to discover and communicate
              with one another.
            </p>
            <p className="mb-3">
              InternKhojo is not the employer, recruiter, staffing agency,
              educational institution, or contracting party for opportunities
              posted by third parties unless expressly stated otherwise.
            </p>
            <p className="mb-2 font-bold text-slate-900">
              We do not guarantee:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>an interview, internship, job, offer, or employment;</li>
              <li>that a Company will select a Candidate;</li>
              <li>that a Candidate will accept an opportunity;</li>
              <li>the accuracy or legitimacy of every listing or profile;</li>
              <li>the conduct or qualifications of another User; or</li>
              <li>any particular outcome from using the platform.</li>
            </ul>
            <p className="mb-3">
              InternKhojo is generally not a party to agreements or
              relationships formed between Candidates and Companies.
            </p>
            <p>
              Users are responsible for conducting their own verification and
              due diligence before entering into any relationship or transaction
              with another User.
            </p>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Lock
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              4. ACCOUNTS
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              You are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>providing truthful information;</li>
              <li>maintaining the accuracy of your information;</li>
              <li>keeping your login credentials secure;</li>
              <li>not sharing your account with unauthorised persons; and</li>
              <li>activity conducted through your account.</li>
            </ul>
            <p className="mb-3">
              You must not impersonate another person or organisation or create
              accounts using false information.
            </p>
            <p>
              We may suspend or terminate accounts containing false, fraudulent,
              misleading, or unauthorised information.
            </p>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Briefcase
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              5. JOBS AND INTERNSHIPS
            </h2>
            <p className="mb-3">
              Companies are responsible for ensuring that their job and
              internship listings are genuine, accurate, and lawful.
            </p>
            <p className="mb-2 font-bold text-slate-900">
              Companies must not post:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>fake or misleading opportunities;</li>
              <li>fraudulent schemes;</li>
              <li>
                opportunities intended to collect personal information
                deceptively;
              </li>
              <li>unlawful or discriminatory opportunities; or</li>
              <li>
                opportunities requiring Candidates to make improper or
                misleading payments.
              </li>
            </ul>
            <p className="mb-3">
              Candidates must provide truthful information in their profiles,
              resumes, and applications.
            </p>
            <p className="mb-3">
              InternKhojo does not guarantee the legitimacy, compensation,
              working conditions, or outcome of any third-party opportunity.
            </p>
            <div className="p-4 bg-red-100 rounded-lg border-l-4 border-red-700 text-red-950 font-bold text-xs sm:text-sm">
              Users should independently verify an opportunity before sharing
              sensitive information or accepting it.
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldAlert
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              6. USER RESPONSIBILITIES
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              You must use InternKhojo lawfully and responsibly. You must not:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>
                commit fraud, scams, phishing, or other unlawful activities;
              </li>
              <li>
                impersonate another person, Candidate, Company, or organisation;
              </li>
              <li>provide false qualifications, experience, or credentials;</li>
              <li>post fake or misleading jobs or internships;</li>
              <li>
                harass, threaten, abuse, or discriminate against another User;
              </li>
              <li>misuse another User&apos;s personal information;</li>
              <li>send spam or unsolicited communications;</li>
              <li>upload malware or harmful code;</li>
              <li>attempt unauthorised access to accounts or systems;</li>
              <li>
                scrape or systematically collect platform data without
                permission;
              </li>
              <li>bypass security or access restrictions;</li>
              <li>
                manipulate applications, reviews, rankings, or platform
                features;
              </li>
              <li>
                use the Services to advertise unrelated products or services
                without permission; or
              </li>
              <li>otherwise violate these Terms or applicable law.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <FileText
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              7. USER CONTENT
            </h2>
            <p className="mb-3">
              You may submit profiles, resumes, job listings, company
              information, applications, messages, reviews, images, and other
              content (&quot;User Content&quot;).
            </p>
            <p className="mb-2 font-bold text-slate-900">
              You remain responsible for your User Content and confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>you have the right to submit it;</li>
              <li>it is not intentionally false or misleading;</li>
              <li>it does not violate another person&apos;s rights;</li>
              <li>it complies with applicable law; and</li>
              <li>
                you have the necessary permissions for information relating to
                other individuals.
              </li>
            </ul>
            <p className="mb-3">You retain ownership of your User Content.</p>
            <p className="mb-3">
              By submitting User Content, you grant InternKhojo a non-exclusive,
              worldwide, royalty-free licence to store, process, display,
              reproduce, and distribute that content as reasonably necessary to
              provide, operate, maintain, secure, and improve the Services.
            </p>
            <p>
              This licence does not transfer ownership of your User Content to
              InternKhojo.
            </p>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Scale
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              8. INTELLECTUAL PROPERTY
            </h2>
            <p className="mb-3">
              InternKhojo and its licensors own the InternKhojo name, logo,
              branding, website design, software, databases, graphics, text, and
              other proprietary elements of the Services.
            </p>
            <p className="mb-3">
              You may use these materials only as permitted by these Terms.
            </p>
            <p>
              You may not copy, reproduce, modify, distribute, sell, reverse
              engineer, or commercially exploit InternKhojo&apos;s proprietary
              materials without our prior written permission, except where
              permitted by applicable law.
            </p>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <CreditCard
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              9. PAYMENTS
            </h2>
            <p className="mb-3">
              InternKhojo currently does not require payment for ordinary use of
              the platform.
            </p>
            <p className="mb-3">
              We may introduce paid services in the future, including premium
              features, subscriptions, recruitment services, promoted listings,
              or other paid offerings.
            </p>
            <p>
              Where paid services are introduced, applicable prices, payment
              terms, cancellation terms, and refund policies will be disclosed
              before payment.
            </p>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Lock
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              10. PRIVACY AND PLATFORM POLICIES
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              Your use of InternKhojo is also governed by our:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-red-700 font-bold underline hover:text-red-800"
                >
                  Privacy &amp; Platform Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/trust"
                  className="text-red-700 font-bold underline hover:text-red-800"
                >
                  Trust &amp; Safety Policy
                </Link>
              </li>
            </ul>
            <p className="mb-3">These policies form part of these Terms.</p>
            <p className="mb-3">
              Our Privacy &amp; Platform Policy explains how we collect, use,
              share, retain, and protect information.
            </p>
            <p>
              Our Trust &amp; Safety Policy explains prohibited activity,
              reporting procedures, and measures we may take to protect Users
              and the platform.
            </p>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <HelpCircle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              11. THIRD-PARTY SERVICES
            </h2>
            <p className="mb-3">
              InternKhojo may contain links or integrations to third-party
              websites or services.
            </p>
            <p className="mb-3">
              We do not control and are not responsible for third-party
              services, including their content, availability, security, privacy
              practices, or conduct.
            </p>
            <p>
              Your use of third-party services is subject to their own terms and
              policies.
            </p>
          </section>

          {/* Section 12 */}
          <section id="section-12" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <AlertTriangle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              12. SUSPENSION AND TERMINATION
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              We may suspend, restrict, or terminate your account or access to
              the Services if we reasonably believe that you:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3 font-medium text-sm">
              <li>violate these Terms;</li>
              <li>violate applicable law;</li>
              <li>provide false or fraudulent information;</li>
              <li>misuse the platform;</li>
              <li>create a security or safety risk; or</li>
              <li>harm InternKhojo or other Users.</li>
            </ul>
            <p className="mb-3">You may stop using the Services at any time.</p>
            <p>
              Provisions that by their nature should continue after termination
              will remain effective.
            </p>
          </section>

          {/* Section 13 */}
          <section id="section-13" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <HelpCircle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              13. AVAILABILITY AND DISCLAIMER
            </h2>
            <p className="mb-3">
              InternKhojo is provided on an &quot;AS IS&quot; and &quot;AS
              AVAILABLE&quot; basis to the maximum extent permitted by law.
            </p>
            <p className="mb-3">
              We do not guarantee that the Services will always be available,
              uninterrupted, secure, accurate, or error-free.
            </p>
            <p className="mb-3">
              We are not responsible for the actions, content, conduct, or
              commitments of Candidates, Companies, recruiters, or other third
              parties.
            </p>
            <p>
              Nothing in these Terms excludes any liability or right that cannot
              legally be excluded under applicable law.
            </p>
          </section>

          {/* Section 14 */}
          <section id="section-14" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldAlert
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              14. LIMITATION OF LIABILITY
            </h2>
            <p className="mb-3">
              To the maximum extent permitted by applicable law, InternKhojo and
              Corvian Ventures LLP will not be liable for indirect, incidental,
              consequential, special, or punitive losses arising from your use
              of the Services.
            </p>
            <p className="mb-2 font-bold text-slate-900">
              We are not responsible for losses arising from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mb-4 font-medium text-sm">
              <li>interactions between Users;</li>
              <li>fake or misleading information provided by Users;</li>
              <li>internship or employment outcomes;</li>
              <li>disputes between Users;</li>
              <li>third-party services; or</li>
              <li>unauthorised acts of Users.</li>
            </ul>
            <div className="p-4 bg-slate-100 rounded border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-900 space-y-2">
              <p>
                WHERE LEGALLY PERMITTED, OUR TOTAL LIABILITY ARISING FROM YOUR
                USE OF THE SERVICES WILL NOT EXCEED THE AMOUNT YOU PAID TO
                INTERNKHOJO FOR THE RELEVANT SERVICES DURING THE PRECEDING 12
                MONTHS, OR INR 1,000, WHICHEVER IS GREATER.
              </p>
              <p>
                THIS LIMITATION DOES NOT APPLY WHERE LIABILITY CANNOT LEGALLY BE
                LIMITED.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section id="section-15" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Scale
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              15. INDEMNIFICATION
            </h2>
            <p className="mb-2 font-bold text-slate-900">
              To the extent permitted by law, you agree to indemnify and hold
              harmless InternKhojo and Corvian Ventures LLP from claims, losses,
              damages, liabilities, and reasonable expenses arising from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-sm">
              <li>your violation of these Terms;</li>
              <li>your violation of applicable law;</li>
              <li>your User Content;</li>
              <li>your infringement of another person&apos;s rights; or</li>
              <li>your misuse of the Services.</li>
            </ul>
          </section>

          {/* Section 16 */}
          <section id="section-16" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <HelpCircle
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              16. CHANGES TO THE SERVICES AND TERMS
            </h2>
            <p className="mb-3">
              We may modify, suspend, or discontinue any part of the Services.
            </p>
            <p className="mb-3">
              We may also update these Terms when necessary. Material changes
              may be communicated through the Services, email, or other
              reasonable means where required by law.
            </p>
            <p>
              Your continued use of InternKhojo after updated Terms become
              effective constitutes acceptance of the revised Terms, to the
              extent permitted by law.
            </p>
          </section>

          {/* Section 17 */}
          <section id="section-17" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Gavel
                className="w-5 h-5 text-red-700 shrink-0"
                aria-hidden="true"
              />{" "}
              17. GOVERNING LAW AND DISPUTES
            </h2>
            <p className="mb-3">
              These Terms are governed by the laws of India.
            </p>
            <p className="mb-3">
              If a dispute arises, the parties should first attempt to resolve
              it through good-faith discussions.
            </p>
            <p className="mb-3">
              If the dispute cannot be resolved informally, it may be referred
              to arbitration in accordance with the Arbitration and Conciliation
              Act, 1996, as applicable.
            </p>
            <p className="mb-3">
              The seat of arbitration shall be New Delhi, India, and the
              proceedings shall be conducted in English.
            </p>
            <p>
              Subject to applicable law, courts having jurisdiction in New
              Delhi, India shall have jurisdiction over matters arising from
              these Terms.
            </p>
          </section>

          {/* Section 18 */}
          <section id="section-18" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-200 pb-2">
              18. GENERAL
            </h2>
            <p className="mb-3">
              If any provision of these Terms is found invalid or unenforceable,
              the remaining provisions will continue to apply.
            </p>
            <p className="mb-3">
              Failure by InternKhojo to enforce any provision does not
              constitute a waiver of that provision.
            </p>
            <p>
              These Terms, together with the Privacy &amp; Platform Policy,
              Trust &amp; Safety Policy, and any additional terms applicable to
              specific Services, constitute the agreement between you and
              InternKhojo regarding your use of the Services.
            </p>
          </section>

          {/* Section 19 / Contact Section */}
          <section
            id="section-19"
            role="contentinfo"
            className="pt-6 border-t border-slate-200 scroll-mt-8"
          >
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
              19. CONTACT US
            </h2>
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

          {/* Acceptance Footer */}
          <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-xl scroll-mt-8">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-2 text-red-500">
              Acceptance
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              By creating an account, accessing, browsing, or using the
              Services, you acknowledge that you have read and understood these
              Terms and agree to be bound by them.
            </p>
            <p className="mt-4 text-xs font-mono text-slate-300 border-t border-slate-800 pt-3">
              © 2026 Corvian Ventures LLP. All rights reserved.
            </p>
          </section>
        </TermsClient>
      </div>
    </main>
  );
}
