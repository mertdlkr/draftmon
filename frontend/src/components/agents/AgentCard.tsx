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

const STYLE_LABELS: Record<string, { label: string; bg: string }> = {
    "Guardiola GPT": { label: "POSSESSION MASTER", bg: "bg-blue-600" },
    "MourinhOS": { label: "PARK THE BUS", bg: "bg-slate-600" },
    "Klopp Chain": { label: "GEGENPRESS", bg: "bg-red-600" },
    "AncelottAI": { label: "THE CALCULATOR", bg: "bg-amber-500" },
    "Simeone Node": { label: "CHOLISMO", bg: "bg-red-800" },
    "Bielsa Byte": { label: "EL LOCO", bg: "bg-sky-500" },
    "Conte Contract": { label: "THE DRIVER", bg: "bg-blue-900" },
    "Sir Alex Algo": { label: "THE BOSS", bg: "bg-red-700" },
};

export function AgentCard({ agent }: Props) {
    const total = agent.attack + agent.defense + agent.discipline;
    const style = STYLE_LABELS[agent.name];

    const scoreBg = total >= 50 ? "bg-green-500" : total >= 40 ? "bg-amber-400" : "bg-slate-400";
    const scoreColor = total >= 40 && total < 50 ? "text-black" : "text-white";

    return (
        <div className="bg-white p-6 border-4 border-black pixel-card-shadow flex flex-col gap-4">
            {/* Header: avatar + score */}
            <div className="flex justify-between items-start">
                <div className="w-24 h-24 border-4 border-black bg-slate-100 flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-[#16a34a]" style={{ fontSize: 48 }}>smart_toy</span>
                </div>
                <div className={`${scoreBg} ${scoreColor} border-2 border-black px-2 py-1 font-pixel text-[10px]`}>
                    {total}/60
                </div>
            </div>

            {/* Name + address + style tag */}
            <div>
                <h3 className="font-pixel text-sm mb-1 uppercase">{agent.name}</h3>
                <p className="text-lg text-slate-500 font-mono">
                    {agent.address.slice(0, 4)}...{agent.address.slice(-4)}
                </p>
                {style && (
                    <div className={`mt-2 inline-block ${style.bg} text-white px-2 py-0.5 text-sm uppercase font-body`}>
                        {style.label}
                    </div>
                )}
            </div>

            {/* Segmented stat bars */}
            <div className="space-y-3 mt-2">
                <SegmentedStatBar label="ATTACK" value={agent.attack} />
                <SegmentedStatBar label="DEFENSE" value={agent.defense} />
                <SegmentedStatBar label="DISCIPL." value={agent.discipline} />
            </div>
        </div>
    );
}
