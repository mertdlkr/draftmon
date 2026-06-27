"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import type { LeaderboardEntry } from "@/lib/contracts/types";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setEntries(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="border-b-4 border-slate-900 pb-4 mb-8">
        <h1 className="font-pixel text-[22px] text-slate-900">LEADERBOARD</h1>
        <p className="font-pixel text-[9px] text-slate-400 mt-1">TOP MANAGERS BY WINS</p>
      </div>

      {loading ? (
        <div className="text-center font-pixel text-[12px] text-slate-400 py-20">
          LOADING...
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center font-pixel text-[12px] text-slate-400 py-20">
          NO RESULTS YET — BE THE FIRST TO WIN A TOURNAMENT
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-4 border-slate-900">
            <thead>
              <tr className="bg-slate-900 text-white font-pixel text-[9px]">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">WALLET</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-center">PLAYED</th>
                <th className="p-3 text-right">EARNED</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={e.wallet}
                  className={`border-b-2 border-slate-200 font-pixel text-[9px] ${
                    i === 0 ? "bg-amber-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <td className="p-3 text-slate-500">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="p-3 text-slate-900 font-mono text-[10px]">
                    {e.wallet.slice(0, 8)}…{e.wallet.slice(-6)}
                  </td>
                  <td className="p-3 text-center text-emerald-600 font-bold">{e.wins}</td>
                  <td className="p-3 text-center text-rose-500">{e.losses}</td>
                  <td className="p-3 text-center text-slate-600">{e.tournaments_played}</td>
                  <td className="p-3 text-right text-amber-600">
                    {Number(formatEther(BigInt(e.total_earned_wei))).toFixed(3)} MON
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
