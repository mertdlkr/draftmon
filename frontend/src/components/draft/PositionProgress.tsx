"use client";

import type { PositionGroup } from "@/lib/contracts/types";
import { DRAFT_PHASE_ORDER } from "@/constants";

interface Props {
  currentPhase: PositionGroup;
}

export function PositionProgress({ currentPhase }: Props) {
  return (
    <div className="flex items-center gap-2 bg-white p-2.5 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {DRAFT_PHASE_ORDER.map((phase, index) => {
        const isActive = phase === currentPhase;
        const isCompleted = DRAFT_PHASE_ORDER.indexOf(currentPhase) > index;

        let statusClass = "bg-slate-100 text-slate-400 border-slate-300";
        if (isActive) {
          statusClass = "bg-amber-400 text-slate-900 border-slate-900 scale-105 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
        } else if (isCompleted) {
          statusClass = "bg-emerald-400 text-slate-900 border-slate-900";
        }

        return (
          <div key={phase} className="flex items-center">
            <div
              className={`font-pixel text-[10px] px-3 py-1.5 border-2 transition-all ${statusClass}`}
            >
              {phase}
            </div>
            {index < DRAFT_PHASE_ORDER.length - 1 && (
              <div className="mx-1.5 text-slate-400 font-bold select-none">▶</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
