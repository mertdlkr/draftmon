"use client";

import type { Match } from "@/lib/contracts/types";

interface Props {
  matches: Match[];
  players: { wallet: string }[];
  activeIdx: number;
  onSelect: (idx: number) => void;
}

const ROUND_ORDER = ["R16", "QF", "SF", "Final"] as const;

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function MatchBracket({ matches, players: _players, activeIdx, onSelect }: Props) {
  if (!matches || matches.length === 0) return null;

  const grouped: Record<string, Match[]> = {};
  for (const m of matches) {
    if (!grouped[m.round]) grouped[m.round] = [];
    grouped[m.round].push(m);
  }

  const rounds = ROUND_ORDER.filter((r) => grouped[r]);

  const globalIdx = (round: string, matchIdx: number) =>
    matches.findIndex((m) => m.round === round && m.match_index === matchIdx);

  return (
    <div className="bg-white border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
      <h3 className="font-pixel text-[11px] text-slate-900 border-b-2 border-slate-900 pb-2 mb-4">
        TOURNAMENT BRACKET
      </h3>

      <div className="flex gap-6 min-w-max">
        {rounds.map((round) => (
          <div key={round} className="flex flex-col gap-3">
            <div className="font-pixel text-[8px] text-slate-400 text-center mb-1">{round}</div>
            {(grouped[round] ?? []).map((m) => {
              const gIdx = globalIdx(round, m.match_index);
              const isActive = gIdx === activeIdx;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelect(gIdx)}
                  className={`cursor-pointer border-2 p-2 min-w-[130px] transition-all active:scale-95 ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                      : "border-slate-900 hover:border-slate-600"
                  }`}
                >
                  <div className={`font-pixel text-[9px] flex justify-between items-center ${m.winner_wallet === m.home_wallet ? "text-emerald-600 font-bold" : "text-slate-700"}`}>
                    <span className="truncate max-w-[80px]">{shortAddr(m.home_wallet)}</span>
                    <span className="ml-1 shrink-0">{m.home_score}</span>
                  </div>
                  <div className="border-t border-slate-200 my-1" />
                  <div className={`font-pixel text-[9px] flex justify-between items-center ${m.winner_wallet === m.away_wallet ? "text-emerald-600 font-bold" : "text-slate-700"}`}>
                    <span className="truncate max-w-[80px]">{shortAddr(m.away_wallet)}</span>
                    <span className="ml-1 shrink-0">{m.away_score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
