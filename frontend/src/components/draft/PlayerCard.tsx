"use client";

import type { FootballPlayer } from "@/lib/contracts/types";
import { POS_COLOR, statDots } from "@/lib/constants/squad";
import { PixelStatBar } from "@/components/ui/PixelStatBar";

interface Props {
  player: FootballPlayer;
  selected: boolean;
  onClick: () => void;
}

export function PlayerCard({ player, selected, onClick }: Props) {
  const accentColor = POS_COLOR[player.position] || "#94a3b8";

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer select-none bg-white p-3 border-4 transition-all duration-150 active:scale-95 ${
        selected
          ? "border-emerald-500 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
          : "border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:border-slate-700 hover:translate-y-[-2px]"
      }`}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Position Badge */}
      <div
        className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-pixel text-white border-2 border-slate-900"
        style={{ backgroundColor: accentColor }}
      >
        {player.position}
      </div>

      {/* Card Body */}
      <div className="mt-4 mb-3">
        <h3 className="font-pixel text-[12px] truncate text-slate-900 pr-10">
          {player.name}
        </h3>
      </div>

      {/* Stats List */}
      <div className="space-y-1 bg-slate-50 p-2 border-2 border-dashed border-slate-300">
        <PixelStatBar label="PAC" value={player.pace} max={100} color={accentColor} />
        <PixelStatBar label="SHO" value={player.shooting} max={100} color={accentColor} />
        <PixelStatBar label="PAS" value={player.passing} max={100} color={accentColor} />
        <PixelStatBar label="TAC" value={player.tackling} max={100} color={accentColor} />
      </div>

      {/* Selected Indicator */}
      {selected && (
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-2 border-slate-900 p-0.5 text-white">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
}
