"use client";

import type { FootballPlayer, PositionGroup } from "@/lib/contracts/types";
import { PlayerCard } from "./PlayerCard";

interface Props {
  group: PositionGroup;
  pool: FootballPlayer[];
  selected: FootballPlayer[];
  constraints: { min: number; max: number };
  onToggle: (player: FootballPlayer) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function DraftPhase({
  group,
  pool,
  selected,
  constraints,
  onToggle,
  onConfirm,
  isSubmitting = false,
}: Props) {
  const selectedCount = selected.length;
  const canConfirm = selectedCount >= constraints.min && selectedCount <= constraints.max;

  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="mb-4 flex items-center justify-between border-b-4 border-slate-900 pb-3">
        <div>
          <h2 className="font-pixel text-[16px] text-slate-900">
            CHOOSE YOUR {group === "GK" ? "GOALKEEPER" : `${group}S`}
          </h2>
          <p className="font-pixel text-[10px] text-slate-500 mt-1">
            Pick between {constraints.min} and {constraints.max} players.
          </p>
        </div>
        <div className="bg-slate-900 text-white font-pixel text-[12px] px-3 py-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]">
          SELECTED: {selectedCount} / {constraints.max}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        {pool.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border-4 border-dashed border-slate-300">
            <span className="font-pixel text-[12px] text-slate-400">Loading players pool...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {pool.map((player, idx) => {
              const isSelected = selected.some((p) => p.name === player.name);
              return (
                <PlayerCard
                  key={`${player.name}-${idx}`}
                  player={player}
                  selected={isSelected}
                  onClick={() => onToggle(player)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="mt-auto pt-4 border-t-4 border-slate-900 flex items-center justify-end bg-[#f6f8f6]">
        <button
          onClick={onConfirm}
          disabled={!canConfirm || isSubmitting}
          className={`font-pixel text-[12px] px-6 py-3 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
            canConfirm && !isSubmitting
              ? "bg-emerald-400 text-slate-900 hover:bg-emerald-300"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting
            ? "SUBMITTING..."
            : group === "GK"
            ? "FINALIZE SQUAD"
            : "CONFIRM SELECTION"}
        </button>
      </div>
    </div>
  );
}
