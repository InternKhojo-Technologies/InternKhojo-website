import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getVerifiedJobById,
  isIndexableJob,
  verifiedJobMeta,
} from "@/lib/server-jobs";
import { toJobPostingJsonLd } from "@/lib/board";
import { SITE_URL } from "@/lib/site";
import JobDetailClient from "./JobDetailClient";

const FALLBACK_TITLE = "Job Opportunity — InternKhojo";
const FALLBACK_DESCRIPTION =
  "Explore this job opportunity, requirements, compensation, and application details on InternKhojo.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const outcome = await getVerifiedJobById(id);
  if (outcome.status === "not-found") {
    return {
      title: "Opportunity not found — InternKhojo",
      robots: { index: false, follow: false },
    };
  }
  if (outcome.status === "unavailable") {
    // Server could not reach the DB — the client retries in-browser.
    // Generic metadata + noindex so error fallbacks are never indexed.
    return {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESCRIPTION,
      alternates: { canonical: `${SITE_URL}/find/jobs/${id}` },
      robots: { index: false, follow: true },
    };
  }
  const job = outcome.job;
  const meta = verifiedJobMeta(job);
  const indexable = isIndexableJob(job);
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.url },
    robots: { index: indexable, follow: true },
    openGraph: {
      type: "article",
      url: meta.url,
      title: meta.title,
      description: meta.description,
      siteName: "InternKhojo",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outcome = await getVerifiedJobById(id);
  if (outcome.status === "not-found") notFound();

  if (outcome.status === "unavailable") {
    // Infra failure, not a missing job: let the client component fetch
    // in the browser (it already refetches on mount) instead of 404ing.
    return <JobDetailClient initialJob={null} jobId={id} />;
  }

  const job = outcome.job;
  const meta = verifiedJobMeta(job);
  const jobJsonLd = toJobPostingJsonLd(job, meta.url);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jobs",
        item: `${SITE_URL}/find/jobs`,
      },
      { "@type": "ListItem", position: 3, name: job.title, item: meta.url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <JobDetailClient initialJob={job} jobId={job.id} />
    </>
  );
}
