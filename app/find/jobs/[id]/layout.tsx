import type { Metadata } from "next";
import {
  getVerifiedJobById,
  isIndexableJob,
  verifiedJobMeta,
} from "@/lib/server-jobs";
import { SITE_URL } from "@/lib/site";

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
    return {
      title: "Job Opportunity — InternKhojo",
      description:
        "Explore this job opportunity, requirements, compensation, and application details on InternKhojo.",
      alternates: {
        canonical: `${SITE_URL}/find/jobs/${id}`,
      },
      robots: { index: false, follow: true },
    };
  }
  // Same source as page.tsx (request-cached fetch) so layout + page agree.
  const job = outcome.job;
  const meta = verifiedJobMeta(job);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.url,
    },
    robots: {
      index: isIndexableJob(job),
      follow: true,
    },
  };
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
