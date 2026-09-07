// Shared helpers for the public opportunities bulletin.
// Intentionally generic: no brand strings in this module.

export type OpportunityType = "job" | "internship";

export interface BoardCompany {
  name?: string | null;
  logo_url?: string | null;
  verified?: boolean | null;
}

export interface BoardOpportunity {
  id: string;
  title: string;
  description?: string | null;
  stipend?: string | null;
  salary?: string | null;
  paid?: boolean | null;
  location?: string | null;
  job_type?: string | null;
  type?: string | null;
  duration?: string | null;
  experience_level?: string | null;
  deadline?: string | null;
  skills?: string[] | null;
  questions?: unknown[] | null;
  attachment_url?: string | null;
  created_at?: string | null;
  status?: string | null;
  companies?: BoardCompany | null;
}

export function getOpportunityType(job: BoardOpportunity): OpportunityType {
  const raw = String(job.job_type ?? job.type ?? "").toLowerCase();
  return raw.includes("intern") ? "internship" : "job";
}

export function isPaidOpportunity(job: BoardOpportunity): boolean {
  if (typeof job.paid === "boolean") return job.paid;
  const s = String(job.stipend ?? job.salary ?? "")
    .trim()
    .toLowerCase();
  if (!s) return false;
  return s !== "0" && s !== "unpaid" && s !== "unpaid exposure";
}

export function stripHtml(html?: string | null, maxChars = 220): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + "…";
}

export function timeAgo(dateString?: string | null): string {
  if (!dateString) return "Recently";
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (Number.isNaN(diff) || diff < 0) return "Recently";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return m <= 1 ? "Just now" : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h}h ago`;
  }
  const d = Math.floor(diff / 86400);
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function payLabel(job: BoardOpportunity): string {
  if (!isPaidOpportunity(job)) return "Unpaid";
  return job.stipend || job.salary || "Paid";
}

// ---------------------------------------------------------------------------
// Contact + official-apply extraction.
// Posts carry emails / phone numbers / apply links inside the role brief
// (there are no dedicated columns), so the face card and detail page derive
// them from the brief text. Everything here is defensive: dedupe, validate,
// and never throw on odd input.
// ---------------------------------------------------------------------------

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/[^\s"'<>()]+/g;
const PHONE_CANDIDATE_RE = /(\+\d[\d\s\-()]{7,}\d|\b\d[\d\s\-()]{8,}\d\b)/g;
const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|bmp|ico)(\?|#|$)/i;
const APPLY_HINT_RE =
  /apply|application|form|career|job|vacancy|opening|hire|register|greenhouse|lever\.co|workable|ashby|zoho|darwinbox|naukri|linkedin\.com\/jobs|indeed|foundit|cutshort|wellfound/i;

function cleanUrlToken(raw: string): string {
  // Strip trailing punctuation that is sentence text, not part of the URL.
  return raw.replace(/[.,;:!?)"'\]]+$/, "").trim();
}

function descriptionText(job: BoardOpportunity): string {
  return stripHtml(job.description, 20000);
}

function descriptionHtml(job: BoardOpportunity): string {
  return job.description ?? "";
}

/** All unique email addresses mentioned in the brief, lowercased. */
export function extractEmails(job: BoardOpportunity): string[] {
  try {
    const text = descriptionText(job);
    const found = text.match(EMAIL_RE) ?? [];
    const seen = new Set<string>();
    for (const raw of found) {
      const email = raw.toLowerCase().replace(/[.,;:!?)"'\]]+$/, "");
      if (email.length <= 254 && !seen.has(email)) seen.add(email);
    }
    return Array.from(seen).slice(0, 3);
  } catch {
    return [];
  }
}

/** All unique phone numbers mentioned in the brief (digits-normalized). */
export function extractPhones(
  job: BoardOpportunity,
): { display: string; tel: string }[] {
  try {
    const text = descriptionText(job);
    const candidates = text.match(PHONE_CANDIDATE_RE) ?? [];
    const seen = new Set<string>();
    const out: { display: string; tel: string }[] = [];
    for (const raw of candidates) {
      const digits = raw.replace(/\D/g, "");
      // Accept 10-digit (optionally 91-prefixed) numbers; skip years,
      // stipends and other stray digit runs.
      let normalized = digits;
      if (digits.length === 12 && digits.startsWith("91")) {
        normalized = digits.slice(2);
      } else if (digits.length === 11 && digits.startsWith("0")) {
        normalized = digits.slice(1);
      }
      if (normalized.length !== 10) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      const display = raw.trim().replace(/\s+/g, " ");
      out.push({ display, tel: `+91${normalized}` });
      if (out.length >= 2) break;
    }
    return out;
  } catch {
    return [];
  }
}

/** All unique absolute http(s) links mentioned in the brief (no images). */
export function extractBriefLinks(job: BoardOpportunity): string[] {
  try {
    const html = descriptionHtml(job);
    const text = descriptionText(job);
    const hrefs: string[] = [];
    const hrefRe = /href\s*=\s*["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = hrefRe.exec(html)) !== null) {
      if (/^https?:\/\//i.test(m[1])) hrefs.push(cleanUrlToken(m[1]));
    }
    const bare = (text.match(URL_RE) ?? []).map(cleanUrlToken);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of [...hrefs, ...bare]) {
      const key = u.toLowerCase();
      if (seen.has(key) || IMAGE_EXT_RE.test(u)) continue;
      seen.add(key);
      out.push(u);
    }
    return out.slice(0, 5);
  } catch {
    return [];
  }
}

/**
 * The official external apply page, if the recruiter put one in the brief.
 * Prefers links that look like applications/forms/career pages; otherwise
 * returns null so the card falls back to in-platform apply.
 */
export function getOfficialApplyUrl(job: BoardOpportunity): string | null {
  const links = extractBriefLinks(job);
  if (links.length === 0) return null;
  const hinted = links.find((u) => APPLY_HINT_RE.test(u));
  // Only treat a non-hinted bare link as an apply page when it is the only
  // link in the brief (likely the application form); otherwise stay quiet
  // rather than mislabel a portfolio/company link as "official apply".
  if (hinted) return hinted;
  return links.length === 1 ? links[0] : null;
}

/** Short host label for "Apply at {host}" / "read more at {host}" lines. */
export function applyHostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "official site";
  }
}

/** Contact + apply summary for one post, computed once per render. */
export interface PostContact {
  emails: string[];
  phones: { display: string; tel: string }[];
  officialApplyUrl: string | null;
}

export function getPostContact(job: BoardOpportunity): PostContact {
  return {
    emails: extractEmails(job),
    phones: extractPhones(job),
    officialApplyUrl: getOfficialApplyUrl(job),
  };
}

// ---------------------------------------------------------------------------
// GEO helpers: short factual answers AI search / answer engines can quote.
// ---------------------------------------------------------------------------

export interface PostFaq {
  question: string;
  answer: string;
}

/** Auto-generated Q&A for one post (used for FAQ JSON-LD + visible FAQ). */
export function buildPostFaq(
  job: BoardOpportunity,
  contact: PostContact,
  opts?: { platformApply?: boolean },
): PostFaq[] {
  const faqs: PostFaq[] = [];
  const type = getOpportunityType(job) === "internship" ? "internship" : "job";

  faqs.push({
    question: `Is this a job or an internship?`,
    answer:
      type === "internship"
        ? `This is an internship${job.duration ? ` with a tenure of ${job.duration}` : ""}, posted as "${job.title}".`
        : `This is a full-time job posting titled "${job.title}".`,
  });

  faqs.push({
    question: "What is the pay and where is it located?",
    answer: `Compensation is ${payLabel(job)}. Location is ${job.location || "Remote"}.`,
  });

  faqs.push({
    question: "What is the application deadline?",
    answer: job.deadline
      ? `Applications close on ${new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`
      : "Applications are accepted on a rolling basis.",
  });

  const channels: string[] = [];
  if (contact.officialApplyUrl)
    channels.push(
      `the official application page (${applyHostLabel(contact.officialApplyUrl)})`,
    );
  if (contact.emails.length > 0)
    channels.push(`email (${contact.emails.join(", ")})`);
  if (contact.phones.length > 0)
    channels.push(`phone (${contact.phones.map((p) => p.display).join(", ")})`);
  if (opts?.platformApply !== false)
    channels.push("the in-platform application on the detail page");
  faqs.push({
    question: "How do I apply for this role?",
    answer: `You can apply through ${channels.join("; ")}.`,
  });

  return faqs;
}

export function toJobPostingJsonLd(
  job: BoardOpportunity,
  url: string,
): Record<string, unknown> {
  const isIntern = getOpportunityType(job) === "internship";
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: stripHtml(job.description, 2000) || job.title,
    datePosted: job.created_at ?? undefined,
    validThrough: job.deadline ?? undefined,
    employmentType: isIntern ? "INTERN" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.companies?.name ?? "Verified recruiter",
      logo: job.companies?.logo_url ?? undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Remote",
        addressCountry: "IN",
      },
    },
    baseSalary: isPaidOpportunity(job)
      ? {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: {
            "@type": "QuantitativeValue",
            value: payLabel(job),
            unitText: "MONTH",
          },
        }
      : undefined,
    skills: Array.isArray(job.skills) ? job.skills.join(", ") : undefined,
    url,
  };
}
