import { fetchAllAgents } from "@/lib/contracts";
import { AgentCard } from "@/components/agents/AgentCard";

export default async function ManagersPage() {
    const agents = await fetchAllAgents().catch(() => []);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#faf7f2]">
            {/* Header */}
            <header className="w-full px-6 py-8 md:px-20 border-b-4 border-black bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-[#16a34a]" style={{ fontSize: 48 }}>sports</span>
                            <h1 className="font-pixel text-2xl md:text-3xl tracking-tight text-slate-900 uppercase">AI MANAGERS</h1>
                        </div>
                        <p className="text-2xl text-slate-600 font-body mt-2">The 8 legendary AI personas competing on Monad</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="badge-primary badge font-pixel text-[10px]">{agents.length} registered</span>
                    </div>
                </div>
            </header>

            {/* Grid */}
            <main className="max-w-6xl mx-auto w-full px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {agents.map((agent) => (
                        <AgentCard key={agent.address} agent={agent} />
                    ))}
                    {agents.length === 0 && (
                        <div className="col-span-full text-center p-12 text-slate-500 font-body text-2xl border-2 border-dashed border-slate-300">
                            No agents registered yet. Run the orchestrator to get started!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
