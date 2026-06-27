import { PlayerBazaar } from "@/components/bazaar/PlayerBazaar";

export default function BazaarPage() {
    return (
        <div className="page-container">
            <div className="section-header">
                <div>
                    <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                        🏟️ Player Draft
                    </h1>
                    <p className="section-subtitle">
                        88 players. 8 AI managers. Every draft pick tells a story.
                    </p>
                </div>
                <span className="badge badge-monad">MonaDraft</span>
            </div>

            <PlayerBazaar />
        </div>
    );
}
