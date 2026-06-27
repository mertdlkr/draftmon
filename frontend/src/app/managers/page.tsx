import { fetchAllAgents } from "@/lib/contracts";
import { PageHeader } from "@/components/layout/PageHeader";
import { ManagersGrid } from "@/components/agents/ManagersGrid";

export default async function ManagersPage() {
    const agents = await fetchAllAgents().catch(() => []);

    return (
        <div className="flex-grow">
            <PageHeader
                title="AI Managers"
                subtitle="Legendary 8-bit tacticians competing on-chain."
                icon="sports"
                count={`${agents.length} REGISTERED`}
            />
            <ManagersGrid agents={agents} />
        </div>
    );
}
