"use client";

import type { RoomPlayer } from "@/lib/contracts/types";
import { formatDistanceToNow } from "date-fns"; // Wait, date-fns might not be installed. Let's write a simple date formatter instead.

interface Props {
  players: RoomPlayer[];
  capacity: number;
}

export function PlayerList({ players, capacity }: Props) {
  const filledCount = players.length;

  return (
    <div className="bg-white border-4 border-slate-900 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2 mb-4">
        <h3 className="font-pixel text-[12px] text-slate-900">JOINED MANAGERS</h3>
        <span className="font-pixel text-[10px] bg-slate-900 text-white px-2 py-0.5">
          {filledCount} / {capacity}
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {Array.from({ length: capacity }).map((_, idx) => {
          const player = players[idx];

          if (player) {
            const shortWallet = `${player.wallet.slice(0, 6)}...${player.wallet.slice(-4)}`;
            return (
              <div
                key={player.id || idx}
                className="flex items-center justify-between p-3 border-2 border-slate-900 bg-emerald-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-400 border border-slate-900 flex items-center justify-center font-pixel text-[10px] text-slate-900">
                    {idx + 1}
                  </div>
                  <span className="font-pixel text-[10px] text-slate-900 font-bold">
                    {shortWallet}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[8px] text-slate-400">
                    {new Date(player.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {player.draft_done ? (
                    <span className="bg-emerald-400 text-slate-900 font-pixel text-[8px] px-1.5 py-0.5 border border-slate-900">
                      READY
                    </span>
                  ) : (
                    <span className="bg-amber-400 text-slate-900 font-pixel text-[8px] px-1.5 py-0.5 border border-slate-900">
                      DRAFTING
                    </span>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400"
              >
                <div className="w-5 h-5 bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center font-pixel text-[10px]">
                  {idx + 1}
                </div>
                <span className="font-pixel text-[10px] italic">Waiting for manager...</span>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
