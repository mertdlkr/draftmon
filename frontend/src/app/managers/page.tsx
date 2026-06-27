import { fetchAllAgents } from "@/lib/contracts";
import type { AgentProfile } from "@/lib/contracts";

// Color palette for agent cards - cycles through these
const CARD_COLORS = [
    { border: "border-blue-500", hoverBorder: "hover:border-blue-600", bar: "text-blue-500", topBar: "bg-blue-500", hoverIcon: "group-hover:text-blue-500" },
    { border: "border-red-600", hoverBorder: "hover:border-red-700", bar: "text-red-600", topBar: "bg-red-600", hoverIcon: "group-hover:text-red-600" },
    { border: "border-yellow-500", hoverBorder: "hover:border-yellow-600", bar: "text-yellow-500", topBar: "bg-yellow-500", hoverIcon: "group-hover:text-yellow-500" },
    { border: "border-purple-600", hoverBorder: "hover:border-purple-700", bar: "text-purple-600", topBar: "bg-purple-600", hoverIcon: "group-hover:text-purple-600" },
    { border: "border-red-700", hoverBorder: "hover:border-red-800", bar: "text-red-700", topBar: "bg-red-700", hoverIcon: "group-hover:text-red-700" },
    { border: "border-red-400", hoverBorder: "hover:border-red-500", bar: "text-red-400", topBar: "bg-red-400", hoverIcon: "group-hover:text-red-400" },
    { border: "border-slate-800", hoverBorder: "hover:border-slate-900", bar: "text-slate-800", topBar: "bg-slate-800", hoverIcon: "group-hover:text-slate-800" },
    { border: "border-sky-500", hoverBorder: "hover:border-sky-600", bar: "text-sky-500", topBar: "bg-sky-500", hoverIcon: "group-hover:text-sky-500" },
];

function getTier(score: number): { label: string; bg: string } {
    if (score >= 57) return { label: "S TIER", bg: "bg-yellow-400" };
    if (score >= 54) return { label: "A TIER", bg: "bg-slate-200" };
    if (score >= 50) return { label: "B TIER", bg: "bg-slate-200" };
    return { label: "C TIER", bg: "bg-slate-200" };
}

function ManagerCard({ agent, colorIndex }: { agent: AgentProfile; colorIndex: number }) {
    const colors = CARD_COLORS[colorIndex % CARD_COLORS.length];
    const totalScore = agent.attack + agent.defense + agent.discipline;
    const tier = getTier(totalScore);

    return (
        <div className={`group relative flex flex-col bg-white border-2 ${colors.border} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] ${colors.hoverBorder} overflow-hidden`}>
            {/* Top accent bar */}
            <div className={`h-[5px] w-full ${colors.topBar}`} />
            <div className="p-4 flex flex-col flex-grow relative">
                {/* Avatar + Score */}
                <div className="flex justify-between items-start mb-4">
                    <div className="relative h-16 w-16 bg-[#faf7f2] border-2 border-slate-900 p-1 shrink-0" style={{ imageRendering: 'pixelated' }}>
                        <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-slate-400">smart_toy</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className={`${tier.bg} border-2 border-slate-900 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transform rotate-2`}>
                            <span className="font-pixel text-[10px] font-bold text-slate-900">{totalScore}/60</span>
                        </div>
                        <span className="font-code text-sm text-slate-500 mt-1">{tier.label}</span>
                    </div>
                </div>
                {/* Name */}
                <h3 className="font-pixel text-xs text-slate-900 mb-4 truncate leading-tight uppercase">{agent.name}</h3>
                {/* Stat Bars */}
                <div className="flex flex-col gap-2 mb-4 w-full">
                    <StatBar label="ATT" value={agent.attack} max={20} colorClass={colors.bar} />
                    <StatBar label="DEF" value={agent.defense} max={20} colorClass={colors.bar} />
                    <StatBar label="DIS" value={agent.discipline} max={20} colorClass={colors.bar} />
                </div>
                {/* Divider + Strategy */}
                <div className="mt-auto">
                    <hr className="mb-3" style={{ height: '2px', backgroundImage: 'linear-gradient(90deg, #cbd5e1 50%, transparent 50%)', backgroundSize: '8px 100%', border: 'none' }} />
                    <div className="flex items-center justify-between">
                        <span className="font-code text-sm text-slate-600 uppercase tracking-widest">
                            {agent.attack > agent.defense ? "ATTACKER" : agent.defense > agent.attack ? "DEFENDER" : "BALANCED"}
                        </span>
                        <span className={`material-symbols-outlined text-slate-400 ${colors.hoverIcon} transition-colors`}>
                            {agent.attack > agent.defense ? "flash_on" : agent.defense > agent.attack ? "shield" : "balance"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBar({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
        <div className="flex items-center justify-between text-[10px] font-pixel gap-2">
            <span className="text-slate-500 w-8">{label}</span>
            <div className="flex-1 relative bg-gray-200 border-2 border-slate-900" style={{ height: '12px' }}>
                <div
                    className={colorClass}
                    style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundImage: 'repeating-linear-gradient(90deg, currentColor, currentColor 4px, transparent 4px, transparent 6px)',
                    }}
                />
            </div>
        </div>
    );
}

export default async function ManagersPage() {
    const agents = await fetchAllAgents().catch(() => []);
    const strategies = ["ALL", "POSSESSION", "COUNTER", "GEGENPRESS", "CATENACCIO"];

    return (
        <div className="flex-grow px-4 py-8 md:px-8 lg:py-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-dashed border-slate-300 pb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#16a249] text-4xl animate-pulse">sports</span>
                            <h1 className="font-pixel text-2xl md:text-4xl text-slate-900 leading-tight">AI MANAGERS</h1>
                        </div>
                        <p className="font-code text-lg text-slate-600 max-w-lg">Select your legendary 8-bit tactician to lead your squad to digital glory.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button className="group flex items-center gap-2 bg-white px-4 py-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(22,162,73,1)] hover:border-[#16a249] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer">
                            <span className="material-symbols-outlined text-slate-900 group-hover:text-[#16a249]">filter_list</span>
                            <span className="font-pixel text-[10px] text-slate-900">FILTER</span>
                        </button>
                        <button className="group flex items-center gap-2 bg-white px-4 py-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(22,162,73,1)] hover:border-[#16a249] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer">
                            <span className="material-symbols-outlined text-slate-900 group-hover:text-[#16a249]">sort</span>
                            <span className="font-pixel text-[10px] text-slate-900">SORT BY SCORE</span>
                        </button>
                    </div>
                </div>

                {/* Filter pills */}
                <div className="mb-8 flex flex-wrap gap-3">
                    {strategies.map((s, i) => (
                        <button
                            key={s}
                            className={`px-4 py-1 font-pixel text-[10px] uppercase border-2 border-slate-900 transition-all cursor-pointer ${i === 0
                                ? "bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(100,100,100,0.5)] active:translate-y-0.5 active:shadow-none"
                                : "bg-white text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {agents.map((agent, i) => (
                        <ManagerCard key={agent.address} agent={agent} colorIndex={i} />
                    ))}
                    {agents.length === 0 && (
                        <div className="col-span-full text-center p-12 text-slate-500 font-code text-xl border-2 border-dashed border-slate-300 rounded">
                            No agents registered yet. Run the orchestrator to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
