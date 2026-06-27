import type { AgentProfile } from "@/lib/contracts";
import { PixelStatBar } from "@/components/ui/PixelStatBar";
import { ManagerAvatar, getManagerColor } from "@/components/ui/ManagerAvatar";

interface Props {
    agent: AgentProfile;
}

const ATTACK_LABELS = ["FULL ATTACK", "ATTACK MINDED", "THE FINISHER", "SHARP SHOOTER"];
const DEFENSE_LABELS = ["DEFENSIVE WALL", "IRON FORTRESS", "PARK THE BUS", "THE SWEEPER"];
const DISCIPLINE_LABELS = ["IRON DISCIPLINE", "THE ORGANIZER", "TACTICAL GENIUS", "THE CONTROLLER"];
const BALANCED_LABELS = ["ALL-ROUNDER", "THE TACTICIAN", "TOTAL FOOTBALL", "THE CALCULATOR"];

function getStyleLabel(name: string, attack: number, defense: number, discipline: number): string {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const max = Math.max(attack, defense, discipline);
    if (max === discipline && discipline > attack + 1 && discipline > defense + 1)
        return DISCIPLINE_LABELS[h % DISCIPLINE_LABELS.length];
    if (attack - defense >= 3)
        return ATTACK_LABELS[h % ATTACK_LABELS.length];
    if (defense - attack >= 3)
        return DEFENSE_LABELS[h % DEFENSE_LABELS.length];
    return BALANCED_LABELS[h % BALANCED_LABELS.length];
}

export function AgentCard({ agent }: Props) {
    const total = agent.attack + agent.defense + agent.discipline;
    const scoreBg = total >= 50 ? "bg-green-500" : total >= 40 ? "bg-amber-400" : "bg-slate-400";
    const scoreColor = total >= 40 && total < 50 ? "text-black" : "text-white";
    const color = getManagerColor(agent.name);
    const label = getStyleLabel(agent.name, agent.attack, agent.defense, agent.discipline);

    return (
        <div
            className="bg-white p-6 border-2 border-l-4 pixel-card-shadow flex flex-col gap-4 relative transition-colors hover:border-[rgba(19,236,91,0.3)]"
            style={{ borderColor: "#cfe7d7", borderLeftColor: color }}
        >
            {/* Header: avatar + score */}
            <div className="flex justify-between items-start">
                <ManagerAvatar name={agent.name} size={64} />
                <div className={`${scoreBg} ${scoreColor} rounded px-2 py-1 font-pixel text-[10px] pixel-glow`}>
                    {total}/60
                </div>
            </div>

            {/* Name + address */}
            <div>
                <h3 className="font-pixel text-[10px] text-slate-500 mb-1 uppercase tracking-widest">{agent.name}</h3>
                <p className="text-sm text-slate-900 font-bold mb-2">
                    {agent.address.slice(0, 6)}...{agent.address.slice(-4)}
                </p>
            </div>

            {/* Pixel stat bars */}
            <div className="space-y-2 mt-1">
                <PixelStatBar label="ATT" value={agent.attack} color={color} />
                <PixelStatBar label="DEF" value={agent.defense} color={color} />
                <PixelStatBar label="DIS" value={agent.discipline} color={color} />
            </div>

            {/* Style label */}
            <div className="pt-4 mt-2 border-t border-[#cfe7d7]">
                <span className="inline-block text-white px-2 py-1 text-[10px] uppercase font-bold rounded font-pixel" style={{ background: color }}>
                    {label}
                </span>
            </div>
        </div>
    );
}
