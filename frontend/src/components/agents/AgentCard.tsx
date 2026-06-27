import type { AgentProfile } from "@/lib/contracts";

interface Props {
    agent: AgentProfile;
}

const STAT_MAX = 20;
const SEGMENTS = 5;

function SegmentedStatBar({ label, value, max = STAT_MAX }: { label: string; value: number; max?: number }) {
    const filled = Math.round((value / max) * SEGMENTS);

    return (
        <div className="flex items-center justify-between">
            <span className="uppercase text-lg font-body">{label}</span>
            <div className="flex">
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                    <div
                        key={i}
                        className={`stat-bar-segment ${i < filled ? "stat-bar-fill" : "bg-slate-200"}`}
                    />
                ))}
            </div>
        </div>
    );
}

const STYLE_LABELS: Record<string, { label: string; border: string; bg: string }> = {
    "Guardiola GPT": { label: "POSSESSION MASTER", border: "border-blue-600", bg: "bg-blue-600" },
    "MourinhOS": { label: "PARK THE BUS", border: "border-slate-600", bg: "bg-slate-600" },
    "Klopp Chain": { label: "GEGENPRESS", border: "border-red-600", bg: "bg-red-600" },
    "AncelottAI": { label: "THE CALCULATOR", border: "border-amber-500", bg: "bg-amber-500" },
    "Simeone Node": { label: "CHOLISMO", border: "border-red-800", bg: "bg-red-800" },
    "Bielsa Byte": { label: "EL LOCO", border: "border-sky-500", bg: "bg-sky-500" },
    "Conte Contract": { label: "THE DRIVER", border: "border-blue-900", bg: "bg-blue-900" },
    "Sir Alex Algo": { label: "THE BOSS", border: "border-red-700", bg: "bg-red-700" },
};

export function AgentCard({ agent }: Props) {
    const total = agent.attack + agent.defense + agent.discipline;
    const style = STYLE_LABELS[agent.name] || { label: "STRATEGIST", border: "border-[#13ec5b]", bg: "bg-[#13ec5b]" };

    const scoreBg = total >= 50 ? "bg-green-500" : total >= 40 ? "bg-amber-400" : "bg-slate-400";
    const scoreColor = total >= 40 && total < 50 ? "text-black" : "text-white";

    return (
        <div className={`bg-white p-6 border-2 border-[#cfe7d7] border-l-4 ${style.border} pixel-card-shadow flex flex-col gap-4 relative hover:border-[rgba(19,236,91,0.3)] transition-colors`}>
            {/* Header: avatar + score */}
            <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-[#f6f8f6] flex items-center justify-center border border-[#cfe7d7]">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>smart_toy</span>
                </div>
                <div className={`${scoreBg} ${scoreColor} rounded px-2 py-1 font-pixel text-[10px]`}>
                    {total}/60
                </div>
            </div>

            {/* Name + address + style tag */}
            <div>
                <h3 className="font-pixel text-[10px] text-slate-500 mb-1 uppercase tracking-widest">{agent.name}</h3>
                <p className="text-sm text-slate-900 font-bold mb-2">
                    {agent.address.slice(0, 6)}...{agent.address.slice(-4)}
                </p>
            </div>

            {/* Segmented stat bars */}
            <div className="space-y-3 mt-1">
                <SegmentedStatBar label="ATTACK" value={agent.attack} />
                <SegmentedStatBar label="DEFENSE" value={agent.defense} />
                <SegmentedStatBar label="DISCIPL." value={agent.discipline} />
            </div>

            {/* Strategy label at bottom */}
            {style && (
                <div className="pt-4 mt-2 border-t border-[#cfe7d7]">
                    <span className={`inline-block ${style.bg} text-white px-2 py-1 text-[10px] uppercase font-bold rounded`}>
                        {style.label}
                    </span>
                </div>
            )}
        </div>
    );
}
