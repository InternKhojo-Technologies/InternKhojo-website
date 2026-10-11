"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { formatCoins, type CoinHistoryEntry } from "@/lib/coins";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Gift,
  History,
  RotateCcw,
  ShieldAlert,
  Trophy,
  Zap,
} from "lucide-react";

function formatLocal(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function RewardsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);
  const [history, setHistory] = useState<CoinHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/rewards");
        return;
      }
      // Candidates only — everyone else goes back to their dashboard.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const role = (profile as { role?: string } | null)?.role ?? null;
      if (role !== "candidate") {
        if (role === "recruiter") router.push("/dashboard/recruiter");
        else router.push("/");
        setBlocked(true);
        return;
      }
      const token = session?.access_token ?? "";
      const res = await fetch("/api/coins/wallet", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.push("/login?redirect=/rewards");
        return;
      }
      if (res.status === 403) {
        setBlocked(true);
        router.push("/");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Could not load your rewards.");
      setTotalCoins(Number(json?.total_coins ?? 0) || 0);
      setHistory(Array.isArray(json?.history) ? (json.history as CoinHistoryEntry[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  if (!mounted || blocked) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased pb-28">
      <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5">
        <Link
          href="/hire"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft size={14} /> Practice tests
        </Link>

        <div>
          <h1 className="font-display-hire text-[28px] sm:text-[34px] font-extrabold tracking-tight leading-none">
            Coin rewards
          </h1>
          <p className="mt-2 text-[13px] text-neutral-500">
            Earn coins for every quiz — climb the daily ranks for bonuses.
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <p className="text-[13px] font-medium text-red-800">{error}</p>
            <button
              onClick={load}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              <RotateCcw size={12} /> Retry
            </button>
          </div>
        )}

        {/* ── Wallet card ─────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-2xl bg-neutral-900 p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                <Coins size={13} className="text-amber-400" /> Your wallet
              </p>
              {loading ? (
                <div className="mt-2 h-11 w-40 animate-pulse rounded-lg bg-white/10" />
              ) : (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display-hire mt-2 text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight"
                >
                  🪙 {totalCoins.toFixed(2)}
                  <span className="ml-2 align-middle text-sm font-semibold text-neutral-400">
                    Coins
                  </span>
                </motion.p>
              )}
              <p className="mt-2 text-[13px] text-neutral-400">
                +1.00 per quiz · +1.50 per correct answer · daily rank bonuses up to +25.00
              </p>
            </div>
            <span className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
              <Trophy size={26} />
            </span>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/hire"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <Zap size={14} /> Earn more coins
            </Link>
            <Link
              href="/hire/leaderboard"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Leaderboard <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── Audit history log ───────────────────────────────────── */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="inline-flex items-center gap-2 text-[13px] font-bold text-neutral-800">
              <History size={14} className="text-neutral-400" /> Earning history
            </h2>
            {!loading && history.length > 0 && (
              <span className="text-xs font-semibold tabular-nums text-neutral-400">
                {history.length} entr{history.length === 1 ? "y" : "ies"}
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-2.5 p-5 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-neutral-100" />
              ))}
            </div>
          ) : history.length === 0 && !error ? (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <Coins size={20} />
              </span>
              <p className="font-display-hire mt-4 text-lg font-bold tracking-tight">
                No coins earned yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-neutral-500">
                No coins earned yet. Complete your first quiz to earn coins!
              </p>
              <Link
                href="/hire"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700"
              >
                <Zap size={14} /> Start your first test
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {history.map((e, i) => (
                <motion.li
                  key={`${e.source}-${e.createdAt}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
                  className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.source}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-neutral-500">
                      {formatLocal(e.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[13px] font-bold tabular-nums text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    {formatCoins(e.coins)}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        {/* ── How earning works ───────────────────────────────────── */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="font-display-hire text-[15px] font-extrabold tracking-tight">
            How earning works
          </p>
          <div className="mt-3 space-y-2.5">
            {[
              { k: "+1.00", v: "for submitting any daily test" },
              { k: "+1.50", v: "for every correct answer" },
              { k: "+3.00", v: "daily participation when the pool is under 12 candidates" },
              { k: "+10–25", v: "daily rank bonuses when the pool is bigger (top 10 paid)" },
            ].map((r) => (
              <div key={r.k} className="flex items-center gap-3 text-[13px]">
                <span className="w-16 shrink-0 rounded-lg bg-neutral-900 px-2 py-1 text-center text-xs font-bold tabular-nums text-white">
                  {r.k}
                </span>
                <p className="text-neutral-600">{r.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Prizes banner (pinned at bottom) ────────────────────── */}
        <section className="flex gap-3.5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
            <Gift size={22} />
          </span>
          <div className="min-w-0">
            <p className="font-display-hire text-[16px] font-extrabold tracking-tight">
              🎁 Redeem Prizes (Coming Soon)
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
              You can use your earned coins to claim exclusive prizes,
              certifications, and rewards. Prize redemption is currently being
              set up and will go live soon. Keep practicing, climbing daily
              ranks, and stocking up on coins!
            </p>
          </div>
        </section>

        <p className="flex items-start gap-2 rounded-xl bg-neutral-100/70 px-4 py-3 text-[12px] leading-relaxed text-neutral-500">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          Coin rewards are for candidates only. Recruiters and admins can view
          leaderboards but never earn coins.
        </p>
      </div>
    </div>
  );
}
