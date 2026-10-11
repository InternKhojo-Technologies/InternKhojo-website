import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import BoardClient from "./BoardClient";
import { stripHtml } from "@/lib/board";
import {
  BULLETIN_PAGE_SIZE,
  fetchBulletinCounts,
  fetchBulletinFields,
  fetchBulletinLocations,
  fetchBulletinPosts,
  type BulletinQuery,
} from "@/lib/external-jobs";

export const revalidate = 300;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://internkhojo.com";

const DISCLAIMER =
  "These postings are not listed on the InternKhojo platform. They are open opportunities collected from across the internet, and InternKhojo does not guarantee their genuineness. For InternKhojo-verified opportunities, visit the Find page.";

type SearchParams = {
  q?: string;
  type?: string;
  pay?: string;
  loc?: string;
  skill?: string;
  f?: string;
  page?: string;
};

function parseQuery(sp: SearchParams): BulletinQuery {
  const type = (sp.type ?? "").toLowerCase();
  const pay = (sp.pay ?? "").toLowerCase();
  const page = Math.max(parseInt(sp.page ?? "1", 10) || 1, 1);
  return {
    q: sp.q?.trim() || undefined,
    type: type === "job" || type === "internship" ? type : "all",
    pay: pay === "paid" || pay === "unpaid" ? pay : "all",
    loc: sp.loc?.trim() || undefined,
    skill: sp.skill?.trim() || undefined,
    field: sp.f?.trim() || undefined,
    page,
    pageSize: BULLETIN_PAGE_SIZE,
  };
}

function canonicalFor(query: BulletinQuery): string {
  const params = new URLSearchParams();
  if (query.type !== "all") params.set("type", query.type!);
  if (query.pay !== "all") params.set("pay", query.pay!);
  if (query.q) params.set("q", query.q);
  if (query.loc) params.set("loc", query.loc);
  if (query.skill) params.set("skill", query.skill);
  if (query.field) params.set("f", query.field);
  const pageNum = query.page ?? 1;
  if (pageNum > 1) params.set("page", String(pageNum));
  const qs = params.toString();
  return qs ? `${SITE_URL}/board?${qs}` : `${SITE_URL}/board`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const query = parseQuery(await searchParams);
  const pageNum = query.page ?? 1;
  const pageSuffix = pageNum > 1 ? ` — Page ${pageNum}` : "";
  const typePrefix =
    query.type === "internship"
      ? "Internships"
      : query.type === "job"
        ? "Jobs"
        : "Jobs & Internships";
  const title = `Open ${typePrefix} Bulletin${pageSuffix} — 1500+ Live Postings`;
  const description = `Browse 1500+ open ${typePrefix.toLowerCase()} collected from across the internet — filter by type, pay, location and skill. Every post shows pay, location, tenure, deadline and direct apply links.${pageSuffix}`;
  const url = canonicalFor(query);
  // Only the main bulletin and the two curated type lanes are indexable.
  // Free-text search (q/loc/skill/field), pay filters and deep pages stay
  // crawlable for users but carry noindex so they never compete in search.
  // The bare /board URL and ?type=job / ?type=internship remain indexed.
  const indexable =
    !query.q &&
    !query.loc &&
    !query.skill &&
    !query.field &&
    (query.pay ?? "all") === "all" &&
    (query.page ?? 1) <= 1;
  return {
    title,
    description,
    keywords: [
      "jobs bulletin",
      "internships board",
      "job openings in India",
      "internship openings",
      "latest internships",
      "remote jobs",
      "fresher jobs",
      "work from home internships",
      "off campus jobs",
    ],
    alternates: { canonical: url },
    robots: { index: indexable, follow: true },
    openGraph: {
      type: "website",
      url,
      title: `Open ${typePrefix} Bulletin — Live Postings`,
      description,
      siteName: "Opportunities Bulletin",
    },
    twitter: {
      card: "summary_large_image",
      title: `Open ${typePrefix} Bulletin — Live Postings`,
      description,
    },
  };
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = parseQuery(await searchParams);
  const [pageData, counts, locations, fields] = await Promise.all([
    fetchBulletinPosts(query),
    fetchBulletinCounts(),
    fetchBulletinLocations(),
    fetchBulletinFields(),
  ]);
  const { items, total, page, configured } = pageData;
  const offset = (page - 1) * BULLETIN_PAGE_SIZE;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open job and internship postings",
    numberOfItems: total,
    itemListElement: items.map((post, i) => ({
      "@type": "ListItem",
      position: offset + i + 1,
      url: `${SITE_URL}/board/${post.id}`,
      name: post.title,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where do these bulletin postings come from? Are they genuine?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${DISCLAIMER} Always verify details on the official application page before sharing personal information.`,
        },
      },
      {
        "@type": "Question",
        name: "How are jobs and internships segregated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The bulletin keeps two separate tabs. The Jobs tab shows full-time roles; the Internships tab shows training roles with tenure. Each card labels pay, location, tenure or work mode, deadline, skills and source separately.",
        },
      },
      {
        "@type": "Question",
        name: "What details does each bulletin post show?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every post shows title, hiring organization, compensation, location, tenure or work mode, application deadline, skills, source, posting date and the role brief.",
        },
      },
      {
        "@type": "Question",
        name: "How do I apply from the bulletin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open a card to read the full post, then apply through the official application page, the listed email address or phone number shown on the card.",
        },
      },
    ],
  };

  const clientKey = JSON.stringify({
    q: query.q ?? "",
    t: query.type,
    p: query.pay,
    l: query.loc ?? "",
    s: query.skill ?? "",
    f: query.field ?? "",
    pg: page,
  });

  return (
    <div className="relative isolate min-h-screen overflow-clip bg-white pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Glow backdrop — static gradients, transform/opacity only */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10">
        <div className="relative mx-auto h-[520px] w-full max-w-6xl overflow-visible">
          <div className="absolute -top-32 left-1/2 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.14),rgba(167,139,250,0.10),transparent)] blur-2xl" />
          <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.14),transparent)] blur-2xl" />
          <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.10),transparent)] blur-2xl" />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
      </div>

      {/* SEO + GEO header: crawlable summary, human-readable */}
      <header className="relative mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/70 py-1.5 pl-4 pr-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 shadow-sm backdrop-blur-md"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className="rounded-sm transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                Home
              </Link>
            </li>
            <li aria-hidden className="text-slate-300">
              /
            </li>
            <li aria-current="page" className="text-slate-900">
              Bulletin
            </li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 py-1.5 pl-3 pr-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live bulletin&ensp;·&ensp;{counts.total.toLocaleString("en-IN")}{" "}
            open {counts.total === 1 ? "post" : "posts"}
          </p>

          {/* Source disclaimer — hover or keyboard-focus the "i" */}
          <span className="group/info relative inline-flex">
            <span
              tabIndex={0}
              role="img"
              aria-label="About these postings"
              aria-describedby="bulletin-source-note"
              className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-slate-900 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <Info size={11} />
            </span>
            <span
              id="bulletin-source-note"
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-left normal-case tracking-normal opacity-0 shadow-2xl transition-opacity duration-200 group-hover/info:pointer-events-auto group-hover/info:opacity-100 group-focus-within/info:pointer-events-auto group-focus-within/info:opacity-100 motion-reduce:transition-none"
            >
              <span className="block text-xs font-bold leading-relaxed text-white">
                {DISCLAIMER}
              </span>
              <Link
                href="/find"
                className="mt-2 inline-block rounded-sm text-[11px] font-bold text-emerald-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              >
                Go to verified opportunities →
              </Link>
            </span>
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-extrabold leading-[0.98] tracking-[-0.035em] text-slate-950 sm:text-6xl">
          Open jobs &{" "}
          <span className="bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 bg-clip-text text-transparent">
            internships
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-slate-600">
          A live feed of{" "}
          <strong className="font-semibold text-slate-900">
            {counts.total.toLocaleString("en-IN")}+ open roles
          </strong>{" "}
          collected from across the internet. Filter by{" "}
          <strong className="font-semibold text-slate-900">
            type, field, pay, location and skill
          </strong>
          . <strong className="font-semibold text-slate-900">Jobs</strong> (
          {counts.jobs.toLocaleString("en-IN")}) and{" "}
          <strong className="font-semibold text-slate-900">internships</strong>{" "}
          ({counts.internships.toLocaleString("en-IN")}) are segregated —
          internships always show tenure. Listings here are not
          platform-verified; for verified roles see the{" "}
          <Link href="/find" className="font-semibold text-slate-900 underline underline-offset-2 hover:no-underline">
            Find page
          </Link>
          .
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-slate-950">
            <span className="font-mono font-bold tabular-nums">{counts.total.toLocaleString("en-IN")}</span>
            All
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span className="font-mono font-bold tabular-nums">{counts.jobs.toLocaleString("en-IN")}</span>
            Jobs
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="font-mono font-bold tabular-nums">
              {counts.internships.toLocaleString("en-IN")}
            </span>
            Internships
          </span>
        </div>
      </header>

      <div className="relative mt-6">
        <BoardClient
          key={clientKey}
          items={items}
          total={total}
          page={page}
          pageCount={pageData.pageCount}
          pageSize={BULLETIN_PAGE_SIZE}
          initialQuery={{
            q: query.q ?? "",
            type: query.type ?? "all",
            pay: query.pay ?? "all",
            loc: query.loc ?? "",
            skill: query.skill ?? "",
            field: query.field ?? "",
          }}
          counts={counts}
          locations={locations}
          fields={fields}
          configured={configured}
        />
      </div>

      {/* Crawlable snapshot + GEO facts (visible, lightweight) */}
      <section
        aria-label="Latest posts snapshot"
        className="mx-auto mt-12 w-full max-w-6xl px-4 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <h2 className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Latest posts snapshot
          </h2>
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
          />
        </div>
        {items.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-sm text-slate-500">
            {configured
              ? "No posts match right now. Try clearing a filter — new postings land here continuously."
              : "The bulletin is syncing fresh postings. Check back shortly — or browse verified roles on the Find page."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {items.slice(0, 10).map((post) => (
              <li
                key={post.id}
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)] motion-reduce:transition-none motion-reduce:transform-none"
              >
                <a
                  href={`/board/${post.id}`}
                  className="rounded-sm text-xs font-extrabold uppercase tracking-tight text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  {post.title}
                </a>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {(post.company ?? "Open opportunity") +
                    " • " +
                    (post.location || "Remote") +
                    " • " +
                    (stripHtml(post.description, 110) || "Open role")}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex items-center gap-3">
          <h2 className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            How to read this bulletin
          </h2>
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"
          />
        </div>
        <div className="mt-4 grid gap-2 text-xs leading-relaxed text-slate-600 sm:grid-cols-3">
          <p className="group rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.2)] motion-reduce:transition-none motion-reduce:transform-none">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              01
            </span>
            <strong className="mt-1.5 block text-[13px] font-extrabold tracking-tight text-slate-900">
              Pick a tab.
            </strong>
            <span className="mt-1 block">
              All, Jobs, or Internships. Counts update live so you always know
              how many posts are in each lane.
            </span>
          </p>
          <p className="group rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.2)] motion-reduce:transition-none motion-reduce:transform-none">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              02
            </span>
            <strong className="mt-1.5 block text-[13px] font-extrabold tracking-tight text-slate-900">
              Filter simply.
            </strong>
            <span className="mt-1 block">
              Search keywords, then narrow by field, pay, location or a
              single skill.
              The link stays shareable, with paged results for 1500+ posts.
            </span>
          </p>
          <p className="group rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.2)] motion-reduce:transition-none motion-reduce:transform-none">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              03
            </span>
            <strong className="mt-1.5 block text-[13px] font-extrabold tracking-tight text-slate-900">
              Open and apply.
            </strong>
            <span className="mt-1 block">
              Each card shows pay, tenure, deadline and direct apply channels.
              Open the full post, then apply on the official page, by email or
              by phone.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
