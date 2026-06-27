"use client";

import type { FootballPlayer } from "@/lib/contracts/types";
import { POS_COLOR } from "@/lib/constants/squad";

interface Props {
  picks: Record<string, FootballPlayer[]>;
}

export function SquadSummary({ picks }: Props) {
  const totalPicks = Object.values(picks).flat().length;

  return (
    <div className="bg-white border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col">
      <div className="border-b-4 border-slate-900 pb-2 mb-3 flex justify-between items-center">
        <h3 className="font-pixel text-[12px] text-slate-900">YOUR SQUAD</h3>
        <span className="font-pixel text-[12px] bg-slate-900 text-white px-2 py-0.5">
          {totalPicks}/11
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 font-pixel text-[10px]">
        {/* ATTACKERS */}
        <div>
          <div className="text-slate-400 border-b border-dashed border-slate-200 pb-0.5 mb-1.5 uppercase">
            Attackers ({picks.ATT?.length || 0})
          </div>
          {picks.ATT && picks.ATT.length > 0 ? (
            <div className="space-y-1">
              {picks.ATT.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-1 border border-slate-200">
                  <span className="truncate max-w-[120px]">{p.name}</span>
                  <span className="text-white px-1 text-[8px]" style={{ backgroundColor: POS_COLOR[p.position] }}>
                    {p.position}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-300 italic text-center py-1">No picks yet</div>
          )}
        </div>

        {/* MIDFIELDERS */}
        <div>
          <div className="text-slate-400 border-b border-dashed border-slate-200 pb-0.5 mb-1.5 uppercase">
            Midfielders ({picks.MID?.length || 0})
          </div>
          {picks.MID && picks.MID.length > 0 ? (
            <div className="space-y-1">
              {picks.MID.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-1 border border-slate-200">
                  <span className="truncate max-w-[120px]">{p.name}</span>
                  <span className="text-white px-1 text-[8px]" style={{ backgroundColor: POS_COLOR[p.position] }}>
                    {p.position}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-300 italic text-center py-1">No picks yet</div>
          )}
        </div>

        {/* DEFENDERS */}
        <div>
          <div className="text-slate-400 border-b border-dashed border-slate-200 pb-0.5 mb-1.5 uppercase">
            Defenders ({picks.DEF?.length || 0})
          </div>
          {picks.DEF && picks.DEF.length > 0 ? (
            <div className="space-y-1">
              {picks.DEF.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-1 border border-slate-200">
                  <span className="truncate max-w-[120px]">{p.name}</span>
                  <span className="text-white px-1 text-[8px]" style={{ backgroundColor: POS_COLOR[p.position] }}>
                    {p.position}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-300 italic text-center py-1">No picks yet</div>
          )}
        </div>

        {/* GOALKEEPER */}
        <div>
          <div className="text-slate-400 border-b border-dashed border-slate-200 pb-0.5 mb-1.5 uppercase">
            Goalkeeper ({picks.GK?.length || 0})
          </div>
          {picks.GK && picks.GK.length > 0 ? (
            <div className="space-y-1">
              {picks.GK.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-1 border border-slate-200">
                  <span className="truncate max-w-[120px]">{p.name}</span>
                  <span className="text-white px-1 text-[8px]" style={{ backgroundColor: POS_COLOR[p.position] }}>
                    {p.position}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-300 italic text-center py-1">No picks yet</div>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-center gap-1.5">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 border-2 border-slate-900 transition-all ${
              i < totalPicks ? "bg-emerald-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" : "bg-slate-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
