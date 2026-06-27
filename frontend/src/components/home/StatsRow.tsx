"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({ value }: { value: string | number }) {
  const str = String(value);
  const match = str.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1]) : null;
  const suffix = match ? match[2] : "";

  const [count, setCount] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered || target === null) return;
    const duration = 1400;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [triggered, target]);

  return (
    <div ref={ref} className="font-pixel text-xl md:text-2xl text-[#13ec5b] mb-1 pixel-glow">
      {target !== null ? `${count}${suffix}` : value}
    </div>
  );
}

interface Stat {
  label: string;
  value: string | number;
}

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="retro-card bg-white p-4 text-center hover:border-slate-400 transition-colors"
          >
            <CountUp value={stat.value} />
            <div className="text-[10px] md:text-xs font-code text-slate-500 font-bold uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
