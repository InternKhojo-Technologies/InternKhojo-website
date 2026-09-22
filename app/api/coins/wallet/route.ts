import { NextResponse, type NextRequest } from "next/server";
import { requireHireAuth } from "@/lib/supabase-server";
import { isCandidateRole, parseCandidateWallet } from "@/lib/coins";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/coins/wallet
 * Returns the signed-in CANDIDATE's coin wallet: { total_coins, history }.
 * Recruiters / admins / any non-candidate role get 403. Auth required.
 *
 * Reads `candidate_coin_wallets` directly (RLS: users read their own row).
 * Direct INSERT/UPDATE from clients stays blocked — only the
 * `credit_candidate_coins` RPC may credit coins.
 */
export async function GET(request: NextRequest) {
  const auth = await requireHireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!isCandidateRole(auth.auth.role)) {
    return NextResponse.json(
      { error: "Coin rewards are available to candidates only." },
      { status: 403 }
    );
  }
  const { user, supabase } = auth.auth;

  try {
    const { data, error } = await supabase
      .from("candidate_coin_wallets")
      .select("total_coins, history")
      .eq("user_id", user.id)
      .single();
    if (error) {
      // No wallet row yet (never earned) — return an empty wallet, not an error.
      const code = (error as { code?: string })?.code ?? "";
      if (code === "PGRST116") {
        return NextResponse.json({ total_coins: 0, history: [] });
      }
      throw error;
    }
    const wallet = parseCandidateWallet(data);
    return NextResponse.json({ total_coins: wallet.totalCoins, history: wallet.history });
  } catch (err) {
    console.error("[coins/wallet] failed:", err);
    return NextResponse.json(
      { error: "Could not load your coin wallet right now. Please retry." },
      { status: 500 }
    );
  }
}
