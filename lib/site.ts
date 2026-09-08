// Central SEO constants — single source of truth for the canonical domain.
// Canonical domain (non-www) — all SEO URLs must use this.
export const SITE_URL = "https://internkhojo.com";

export const SITE_NAME = "InternKhojo";

export const SITE_TAGLINE =
  "Find internships, jobs and startups hiring across India";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
