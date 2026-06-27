"use client";

import type { RoomStatus } from "@/lib/contracts/types";

interface Props {
  status: RoomStatus;
}

export function RoomStatusBadge({ status }: Props) {
  let label = "UNKNOWN";
  let colorClass = "bg-slate-200 text-slate-700 border-slate-400";

  switch (status) {
    case "open":
      label = "OPEN";
      colorClass = "bg-emerald-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
      break;
    case "drafting":
      label = "DRAFTING";
      colorClass = "bg-amber-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse";
      break;
    case "betting":
      label = "BETTING";
      colorClass = "bg-indigo-400 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
      break;
    case "simulating":
      label = "SIMULATING";
      colorClass = "bg-rose-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce";
      break;
    case "finished":
      label = "FINISHED";
      colorClass = "bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]";
      break;
  }

  return (
    <span
      className={`font-pixel text-[8px] sm:text-[10px] tracking-wider px-2 py-1 border-2 font-bold inline-block text-center ${colorClass}`}
    >
      {label}
    </span>
  );
}
