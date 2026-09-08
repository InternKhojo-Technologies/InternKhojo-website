import type { MetadataRoute } from "next";
import { fetchBulletinSitemapIds } from "@/lib/external-jobs";
import {
  fetchCompanySitemapIds,
  fetchVerifiedJobSitemapIds,
} from "@/lib/server-jobs";
import { SITE_URL } from "@/lib/site";

// Static routes + bulletin postings + verified jobs + public companies.
// Build-safe: without DB env vars, only static routes are emitted.
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
    { url: `${SITE_URL}/companies`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/careers`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/hire`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/mentor`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/trust`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
  try {
    const [bulletinIds, verifiedIds, companyIds] = await Promise.all([
      fetchBulletinSitemapIds(2000),
      // Open verified opportunities only — never closed/historical.
      fetchVerifiedJobSitemapIds(1000),
      fetchCompanySitemapIds(500),
    ]);
    const postingRoutes: MetadataRoute.Sitemap = bulletinIds.map((id) => ({
      url: `${SITE_URL}/board/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    const verifiedRoutes: MetadataRoute.Sitemap = verifiedIds.map((id) => ({
      url: `${SITE_URL}/find/jobs/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    const companyRoutes: MetadataRoute.Sitemap = companyIds.map((id) => ({
      url: `${SITE_URL}/companies/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
    return [...staticRoutes, ...postingRoutes, ...verifiedRoutes, ...companyRoutes];
  } catch {
    return staticRoutes;
  }
}
