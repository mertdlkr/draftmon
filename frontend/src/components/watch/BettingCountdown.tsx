"use client";

import { useEffect, useState } from "react";

interface Props {
  startedAt: string | null;
  durationMs: number;
  onExpire: () => void;
}

export function BettingCountdown({ startedAt, durationMs, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(Math.round(durationMs / 1000));

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - start;
      const remaining = Math.max(0, Math.round((durationMs - elapsed) / 1000));
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    };

    updateTimer(); // initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationMs, onExpire]);

  const isLowTime = timeLeft <= 10;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xs mx-auto">
      <span className="font-pixel text-[10px] text-slate-500 mb-1">
        BETTING WINDOW CLOSING IN
      </span>
      <div className={`font-pixel text-[24px] font-bold ${isLowTime ? "text-rose-500 animate-pulse" : "text-slate-900"}`}>
        {timeLeft}s
      </div>
    </div>
  );
}
