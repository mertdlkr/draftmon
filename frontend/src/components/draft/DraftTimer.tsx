"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  startedAt: string | null;
  durationMs: number;
  onExpire: () => void;
}

export function DraftTimer({ startedAt, durationMs, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(Math.round(durationMs / 1000));
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    
    let intervalId: any = null;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - start;
      const remaining = Math.max(0, Math.round((durationMs - elapsed) / 1000));
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (intervalId) clearInterval(intervalId);
        onExpireRef.current();
      }
    };

    updateTimer(); // initial call
    const now = Date.now();
    const elapsed = now - start;
    if (durationMs - elapsed > 0) {
      intervalId = setInterval(updateTimer, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [startedAt, durationMs]);

  const isLowTime = timeLeft <= 10;
  const isMediumTime = timeLeft <= 30 && timeLeft > 10;

  let timerColor = "text-emerald-500 border-emerald-500 shadow-emerald-500/20";
  if (isLowTime) {
    timerColor = "text-rose-500 border-rose-500 shadow-rose-500/20 animate-pulse";
  } else if (isMediumTime) {
    timerColor = "text-amber-500 border-amber-500 shadow-amber-500/20";
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 border-4 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${timerColor}`}>
      <span className="material-symbols-outlined text-[20px] font-bold">schedule</span>
      <span className="font-pixel text-[14px] tracking-wider w-8 text-center">
        {timeLeft}s
      </span>
    </div>
  );
}
