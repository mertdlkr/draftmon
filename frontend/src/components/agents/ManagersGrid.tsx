"use client";

import { useState, useMemo } from "react";
import type { AgentProfile } from "@/lib/contracts";
import { PixelStatBar } from "@/components/ui/PixelStatBar";
import { ManagerAvatar, getManagerColor } from "@/components/ui/ManagerAvatar";
import { PixelSelect } from "@/components/ui/PixelSelect";

// ─── Tier ────────────────────────────────────────────────────────────────────

function getTier(score: number) {
    if (score >= 57) return { label: "S", bg: "#fbbf24", color: "var(--color-dark-green)", shadow: "0 0 8px rgba(251,191,36,0.7), 3px 3px 0px rgba(0,0,0,0.3)" };
    if (score >= 54) return { label: "A", bg: "#94a3b8", color: "#0f172a", shadow: "3px 3px 0px rgba(0,0,0,0.3)" };
    if (score >= 50) return { label: "B", bg: "#f97316", color: "#fff",    shadow: "3px 3px 0px rgba(0,0,0,0.3)" };
    return             { label: "C", bg: "#64748b", color: "#fff",    shadow: "3px 3px 0px rgba(0,0,0,0.3)" };
}

// ─── Manager Card ─────────────────────────────────────────────────────────────

function ManagerCard({ agent }: { agent: AgentProfile }) {
    const color = getManagerColor(agent.name);
    const totalScore = agent.attack + agent.defense + agent.discipline;
    const tier = getTier(totalScore);
    const styleIcon = agent.attack > agent.defense ? "flash_on" : agent.defense > agent.attack ? "shield" : "balance";
    const styleLabel = agent.attack > agent.defense ? "ATTACKER" : agent.defense > agent.attack ? "DEFENDER" : "BALANCED";

    return (
        <div
            className="group relative flex flex-col bg-white border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:border-primary overflow-hidden"
            style={{ borderColor: color }}
        >
            <div className="h-[5px] w-full" style={{ background: color }} />
            <div className="p-4 flex flex-col flex-grow relative">
                {/* Avatar + Tier Badge */}
                <div className="flex justify-between items-start mb-4">
                    <ManagerAvatar name={agent.name} size={64} />
                    <div
                        className="flex flex-col items-center justify-center w-14 h-14 border-2 border-slate-900 font-pixel"
                        style={{ background: tier.bg, color: tier.color, boxShadow: tier.shadow }}
                    >
                        <span className="text-2xl leading-none">{tier.label}</span>
                        <span className="text-[6px] mt-0.5 opacity-80">{totalScore}/60</span>
                    </div>
                </div>

                {/* Name */}
                <h3 className="font-pixel text-xs text-slate-900 mb-4 truncate leading-tight uppercase">{agent.name}</h3>

                {/* Stat Bars */}
                <div className="flex flex-col gap-2 mb-4 w-full">
                    <PixelStatBar label="ATT" value={agent.attack} color={color} />
                    <PixelStatBar label="DEF" value={agent.defense} color={color} />
                    <PixelStatBar label="DIS" value={agent.discipline} color={color} />
                </div>

                {/* Style */}
                <div className="mt-auto">
                    <hr className="mb-3" style={{ height: "2px", backgroundImage: "linear-gradient(90deg, #cbd5e1 50%, transparent 50%)", backgroundSize: "8px 100%", border: "none" }} />
                    <div className="flex items-center justify-between">
                        <span className="font-code text-sm text-slate-600 uppercase tracking-widest">{styleLabel}</span>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">{styleIcon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Filter pills ─────────────────────────────────────────────────────────────

const STRATEGIES = ["ALL", "POSSESSION", "COUNTER", "GEGENPRESS", "CATENACCIO"] as const;
type Strategy = typeof STRATEGIES[number];

const SORT_OPTIONS = [
    { value: "score",      label: "Total Score"  },
    { value: "attack",     label: "Attack"       },
    { value: "defense",    label: "Defense"      },
    { value: "discipline", label: "Discipline"   },
    { value: "name",       label: "Name"         },
];

type SortKey = "score" | "attack" | "defense" | "discipline" | "name";

// ─── Main Grid ────────────────────────────────────────────────────────────────

export function ManagersGrid({ agents }: { agents: AgentProfile[] }) {
    const [activeStrategy, setActiveStrategy] = useState<Strategy>("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("score");

    const sorted = useMemo(() => {
        const list = activeStrategy === "ALL" ? agents : agents; // strategy filter placeholder
        return [...list].sort((a, b) => {
            if (sortKey === "name") return a.name.localeCompare(b.name);
            if (sortKey === "score") return (b.attack + b.defense + b.discipline) - (a.attack + a.defense + a.discipline);
            return (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
        });
    }, [agents, activeStrategy, sortKey]);

    return (
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
            {/* Controls row */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                    {STRATEGIES.map((s) => {
                        const isActive = s === activeStrategy;
                        return (
                            <button
                                key={s}
                                onClick={() => setActiveStrategy(s)}
                                className={`px-4 py-1 font-pixel text-[10px] uppercase border-2 border-slate-900 transition-colors cursor-pointer flex items-center gap-1 ${
                                    isActive
                                        ? "bg-primary text-dark-green border-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                                        : "bg-white text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:bg-slate-50"
                                }`}
                            >
                                {isActive && <span className="text-[8px]">▶</span>}
                                {s}
                            </button>
                        );
                    })}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3">
                    <span className="font-pixel text-[9px] text-slate-500 uppercase tracking-widest shrink-0">Sort by:</span>
                    <PixelSelect
                        value={sortKey}
                        onChange={(v) => setSortKey(v as SortKey)}
                        options={SORT_OPTIONS}
                        className="min-w-[160px]"
                    />
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sorted.map((agent) => (
                    <ManagerCard key={agent.address} agent={agent} />
                ))}
                {sorted.length === 0 && (
                    <div className="col-span-full text-center py-24 border-2 border-dashed border-primary/30">
                        <div className="font-pixel text-primary text-5xl mb-6 pixel-glow">???</div>
                        <div className="font-pixel text-xs text-slate-700 mb-4">NO AGENTS REGISTERED</div>
                        <div className="font-pixel text-[8px] text-slate-400 text-blink">▶ INSERT COIN TO CONTINUE ◀</div>
                    </div>
                )}
            </div>
        </div>
    );
}
