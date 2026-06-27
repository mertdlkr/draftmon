import Link from "next/link";
import { fetchAllAgents, fetchAllTournaments } from "@/lib/contracts";

export default async function HomePage() {
  // Light data for hero stats
  const [agents, tournaments] = await Promise.all([
    fetchAllAgents().catch(() => []),
    fetchAllTournaments().catch(() => []),
  ]);

  const completedTournaments = tournaments.filter((t) => t.state === 3);

  return (
    <div className="page-container">
      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "4rem 0 3rem" }}>
        <div className="badge badge-monad" style={{ marginBottom: "1.5rem" }}>
          Built for Monad Hackathon
        </div>

        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", marginBottom: "1.25rem", color: "var(--color-text)" }}>
          The AI Football<br />
          <span className="text-monad">Manager League</span>
        </h1>

        <p style={{ fontSize: "1.15rem", color: "var(--color-muted)", maxWidth: "540px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          8 legendary AI managers. 88 real players. 7 knockout matches.<br />
          All computed in a <strong style={{ color: "var(--color-pitch)" }}>single Monad transaction</strong>.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/live" className="btn btn-primary">
            <span className="pulse-dot" /> Watch Live
          </Link>
          <Link href="/tournaments" className="btn btn-outline">
            View Tournaments →
          </Link>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", margin: "1.5rem 0 3rem" }}>
        {[
          { value: agents.length, label: "AI Managers", unit: "" },
          { value: "88", label: "Players in Pool", unit: "" },
          { value: completedTournaments.length, label: "Seasons Played", unit: "" },
          { value: "1", label: "Transaction / Season", unit: "" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-monad)", fontFamily: "var(--font-mono)" }}>
              {stat.value}{stat.unit}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── How It Works ── */}
      <section style={{ marginBottom: "3rem" }}>
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { step: "01", title: "8 Agents Enter", desc: "Legendary AI managers pay the entry fee and join the tournament lobby." },
            { step: "02", title: "Draft Phase", desc: "Admin assigns randomised squads of 11 real players to each manager." },
            { step: "03", title: "AI Strategy", desc: "Claude 3 Haiku analyses each squad and picks a tactical strategy with a press conference quote." },
            { step: "04", title: "Single TX Battle", desc: "The full knockout bracket — QF, SF, Final — resolves in one Monad transaction." },
          ].map((item) => (
            <div key={item.step} className="card card-hover">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-monad)", marginBottom: "0.75rem" }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{item.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ marginBottom: "3rem" }}>
        <div className="section-header">
          <h2 className="section-title">Tech Stack</h2>
        </div>
        <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {[
            "Monad Testnet", "Solidity + Foundry", "ethers.js v6",
            "AWS Bedrock", "Claude 3 Haiku", "Next.js 16",
            "TypeScript", "Server-Sent Events",
          ].map((t) => (
            <span key={t} className="badge badge-muted">{t}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
