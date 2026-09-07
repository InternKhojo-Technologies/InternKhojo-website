import { ObjectId, type Document, type Filter } from "mongodb";
import { getJobsCollection, isMongoConfigured } from "./mongo";
import {
  extractEmails,
  extractPhones,
  getOfficialApplyUrl,
  type BoardOpportunity,
} from "./board";
import type { ExternalPost } from "./external-post";

// Server-only data layer: external JSON postings (MongoDB) → normalized posts.
//
// The collection holds ~1.5K+ heterogeneous JSON docs, so every accessor below
// tries a precedence list of common key variants instead of assuming one exact
// schema. If you can share one sample document, the lists in KEY HINTS can be
// tightened. Recommended Mongo indexes for scale:
//   db.jobs.createIndex({ title: 1 }); db.jobs.createIndex({ company: 1 });

export const BULLETIN_PAGE_SIZE = 12;

// --- KEY HINTS (most-likely first) -------------------------------------------
// Live shape (internkhojo.bulletin_jobs, 1551 docs): id, title, company,
// snippet, location, stipend_salary, opportunity_type, mode, duration, field,
// posted_date, scraped_at, deadline, apply_url, source_name, source_url.
// The longer fallback lists stay as harmless safety nets.

const TITLE_KEYS = ["title", "job_title", "jobTitle", "role", "position", "designation", "name", "headline"];
const COMPANY_KEYS = ["company", "company_name", "companyName", "organization", "organisation", "employer", "org", "hiring_organization"];
const LOGO_KEYS = ["logo", "logo_url", "logoUrl", "company_logo", "companyLogo", "image", "image_url"];
const DESC_KEYS = ["snippet", "description", "job_description", "jobDescription", "details", "summary", "about", "content", "body"];
const LOC_KEYS = ["location", "city", "place", "venue", "address", "location_name", "job_location"];
const PAY_KEYS = ["stipend_salary", "stipend", "salary", "pay", "ctc", "compensation", "remuneration", "wages", "package", "salary_range"];
const TYPE_KEYS = ["opportunity_type", "type", "job_type", "jobType", "employment_type", "employmentType", "category", "role_type"];
const DURATION_KEYS = ["duration", "tenure", "period", "length", "internship_duration"];
const EXP_KEYS = ["experience", "experience_level", "experienceLevel", "eligibility", "exp", "years_of_experience", "who_can_apply"];
const SKILL_KEYS = ["skills", "tags", "keywords", "stack", "technologies", "tech_stack", "requirements", "skill_set"];
const DEADLINE_KEYS = ["deadline", "last_date", "lastDate", "apply_by", "applyBy", "closing_date", "valid_through", "expiry"];
const POSTED_KEYS = ["posted_date", "postedAt", "posted_at", "created_at", "createdAt", "date_posted", "published_at", "scraped_at", "date"];
const APPLY_KEYS = ["apply_url", "applyUrl", "apply_link", "applyLink", "application_url", "application_link", "source_url", "link", "url", "sourceUrl", "original_url", "job_url"];
const SOURCE_KEYS = ["source_name", "sourceName", "source", "portal", "site"];
const MODE_KEYS = ["mode", "work_mode", "workMode", "workplace", "job_mode"];
const FIELD_KEYS = ["field", "domain", "category", "sector", "vertical"];
/** Free-text search scope: title + snippet + company (+ field code). */
const SEARCH_KEYS = ["title", "snippet", "company", "field", "description"];

const UNPAID_TOKENS = ["", "0", "unpaid", "nil", "none", "na", "n/a", "-", "--"];

// --- Normalized shape ---------------------------------------------------------

// --- Normalized shape is defined client-safely in ./external-post --------

// --- Pick helpers ---------------------------------------------------------------

function asString(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function pickString(doc: Document, keys: string[]): string | null {
  for (const k of keys) {
    const v = asString(doc[k]);
    if (v) return v;
  }
  return null;
}

function pickStringArray(doc: Document, keys: string[]): string[] {
  for (const k of keys) {
    const v = doc[k];
    if (Array.isArray(v)) {
      const out = v
        .map((x) => (typeof x === "string" ? x.trim() : null))
        .filter((x): x is string => Boolean(x));
      if (out.length > 0) return Array.from(new Set(out)).slice(0, 30);
    } else if (typeof v === "string" && v.trim() !== "") {
      // Comma/semicolon separated string fallback.
      const out = Array.from(
        new Set(
          v
            .split(/[,;|]/)
            .map((x) => x.trim())
            .filter(Boolean),
        ),
      ).slice(0, 30);
      if (out.length > 0) return out;
    }
  }
  return [];
}

function pickDateIso(doc: Document, keys: string[]): string | null {
  for (const k of keys) {
    const v = doc[k];
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString();
    if (typeof v === "string" || typeof v === "number") {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }
  return null;
}

function isUnpaidToken(v: string | null): boolean {
  if (!v) return true;
  return UNPAID_TOKENS.includes(v.trim().toLowerCase());
}

// --- Normalizer -------------------------------------------------------------------

export function normalizeExternalPost(doc: Document): ExternalPost | null {
  const rawId = doc._id;
  const id =
    rawId instanceof ObjectId
      ? rawId.toHexString()
      : (asString(rawId) ?? asString(doc.id));
  const title = pickString(doc, TITLE_KEYS);
  if (!id || !title) return null;

  const explicitType = pickString(doc, TYPE_KEYS);
  const kind: "job" | "internship" =
    explicitType && /intern/i.test(explicitType)
      ? "internship"
      : explicitType && /full|job|permanent|contract|part|freelance/i.test(explicitType)
        ? "job"
        : /intern/i.test(title)
          ? "internship"
          : "job";

  const payRaw = pickString(doc, PAY_KEYS);
  const paid = !isUnpaidToken(payRaw);

  const description = pickString(doc, DESC_KEYS);

  // Structured apply link wins; otherwise mine the brief text.
  const structuredApply = pickString(doc, APPLY_KEYS);
  const briefForMining: BoardOpportunity = {
    id,
    title,
    description,
  } as BoardOpportunity;
  const minedApply =
    structuredApply && /^https?:\/\//i.test(structuredApply)
      ? structuredApply
      : getOfficialApplyUrl(briefForMining);

  return {
    id,
    title,
    company: pickString(doc, COMPANY_KEYS),
    logoUrl: pickString(doc, LOGO_KEYS),
    kind,
    pay: paid ? payRaw : null,
    paid,
    location: pickString(doc, LOC_KEYS),
    duration: kind === "internship" ? pickString(doc, DURATION_KEYS) : null,
    experience: pickString(doc, EXP_KEYS),
    deadline: pickDateIso(doc, DEADLINE_KEYS),
    postedAt: pickDateIso(doc, POSTED_KEYS),
    skills: pickStringArray(doc, SKILL_KEYS),
    description,
    applyUrl: minedApply,
    emails: extractEmails(briefForMining),
    phones: extractPhones(briefForMining),
    source: pickString(doc, SOURCE_KEYS),
    mode: pickString(doc, MODE_KEYS),
    field: pickString(doc, FIELD_KEYS),
  };
}

// --- Query building (server-side filtering → correct pagination) ------------------

export interface BulletinQuery {
  q?: string;
  type?: "job" | "internship" | "all";
  pay?: "paid" | "unpaid" | "all";
  loc?: string;
  skill?: string;
  exp?: string;
  field?: string;
  page?: number;
  pageSize?: number;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function orRegex(keys: string[], value: string): Filter<Document>[] {
  const rx = { $regex: escapeRegExp(value), $options: "i" } as const;
  return keys.map((k) => ({ [k]: rx }) as Filter<Document>);
}

function paidCondition(): Filter<Document> {
  // Any pay-ish field holding a meaningful (non-empty, non-"unpaid") value.
  return {
    $or: PAY_KEYS.map(
      (k) =>
        ({
          [k]: {
            $exists: true,
            $nin: ["", "0", 0, "Unpaid", "unpaid", "UNPAID", "NA", "N/A", "-", "None", "none", null],
          },
        }) as Filter<Document>,
    ),
  };
}

function internCondition(): Filter<Document> {
  const explicit = TYPE_KEYS.map(
    (k) => ({ [k]: { $regex: "intern", $options: "i" } }) as Filter<Document>,
  );
  const inTitle = TITLE_KEYS.map(
    (k) => ({ [k]: { $regex: "intern", $options: "i" } }) as Filter<Document>,
  );
  return { $or: [...explicit, ...inTitle] };
}

export function buildBulletinFilter(query: BulletinQuery): Filter<Document> {
  const and: Filter<Document>[] = [];

  if (query.q?.trim()) {
    const q = query.q.trim();
    and.push({ $or: orRegex(SEARCH_KEYS, q) });
  }
  if (query.type === "internship") and.push(internCondition());
  if (query.type === "job") and.push({ $nor: [internCondition()] });
  if (query.pay === "paid") and.push(paidCondition());
  if (query.pay === "unpaid") and.push({ $nor: [paidCondition()] });
  if (query.loc?.trim()) {
    and.push({ $or: orRegex(LOC_KEYS, query.loc.trim()) });
  }
  if (query.skill?.trim()) {
    // No structured skills column in this collection — match the free text.
    and.push({ $or: orRegex(["title", "snippet", "description"], query.skill.trim()) });
  }
  if (query.field?.trim()) {
    // Exact (case-insensitive) domain match: tech / finance / law / …
    const exact = `^${escapeRegExp(query.field.trim())}$`;
    and.push({
      $or: FIELD_KEYS.map(
        (k) => ({ [k]: { $regex: exact, $options: "i" } }) as Filter<Document>,
      ),
    });
  }
  if (query.exp?.trim()) {
    and.push({ $or: orRegex(EXP_KEYS, query.exp.trim()) });
  }

  return and.length > 0 ? { $and: and } : {};
}

export interface BulletinPage {
  items: ExternalPost[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  configured: boolean;
}

export async function fetchBulletinPosts(
  query: BulletinQuery,
): Promise<BulletinPage> {
  const pageSize = Math.min(Math.max(query.pageSize ?? 12, 1), 48);
  const page = Math.max(query.page ?? 1, 1);
  const empty: BulletinPage = {
    items: [],
    total: 0,
    page: 1,
    pageSize,
    pageCount: 0,
    configured: false,
  };
  if (!isMongoConfigured()) return empty;
  try {
    const col = await getJobsCollection();
    const filter = buildBulletinFilter(query);
    const [total, docs] = await Promise.all([
      col.countDocuments(filter),
      col
        .find(filter)
        .sort({ _id: -1 }) // ObjectIds sort ~newest-first; no schema assumption
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
    ]);
    const items = docs
      .map(normalizeExternalPost)
      .filter((p): p is ExternalPost => p !== null);
    const pageCount = Math.ceil(total / pageSize);
    return {
      items,
      total,
      page: pageCount > 0 ? Math.min(page, pageCount) : 1,
      pageSize,
      pageCount,
      configured: true,
    };
  } catch (err) {
    console.error("[bulletin] Mongo fetch failed:", err);
    return { ...empty, configured: true };
  }
}

export async function fetchExternalPostById(
  id: string,
): Promise<ExternalPost | null> {
  if (!isMongoConfigured() || !id) return null;
  try {
    const col = await getJobsCollection();
    const ors: Filter<Document>[] = [{ id }, { job_id: id }];
    if (ObjectId.isValid(id)) ors.unshift({ _id: new ObjectId(id) });
    else ors.unshift({ _id: id as unknown as ObjectId });
    const doc = await col.findOne({ $or: ors });
    return doc ? normalizeExternalPost(doc) : null;
  } catch (err) {
    console.error("[bulletin] Mongo detail fetch failed:", err);
    return null;
  }
}

export async function fetchRelatedExternalPosts(
  currentId: string,
  kind: "job" | "internship",
  limit = 4,
): Promise<ExternalPost[]> {
  if (!isMongoConfigured()) return [];
  try {
    const col = await getJobsCollection();
    const notCurrent: Filter<Document>[] = [{ _id: { $ne: currentId } as unknown as ObjectId }];
    if (ObjectId.isValid(currentId)) {
      notCurrent.push({ _id: { $ne: new ObjectId(currentId) } });
    }
    const filter: Filter<Document> =
      kind === "internship"
        ? { $and: [...notCurrent, internCondition()] }
        : { $and: [...notCurrent, { $nor: [internCondition()] }] };
    const docs = await col.find(filter).sort({ _id: -1 }).limit(limit).toArray();
    return docs
      .map(normalizeExternalPost)
      .filter((p): p is ExternalPost => p !== null);
  } catch {
    return [];
  }
}

export interface BulletinCounts {
  total: number;
  jobs: number;
  internships: number;
  configured: boolean;
}

/** Global lane counts for the All/Jobs/Internships tabs (3 cheap counts). */
export async function fetchBulletinCounts(): Promise<BulletinCounts> {
  const empty: BulletinCounts = { total: 0, jobs: 0, internships: 0, configured: false };
  if (!isMongoConfigured()) return empty;
  try {
    const col = await getJobsCollection();
    const intern = internCondition();
    const [total, internships] = await Promise.all([
      col.estimatedDocumentCount(),
      col.countDocuments(intern),
    ]);
    return { total, internships, jobs: Math.max(total - internships, 0), configured: true };
  } catch (err) {
    console.error("[bulletin] Mongo counts failed:", err);
    return { ...empty, configured: true };
  }
}

/** Distinct location values for the location datalist (capped). */
export async function fetchBulletinLocations(limit = 12): Promise<string[]> {
  if (!isMongoConfigured()) return [];
  try {
    const col = await getJobsCollection();
    const out: string[] = [];
    for (const key of LOC_KEYS) {
      if (out.length >= limit) break;
      const vals = await col.distinct(key, {
        [key]: { $exists: true, $ne: "" },
      } as Filter<Document>);
      for (const v of vals) {
        if (typeof v === "string" && v.trim() !== "" && !out.includes(v.trim())) {
          out.push(v.trim());
          if (out.length >= limit) break;
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

export interface BulletinField {
  value: string;
  count: number;
}

/** Domain/field lanes with counts (tech / finance / law / …) for the filter. */
export async function fetchBulletinFields(limit = 30): Promise<BulletinField[]> {
  if (!isMongoConfigured()) return [];
  try {
    const col = await getJobsCollection();
    const coalesce = [...FIELD_KEYS].reverse().reduce<unknown>(
      (acc, k) => ({ $ifNull: [`$${k}`, acc] }),
      "$$REMOVE",
    );
    const groups = (await col
      .aggregate([
        { $group: { _id: coalesce, n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: limit },
      ])
      .toArray()) as { _id?: unknown; n?: number }[];
    const out: BulletinField[] = [];
    for (const g of groups) {
      if (typeof g._id === "string" && g._id.trim() !== "") {
        out.push({ value: g._id.trim(), count: g.n ?? 0 });
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Lean id list for the sitemap (projection only, capped). */
export async function fetchBulletinSitemapIds(limit = 2000): Promise<string[]> {
  if (!isMongoConfigured()) return [];
  try {
    const col = await getJobsCollection();
    const docs = await col
      .find({}, { projection: { _id: 1 } })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    const ids: string[] = [];
    for (const d of docs) {
      const v = d._id;
      ids.push(v instanceof ObjectId ? v.toHexString() : String(v));
    }
    return ids;
  } catch {
    return [];
  }
}
