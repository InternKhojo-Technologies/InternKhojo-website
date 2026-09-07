import type { BoardOpportunity } from "./board";

// Client-safe: types + adapter only. No MongoDB imports here — this module is
// imported by the browser bundle (BoardClient). All DB access lives in
// lib/external-jobs.ts (server-only).

export interface ExternalPost {
  id: string;
  title: string;
  company: string | null;
  logoUrl: string | null;
  /** "job" | "internship" — explicit field first, title-keyword fallback. */
  kind: "job" | "internship";
  pay: string | null;
  paid: boolean;
  location: string | null;
  duration: string | null;
  experience: string | null;
  deadline: string | null;
  postedAt: string | null;
  skills: string[];
  description: string | null;
  /** Direct external application page (structured field preferred). */
  applyUrl: string | null;
  emails: string[];
  phones: { display: string; tel: string }[];
  /** Listing source (e.g. portal name) — shown as "via {source}". */
  source: string | null;
  /** Work mode as listed (Remote / Hybrid / On-site…). */
  mode: string | null;
  /** Domain/field code as listed. */
  field: string | null;
}

/** BoardOpportunity view of an external post (reuses shared SEO/helpers). */
export function adaptExternalPost(p: ExternalPost): BoardOpportunity {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    stipend: p.pay,
    paid: p.paid,
    location: p.location,
    job_type: p.kind,
    duration: p.duration,
    experience_level: p.experience,
    deadline: p.deadline,
    skills: p.skills,
    created_at: p.postedAt,
    companies: {
      name: p.company ?? "Open opportunity",
      logo_url: p.logoUrl,
      verified: false,
    },
  };
}
