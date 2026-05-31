"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Trophy, Clock, Zap, ArrowLeft, Activity } from "lucide-react";

export default function GlobalLeaderboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    compileLeaderboardMetrics();
  }, []);

  const compileLeaderboardMetrics = async () => {
    try {
      const { data: submissions, error } = await supabase.from(
        "game_submissions",
      ).select(`
          user_id,
          time_taken_seconds,
          points_awarded,
          profiles:user_id ( name, role )
        `);

      if (error) throw error;

      const userAggregation: Record<string, any> = {};

      submissions?.forEach((sub: any) => {
        if (sub.profiles?.role !== "candidate") return;

        const uid = sub.user_id;
        if (!userAggregation[uid]) {
          userAggregation[uid] = {
            name: sub.profiles?.name || "Anonymous Matrix",
            totalPoints: 0,
            totalTime: 0,
            solveCount: 0,
          };
        }
        userAggregation[uid].totalPoints += sub.points_awarded;
        userAggregation[uid].totalTime += sub.time_taken_seconds;
        userAggregation[uid].solveCount += 1;
      });

      const sortedLeaderboard = Object.values(userAggregation)
        .map((user: any) => ({
          ...user,
          avgTime: user.totalTime / user.solveCount,
        }))
        .sort(
          (a: any, b: any) =>
            b.totalPoints - a.totalPoints || a.avgTime - b.avgTime,
        );

      setLeaderboard(sortedLeaderboard);
    } catch (err) {
      console.error("Leaderboard query sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (loading)
    return (
      <div className="h-screen w-full bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Activity size={12} className="animate-spin text-neutral-400" />
          <span className="text-[10px] font-mono tracking-wider text-neutral-400">
            COMPILING_GLOBAL_STANDINGS...
          </span>
        </div>
      </div>
    );

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-32 antialiased">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-16 space-y-12">
        <header className="flex items-center justify-between border-b border-neutral-200/60 pb-6">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/hire")}
              className="text-xs font-mono font-bold text-neutral-400 hover:text-neutral-950 flex items-center gap-1.5 transition-colors mb-2 uppercase cursor-pointer bg-transparent border-0 p-0"
            >
              <ArrowLeft size={12} /> // Return_Arena
            </button>
            <h1 className="text-xl font-black uppercase tracking-tight text-neutral-950">
              Global Leaderboard Standings
            </h1>
          </div>
          <Trophy size={20} className="text-neutral-400" />
        </header>

        <div className="bg-white border border-neutral-200/50 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="grid grid-cols-12 bg-neutral-50/70 border-b border-neutral-200/40 p-4 text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
            <div className="col-span-2">// RANK</div>
            <div className="col-span-5">// CANDIDATE_PROFILE</div>
            <div className="col-span-3 text-right">// SCORE</div>
            <div className="col-span-2 text-right">// AVG_SPEED</div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-400 uppercase tracking-wider">
              No transactional solve speeds logged in active cycle.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {leaderboard.map((row: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-12 p-4 items-center text-xs font-medium transition-colors hover:bg-neutral-50/50"
                >
                  <div className="col-span-2 font-mono font-bold text-neutral-400">
                    #{index + 1}
                  </div>
                  <div className="col-span-5 font-black uppercase text-neutral-950 tracking-tight">
                    {row.name}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-neutral-900 flex items-center justify-end gap-1">
                    {row.totalPoints}{" "}
                    <Zap size={11} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div className="col-span-2 text-right font-mono text-neutral-400 flex items-center justify-end gap-1">
                    {row.avgTime.toFixed(1)}s <Clock size={11} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
