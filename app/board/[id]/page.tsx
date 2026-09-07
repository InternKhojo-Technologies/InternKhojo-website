import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  applyHostLabel,
  buildPostFaq,
  getPostContact,
  payLabel,
  stripHtml,
  timeAgo,
  toJobPostingJsonLd,
} from "@/lib/board";
import {
  fetchExternalPostById,
  fetchRelatedExternalPosts,
} from "@/lib/external-jobs";
import { adaptExternalPost } from "@/lib/external-post";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://internkhojo.com";

async function getPost(id: string) {
  const post = await fetchExternalPostById(id);
  return post ? adaptExternalPost(post) : null;
}

async function getRelated(currentId: string, kind: "job" | "internship") {
  const posts = await fetchRelatedExternalPosts(currentId, kind);
  return posts.map(adaptExternalPost);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getPost(id);
  if (!job) {
    return {
      title: "Post not found — Opportunities Bulletin",
      robots: { index: false, follow: false },
    };
  }
  const type = String(job.job_type ?? "")
    .toLowerCase()
    .includes("intern")
    ? "internship"
    : "job";
  const summary =
    stripHtml(job.description, 155) || `${job.title} — open ${type} post.`;
  return {
    title: `${job.title} (${type === "internship" ? "Internship" : "Job"}) — Bulletin`,
    description: `${summary} Location: ${job.location || "Remote"}. Pay: ${payLabel(job)}.`,
    alternates: { canonical: `${SITE_URL}/board/${job.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/board/${job.id}`,
      title: `${job.title} — ${type === "internship" ? "Internship" : "Job"} post`,
      description: summary,
      siteName: "InternKhojo — Opportunities Bulletin",
    },
    twitter: {
      card: "summary",
      title: `${job.title} — Bulletin post`,
      description: summary,
    },
  };
}

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = await fetchExternalPostById(id);
  if (!raw) notFound();
  const job = adaptExternalPost(raw);
  const post = raw;

  const type = post.kind;
  const isIntern = type === "internship";
  const paid = post.paid;
  const related = await getRelated(post.id, post.kind);
  const url = `${SITE_URL}/board/${job.id}`;
  const mined = getPostContact(job);
  const contact = post.applyUrl
    ? { ...mined, officialApplyUrl: post.applyUrl }
    : mined;
  const faqs = [
    {
      question: "Where is this posting from? Is it genuine?",
      answer: `This is an open-web listing${post.source ? ` collected via ${post.source}` : ""} — not a platform-verified role, and genuineness is not guaranteed. Verify every detail on the official application page before sharing personal information or paying any fee.`,
    },
    ...buildPostFaq(job, contact, { platformApply: false }),
  ];

  const jobJsonLd = {
    ...toJobPostingJsonLd(job, url),
    identifier: {
      "@type": "PropertyValue",
      name: "bulletin-id",
      value: job.id,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: job.companies?.name ?? "Hiring organization",
      logo: job.companies?.logo_url ?? undefined,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Bulletin",
        item: `${SITE_URL}/board`,
      },
      { "@type": "ListItem", position: 3, name: job.title, item: url },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const orgName = job.companies?.name ?? "Open opportunity";
  const initial = (orgName || job.title || "?").charAt(0).toUpperCase();
  const daysLeft = daysUntil(job.deadline);
  const urgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  const specs: Array<{
    label: string;
    value: string;
    icon: typeof Banknote;
  }> = [
    {
      label: "Post type",
      value: isIntern ? "Internship" : "Job",
      icon: isIntern ? GraduationCap : Briefcase,
    },
    { label: "Work mode", value: post.mode ?? "—", icon: Building2 },
    {
      label: isIntern ? "Tenure" : "Employment",
      value: isIntern ? String(job.duration ?? "—") : "Full-time role",
      icon: Clock,
    },
    { label: "Source", value: post.source ?? "Open web", icon: ExternalLink },
    { label: "Compensation", value: payLabel(job), icon: Banknote },
    {
      label: "Location",
      value: String(job.location ?? "Remote"),
      icon: MapPin,
    },
    {
      label: "Deadline",
      value: job.deadline
        ? new Date(job.deadline).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Rolling applications",
      icon: CalendarClock,
    },
    {
      label: "Posted",
      value: job.created_at
        ? new Date(job.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Recently",
      icon: Clock,
    },
  ];

  return (
    <main className="relative isolate min-h-screen overflow-clip bg-[#fcfcfc] pb-24 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Glow backdrop — static, no per-frame JS */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10"
      >
        <div className="relative mx-auto h-[420px] w-full max-w-4xl">
          <div
            className={`absolute -top-28 left-1/2 h-[320px] w-[620px] -translate-x-1/2 rounded-full blur-2xl ${
              isIntern
                ? "bg-[radial-gradient(closest-side,rgba(251,191,36,0.16),rgba(251,146,60,0.08),transparent)]"
                : "bg-[radial-gradient(closest-side,rgba(59,130,246,0.16),rgba(99,102,241,0.08),transparent)]"
            }`}
          />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 py-5">
          <Link
            href="/board"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm backdrop-blur transition-[transform,box-shadow,background-color,color] duration-200 hover:-translate-y-px hover:bg-slate-950 hover:text-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
          >
            <ArrowLeft size={13} /> Bulletin
          </Link>
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
            </span>
            {timeAgo(job.created_at)} • {String(job.id).slice(0, 8)}
          </p>
        </div>

        <article className="relative mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_32px_64px_-32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          {/* Gradient edge — type at a glance */}
          <div
            aria-hidden
            className={`h-1.5 w-full ${
              isIntern
                ? "bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400"
                : "bg-gradient-to-r from-blue-700 via-indigo-500 to-cyan-400"
            }`}
          />
          <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-5 py-4 sm:px-8">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] shadow-sm backdrop-blur ${
                  isIntern
                    ? "border-amber-200/70 bg-amber-400/95 text-slate-950"
                    : "border-slate-950 bg-slate-950 text-white"
                }`}
              >
                {isIntern ? (
                  <GraduationCap size={11} />
                ) : (
                  <Briefcase size={11} />
                )}
                {isIntern ? "Internship" : "Job"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] shadow-sm ${
                  paid
                    ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <Banknote size={11} />
                {paid ? payLabel(job) : "Unpaid"}
              </span>
              {job.deadline && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] shadow-sm ${
                    urgent
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-red-100 bg-red-50/60 text-red-600"
                  }`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    {urgent && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60 motion-reduce:animate-none" />
                    )}
                    <span
                      className={`relative inline-flex h-1.5 w-1.5 rounded-full ${urgent ? "bg-red-500" : "bg-red-400"}`}
                    />
                  </span>
                  <CalendarClock size={11} />
                  Apply by{" "}
                  {new Date(job.deadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex items-start gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 p-1.5 shadow-sm">
                {job.companies?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.companies.logo_url}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[12px] text-xl font-black text-white">
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${
                        isIntern
                          ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500"
                          : "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
                      }`}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10"
                    />
                    <span className="relative">{initial}</span>
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span className="text-slate-900">{orgName}</span>
                  <span aria-hidden className="text-slate-300">
                    •
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} /> {job.location || "Remote"}
                  </span>
                  <span aria-hidden className="text-slate-300">
                    •
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {timeAgo(job.created_at)}
                  </span>
                </p>
                <h1 className="mt-2 text-balance text-[28px] font-extrabold leading-[1.05] tracking-[-0.03em] text-slate-950 sm:text-[40px]">
                  {job.title}
                </h1>
              </div>
            </div>

            {/* Segregated specification grid */}
            <section aria-label="Role specifications" className="mt-7">
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Specifications
                </h2>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {specs.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className="group rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/70 px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.2)] motion-reduce:transition-none motion-reduce:transform-none"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-500 shadow-sm">
                        <Icon size={14} />
                      </span>
                      <dt className="mt-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        {s.label}
                      </dt>
                      <dd className="mt-1 line-clamp-2 text-xs font-extrabold uppercase leading-snug tracking-tight text-slate-900">
                        {s.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>

            {job.skills && job.skills.length > 0 && (
              <section aria-label="Required skills" className="mt-7">
                <div className="flex items-center gap-3">
                  <h2 className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Skills
                  </h2>
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-slate-700 shadow-sm transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-slate-900 hover:shadow-md motion-reduce:transform-none"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section
              aria-label="Role brief"
              className="mt-8 border-t border-slate-100 pt-6"
            >
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Full brief
                </h2>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
                />
              </div>
              <div
                className="mt-3 max-w-none text-pretty text-sm leading-relaxed text-slate-700 [&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-900 [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-bold [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{
                  __html:
                    job.description ||
                    "<p>No detailed brief was provided for this post.</p>",
                }}
              />
            </section>

            {/* How to apply — every channel on one place */}
            <section
              aria-label="How to apply"
              className="mt-8 border-t border-slate-100 pt-6"
            >
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  How to apply
                </h2>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
                />
              </div>
              <div className="mt-3 grid gap-2">
                {contact.officialApplyUrl && (
                  <a
                    href={contact.officialApplyUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-slate-950 p-4 text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.4),transparent)] blur-2xl transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                    />
                    <span className="relative flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                        <ExternalLink size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-extrabold uppercase tracking-tight">
                          Apply at {applyHostLabel(contact.officialApplyUrl)}
                        </span>
                        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
                          Official application page
                        </span>
                      </span>
                    </span>
                    <span className="relative shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transform-none">
                      Open ↗
                    </span>
                  </a>
                )}
                {contact.emails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-slate-900 hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
                      <Mail size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-extrabold tracking-tight text-slate-900">
                        {email}
                      </span>
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Email your application directly
                      </span>
                    </span>
                  </a>
                ))}
                {contact.phones.map((p) => (
                  <a
                    key={p.tel}
                    href={`tel:${p.tel}`}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-slate-900 hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
                      <Phone size={16} />
                    </span>
                    <span>
                      <span className="block text-xs font-extrabold tracking-tight text-slate-900">
                        {p.display}
                      </span>
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Call or WhatsApp to apply
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </section>

            {/* Quick answers — quotable facts for search + AI answers */}
            <section
              aria-label="Quick answers"
              className="mt-8 border-t border-slate-100 pt-6"
            >
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Quick answers
                </h2>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
                />
              </div>
              <div className="mt-3 space-y-2">
                {faqs.map((f) => (
                  <details
                    key={f.question}
                    open
                    className="group rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/60 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-200 open:shadow-sm hover:border-slate-300"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 [&::-webkit-details-marker]:hidden">
                      <span className="text-xs font-extrabold tracking-tight text-slate-900">
                        {f.question}
                      </span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none">
                        <ChevronDown size={13} />
                      </span>
                    </summary>
                    <p className="px-4 pb-4 text-xs leading-relaxed text-slate-600">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {contact.officialApplyUrl ? (
                <a
                  href={contact.officialApplyUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="rounded-2xl bg-slate-950 px-6 py-4 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-black hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
                >
                  Apply at {applyHostLabel(contact.officialApplyUrl)} ↗
                </a>
              ) : null}
              <Link
                href="/board"
                className={`${contact.officialApplyUrl ? "" : "sm:col-span-2 "}rounded-2xl border border-slate-200/80 bg-white px-6 py-4 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-slate-700 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-slate-900 hover:text-slate-950 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none`}
              >
                Back to feed
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section aria-label="Related posts" className="mt-8">
            <div className="flex items-center gap-3">
              <h2 className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                More open posts
              </h2>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
              />
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/board/${r.id}`}
                    className="block rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-slate-900 hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-none motion-reduce:transform-none"
                  >
                    <span className="block truncate text-xs font-extrabold uppercase tracking-tight text-slate-900">
                      {r.title}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      {r.location || "Remote"} • {r.stipend || "See pay"} •{" "}
                      {timeAgo(r.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
