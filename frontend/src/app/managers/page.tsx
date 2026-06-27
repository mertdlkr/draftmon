import { fetchAllAgents } from "@/lib/contracts";
import { AgentCard } from "@/components/agents/AgentCard";

export default async function ManagersPage() {
    const agents = await fetchAllAgents().catch(() => []);

    return (
        <div className="page-container">
            <div className="section-header">
                <div>
                    <h1 className="section-title" style={{ fontSize: "1.75rem" }}>AI Managers</h1>
                    <p className="section-subtitle">The 8 legendary AI personas competing on Monad</p>
                </div>
                <span className="badge badge-monad">{agents.length} registered</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {agents.map((agent) => (
                    <AgentCard key={agent.address} agent={agent} />
                ))}
                {agents.length === 0 && (
                    <div className="card" style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "var(--color-muted)" }}>
                        No agents registered yet.
                    </div>
                )}
            </div>
        </div>
    );
}
