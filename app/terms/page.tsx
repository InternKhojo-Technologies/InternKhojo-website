import React from "react";
import { Scale, UserCheck, AlertTriangle, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | InternKhojo",
  description:
    "The legal agreement governing your use of the InternKhojo platform and services.",
};

export default function TermsOfService() {
  const lastUpdated = "7 May 2025";

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-red-100 selection:text-red-900">
      <article className="max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <header className="mb-16 border-b border-slate-100 pb-12 text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 italic">
            Terms of <span className="text-red-600">Service.</span>
          </h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-12 leading-relaxed text-lg text-slate-700">
          <section>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <Scale className="text-red-600" size={24} /> 1. Acceptance of
              Terms
            </h2>
            <p>
              By accessing the website at internkhojo.com, you are agreeing to
              be bound by these terms of service, all applicable laws and
              regulations, and agree that you are responsible for compliance
              with any applicable local laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <UserCheck className="text-red-600" size={24} /> 2. User Accounts
              & Security
            </h2>
            <p>
              To access certain features of <strong>InternKhojo</strong>, you
              may be required to register for an account via Google OAuth. You
              are responsible for maintaining the confidentiality of your
              account and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} /> 3. Disclaimer
            </h2>
            <p>
              The materials on InternKhojo's website are provided on an 'as is'
              basis. InternKhojo makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <HelpCircle className="text-red-600" size={24} /> 4. Limitations
            </h2>
            <p>
              In no event shall InternKhojo or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on InternKhojo's website.
            </p>
          </section>

          <section className="pt-12 border-t border-slate-100">
            <h2 className="text-xl font-bold text-black mb-4">Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in
              accordance with the laws of India and you irrevocably submit to
              the exclusive jurisdiction of the courts in that State or
              location.
            </p>
            <p className="mt-8">
              For any legal inquiries: <br />
              <span className="text-red-600 font-black text-xl">
                legal@internkhojo.com
              </span>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
