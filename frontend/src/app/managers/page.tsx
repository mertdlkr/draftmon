import { fetchAllAgents } from "@/lib/contracts";
import type { AgentProfile } from "@/lib/contracts";
import { PageHeader } from "@/components/layout/PageHeader";
import { PixelStatBar } from "@/components/ui/PixelStatBar";
import { ManagerAvatar, getManagerColor } from "@/components/ui/ManagerAvatar";

function getTier(score: number) {
    if (score >= 57) return { label: "S", full: "S TIER", bg: "#fbbf24", color: "#0d1b12", shadow: "0 0 8px rgba(251,191,36,0.7), 3px 3px 0px rgba(0,0,0,0.3)" };
    if (score >= 54) return { label: "A", full: "A TIER", bg: "#94a3b8", color: "#0f172a", shadow: "3px 3px 0px rgba(0,0,0,0.3)" };
    if (score >= 50) return { label: "B", full: "B TIER", bg: "#f97316", color: "#fff", shadow: "3px 3px 0px rgba(0,0,0,0.3)" };
    return { label: "C", full: "C TIER", bg: "#64748b", color: "#fff", shadow: "3px 3px 0px rgba(0,0,0,0.3)" };
}

function ManagerCard({ agent }: { agent: AgentProfile }) {
    const color = getManagerColor(agent.name);
    const totalScore = agent.attack + agent.defense + agent.discipline;
    const tier = getTier(totalScore);
    const styleIcon = agent.attack > agent.defense ? "flash_on" : agent.defense > agent.attack ? "shield" : "balance";
    const styleLabel = agent.attack > agent.defense ? "ATTACKER" : agent.defense > agent.attack ? "DEFENDER" : "BALANCED";

    return (
        <div
            className="group relative flex flex-col bg-white border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:border-[#13ec5b] overflow-hidden"
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
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-[#13ec5b] transition-colors">{styleIcon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default async function ManagersPage() {
    const agents = await fetchAllAgents().catch(() => []);
    const strategies = ["ALL", "POSSESSION", "COUNTER", "GEGENPRESS", "CATENACCIO"];

    return (
        <div className="flex-grow">
            <PageHeader
                title="AI Managers"
                subtitle="Legendary 8-bit tacticians competing on-chain."
                icon="sports"
                count={`${agents.length} REGISTERED`}
            />

            <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
                {/* Controls row */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Filter pills */}
                    <div className="flex flex-wrap gap-2">
                        {strategies.map((s, i) => (
                            <button
                                key={s}
                                className={`px-4 py-1 font-pixel text-[10px] uppercase border-2 border-slate-900 transition-all cursor-pointer flex items-center gap-1 ${
                                    i === 0
                                        ? "bg-[#13ec5b] text-[#0d1b12] border-[#13ec5b] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                                        : "bg-white text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none"
                                }`}
                            >
                                {i === 0 && <span className="text-[8px]">▶</span>}
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Sort/Filter buttons */}
                    <div className="flex gap-2">
                        <button className="retro-btn group flex items-center gap-2 bg-white px-4 py-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(19,236,91,1)] hover:border-[#13ec5b] transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-slate-900 group-hover:text-[#13ec5b]">filter_list</span>
                            <span className="font-pixel text-[10px] text-slate-900">FILTER</span>
                        </button>
                        <button className="retro-btn group flex items-center gap-2 bg-white px-4 py-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(19,236,91,1)] hover:border-[#13ec5b] transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-slate-900 group-hover:text-[#13ec5b]">sort</span>
                            <span className="font-pixel text-[10px] text-slate-900">SORT BY SCORE</span>
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {agents.map((agent) => (
                        <ManagerCard key={agent.address} agent={agent} />
                    ))}
                    {agents.length === 0 && (
                        <div className="col-span-full text-center py-24 border-2 border-dashed border-[#13ec5b]/30">
                            <div className="font-pixel text-[#13ec5b] text-5xl mb-6 pixel-glow">???</div>
                            <div className="font-pixel text-xs text-slate-700 mb-4">NO AGENTS REGISTERED</div>
                            <div className="font-pixel text-[8px] text-slate-400 text-blink">▶ INSERT COIN TO CONTINUE ◀</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
