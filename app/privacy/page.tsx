import React from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | InternKhojo",
  description:
    "Learn how InternKhojo handles your data, Google OAuth permissions, and personal information security.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "7 May 2025";

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-red-100 selection:text-red-900">
      <article className="max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <header className="mb-16 border-b border-slate-100 pb-12 text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 italic">
            Privacy <span className="text-red-600">Policy.</span>
          </h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-12 leading-relaxed text-lg text-slate-700">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <Shield className="text-red-600" size={24} /> 1. Introduction
            </h2>
            <p>
              At <strong>InternKhojo</strong>, accessible from internkhojo.com,
              one of our main priorities is the privacy of our visitors. This
              Privacy Policy document contains types of information that is
              collected and recorded by InternKhojo and how we use it.
            </p>
          </section>

          {/* Critical Section for Google OAuth */}
          <section className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <Lock className="text-red-600" size={24} /> 2. Google User Data
            </h2>
            <p className="mb-4">
              When you authenticate using Google OAuth, InternKhojo accesses
              certain information from your Google Account to provide a seamless
              experience.
            </p>
            <ul className="list-disc ml-6 space-y-3 font-medium">
              <li>
                <span className="text-black">Account Identification:</span> We
                collect your primary Google email address to create and
                authenticate your account.
              </li>
              <li>
                <span className="text-black">Profile Personalization:</span> We
                access your name and profile picture to personalize your
                dashboard.
              </li>
              <li>
                <span className="text-black">Data Security:</span> We do not
                share, sell, or rent your Google user data to third-party
                advertisers or data brokers.
              </li>
            </ul>
            <p className="mt-6 text-sm italic border-t border-slate-200 pt-4">
              InternKhojo's use and transfer of information received from Google
              APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-red-600 underline"
              >
                Google API Service User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <Eye className="text-red-600" size={24} /> 3. Information We
              Collect
            </h2>
            <p>
              We follow a standard procedure of using log files. These files log
              visitors when they visit websites. The information collected
              includes internet protocol (IP) addresses, browser type, Internet
              Service Provider (ISP), date and time stamp, and referring/exit
              pages.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <FileText className="text-red-600" size={24} /> 4. Data Retention
              & Deletion
            </h2>
            <p>
              We retain your data only as long as your account is active. Users
              may request data deletion at any time by contacting our support
              team. Upon request, all personal identifiers and Google-linked
              data will be purged from our databases within 30 days.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-12 border-t border-slate-100">
            <h2 className="text-xl font-bold text-black mb-4">
              Contact Information
            </h2>
            <p>
              If you have any questions about our Privacy Policy, please reach
              out to us at:
            </p>
            <p className="text-red-600 font-black mt-2 text-xl tracking-tight">
              legal@internkhojo.com
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
