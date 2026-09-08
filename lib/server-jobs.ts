import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { payLabel, stripHtml, type BoardOpportunity } from "./board";
import { SITE_URL } from "./site";

// Server-only data layer for verified (Supabase) jobs & companies.
// Build-safe: without Supabase env vars every helper returns null/[]
// so metadata, sitemap and pages never crash the production build.

export interface VerifiedJob extends BoardOpportunity {
  salary?: string | null;
  status?: string | null;
  companies?: { name?: string | null; logo_url?: string | null } | null;
}

function serverSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Discriminated fetch outcome so callers never confuse
 * "job does not exist" with "could not reach the database".
 * - ok: render + index (if open).
 * - not-found: genuine 404 + noindex.
 * - unavailable: infra failure — fall back to client-side fetch,
 *   generic metadata + noindex. Never hard-404.
 */
export type JobFetchOutcome =
  | { status: "ok"; job: VerifiedJob }
  | { status: "not-found" }
  | { status: "unavailable" };

async function fetchJobByIdUncached(id: string): Promise<JobFetchOutcome> {
  if (!id) return { status: "not-found" };
  try {
    const sb = serverSupabase();
    // No DB env (or server misconfigured) is NOT a 404 — the client
    // can still retry in the browser. Never hard-404 on infra issues.
    if (!sb) return { status: "unavailable" };
    const { data, error } = await sb
      .from("jobs")
      .select(`*, companies(name, logo_url)`)
      .eq("id", id)
      .single();
    if (error || !data) {
      // PGRST116 = definitively zero rows. Anything else (network,
      // permissions, timeouts) means "unknown", not "missing".
      const code = (error as { code?: string } | null)?.code;
      if (!error || code === "PGRST116") return { status: "not-found" };
      console.error("[verified-job] detail fetch failed:", error);
      return { status: "unavailable" };
    }
    return { status: "ok", job: data as VerifiedJob };
  } catch (err) {
    console.error("[verified-job] detail fetch threw:", err);
    return { status: "unavailable" };
  }
}

// Dedupes the metadata + page fetch within a single request.
export const getVerifiedJobById = cache(fetchJobByIdUncached);

export function isIndexableJob(job: VerifiedJob | null): job is VerifiedJob {
  if (!job) return false;
  return String(job.status ?? "open").toLowerCase() === "open";
}

/** Unique, natural per-job metadata from real job data (no invention). */
export function verifiedJobMeta(job: VerifiedJob): {
  title: string;
  description: string;
  url: string;
} {
  const title0 = String(job.title ?? "Opening").trim() || "Opening";
  const company = job.companies?.name?.trim() || "Verified recruiter";
  const location = job.location?.trim() || "Remote";
  const role =
    typeof job.job_type === "string" && job.job_type.trim() !== ""
      ? job.job_type.trim()
      : "Opening";
  const title = `${title0} at ${company} — ${location} | InternKhojo`;
  const snippet =
    stripHtml(job.description, 140) || `${title0} (${role}) at ${company}.`;
  const description =
    `${snippet} Location: ${location}. Pay: ${payLabel(job)}. Apply on InternKhojo.`.slice(
      0,
      300,
    );
  return { title, description, url: `${SITE_URL}/find/jobs/${job.id}` };
}

/** Public company page ids for the sitemap (capped, build-safe). */
export async function fetchCompanySitemapIds(
  limit = 500,
): Promise<string[]> {
  try {
    const sb = serverSupabase();
    if (!sb) return [];
    const { data, error } = await sb
      .from("companies")
      .select("id")
      .limit(limit);
    if (error || !data) return [];
    return data
      .map((c: { id?: unknown }) => (typeof c.id === "string" ? c.id : null))
      .filter((id): id is string => Boolean(id));
  } catch {
    return [];
  }
}

/** Open verified job ids for the sitemap (capped, build-safe). */
export async function fetchVerifiedJobSitemapIds(
  limit = 1000,
): Promise<string[]> {
  try {
    const sb = serverSupabase();
    if (!sb) return [];
    const { data, error } = await sb
      .from("jobs")
      .select("id")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data
      .map((j: { id?: unknown }) => (typeof j.id === "string" ? j.id : null))
      .filter((id): id is string => Boolean(id));
  } catch {
    return [];
  }
}
