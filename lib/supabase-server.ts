import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

// Server-side Supabase helper for /hire route handlers.
//
// The repo uses a single anon-key client on the browser (lib/supabase.ts).
// Route handlers cannot read the browser session cookie directly without
// @supabase/ssr, so clients send `Authorization: Bearer <access_token>`
// (from `supabase.auth.getSession()`). We re-create a per-request client
// scoped to that JWT and verify it with `auth.getUser(token)`.

function envUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null;
}

function envAnonKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null;
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(envUrl() && envAnonKey());
}

export function bearerTokenFromRequest(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1].trim();
  return token === "" ? null : token;
}

export interface HireAuth {
  user: User;
  role: string | null;
  supabase: SupabaseClient;
}

export async function requireHireAuth(req: Request): Promise<
  | { ok: true; auth: HireAuth }
  | { ok: false; status: number; error: string }
> {
  const url = envUrl();
  const anon = envAnonKey();
  if (!url || !anon) {
    return { ok: false, status: 503, error: "Supabase is not configured on the server." };
  }
  const token = bearerTokenFromRequest(req);
  if (!token) {
    return { ok: false, status: 401, error: "Missing Authorization bearer token. Please log in again." };
  }
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, error: "Session expired. Please log in again." };
  }
  const user = data.user;
  let role: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile as { role?: string } | null)?.role ?? null;
  } catch {
    role = null;
  }
  return { ok: true, auth: { user, role, supabase } };
}
