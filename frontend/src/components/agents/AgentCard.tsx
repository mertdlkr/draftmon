import type { AgentProfile } from "@/lib/contracts";

interface Props {
    agent: AgentProfile;
}

const STAT_MAX = 20;

function StatBar({ label, value, max = STAT_MAX }: { label: string; value: number; max?: number }) {
    const pct = Math.min(100, (value / max) * 100);
    const color =
        pct > 80 ? "var(--color-pitch)" :
            pct > 55 ? "var(--color-monad)" :
                "var(--color-amber)";

    return (
        <div style={{ marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--color-muted)" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color }}>{value}/{max}</span>
            </div>
            <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

const PERSONA_EMOJIS: Record<string, string> = {
    "Guardiola GPT": "🎯",
    "MourinhOS": "😤",
    "Klopp Chain": "⚡",
    "AncelottAI": "✨",
    "Simeone Node": "🐂",
    "Bielsa Byte": "🌀",
    "Conte Contract": "📋",
    "Sir Alex Algo": "👑",
};

export function AgentCard({ agent }: Props) {
    const emoji = PERSONA_EMOJIS[agent.name] ?? "🤖";
    const total = agent.attack + agent.defense + agent.discipline;

    return (
        <div className="card card-hover" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                    style={{
                        width: 48, height: 48, borderRadius: 10,
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem",
                    }}
                >
                    {emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {agent.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-muted)" }}>
                        {agent.address.slice(0, 6)}…{agent.address.slice(-4)}
                    </div>
                </div>
                <span className="badge badge-monad" style={{ flexShrink: 0 }}>
                    {total}/60
                </span>
            </div>

            {/* Stats */}
            <div>
                <StatBar label="Attack" value={agent.attack} />
                <StatBar label="Defense" value={agent.defense} />
                <StatBar label="Discipline" value={agent.discipline} />
            </div>
        </div>
    );
}
