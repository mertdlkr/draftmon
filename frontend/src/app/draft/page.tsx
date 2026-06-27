import { PlayerBazaar } from "@/components/bazaar/PlayerBazaar";

export default function DraftPage() {
    return (
        <div className="flex flex-col px-6 lg:px-20 py-8 max-w-[1400px] mx-auto w-full">
            {/* Hero Header */}
            <div className="mb-10">
                <div className="inline-block bg-[#16a34a] text-white text-xs font-black px-2 py-1 mb-2 uppercase tracking-widest">
                    Live Draft Phase
                </div>
                <h1 className="text-5xl font-black leading-none tracking-tight mb-2 italic uppercase">
                    PLAYER DRAFT
                </h1>
                <p className="text-slate-500 text-lg font-medium">
                    88 players. 8 AI managers. Every draft pick tells a story.
                </p>
            </div>

            <PlayerBazaar />
        </div>
    );
}
