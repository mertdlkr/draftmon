"use client";

import type { RoomPlayer } from "@/lib/contracts/types";

interface Props {
  players: RoomPlayer[];
  showSquads: boolean;
}

export function SquadRevealGrid({ players, showSquads }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {players.map((player) => {
        const shortWallet = `${player.wallet.slice(0, 6)}...${player.wallet.slice(-4)}`;
        const hasSquad = player.squad_json && player.squad_json.length > 0;

        return (
          <div
            key={player.id}
            className={`bg-white border-4 p-4 flex flex-col h-96 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 ${
              player.draft_done
                ? "border-emerald-500 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                : "border-slate-900"
            }`}
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-center justify-between">
              <div>
                <span className="font-pixel text-[10px] font-bold block truncate max-w-[120px]">
                  {shortWallet}
                </span>
                <span className="font-pixel text-[8px] text-slate-400">
                  Manager Roster
                </span>
              </div>
              <div>
                {player.draft_done ? (
                  <span className="bg-emerald-400 text-slate-900 font-pixel text-[8px] px-2 py-0.5 border border-slate-900">
                    READY
                  </span>
                ) : (
                  <span className="bg-amber-400 text-slate-900 font-pixel text-[8px] px-2 py-0.5 border border-slate-900 animate-pulse">
                    DRAFTING
                  </span>
                )}
              </div>
            </div>

            {/* Squad details or placeholder */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {showSquads && hasSquad ? (
                <div className="space-y-1.5 font-pixel text-[10px]">
                  {player.squad_json?.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 border border-slate-200 bg-slate-50"
                    >
                      <span className="truncate max-w-[120px] text-slate-900">{p.name}</span>
                      <span
                        className="text-[8px] text-white px-1.5 py-0.5 border border-slate-900"
                        style={{
                          backgroundColor:
                            p.position === "GK"
                              ? "#f59e0b"
                              : ["CB", "LB", "RB"].includes(p.position)
                              ? "#13ec5b"
                              : ["CDM", "CM", "CAM"].includes(p.position)
                              ? "#3b82f6"
                              : "#ef4444",
                        }}
                      >
                        {p.position}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <span className="material-symbols-outlined text-[32px] animate-spin">
                    progress_activity
                  </span>
                  <span className="font-pixel text-[8px] mt-2">
                    {player.draft_done ? "ROSTER SECURED" : "BUILDING TEAM..."}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
