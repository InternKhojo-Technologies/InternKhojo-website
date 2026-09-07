import type { MetadataRoute } from "next";
import { fetchBulletinSitemapIds } from "@/lib/external-jobs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://internkhojo.com";

// Static routes + recent bulletin postings (lean _id-only query, capped).
// Build-safe: without Mongo env, only static routes are emitted.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/board`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/board?type=internship`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${SITE_URL}/board?type=job`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${SITE_URL}/find/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/find`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
  try {
    const ids = await fetchBulletinSitemapIds(2000);
    const postingRoutes: MetadataRoute.Sitemap = ids.map((id) => ({
      url: `${SITE_URL}/board/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    return [...staticRoutes, ...postingRoutes];
  } catch {
    return staticRoutes;
  }
}
