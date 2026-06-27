import Link from "next/link";
import { fetchAllAgents, fetchAllTournaments } from "@/lib/contracts";

export default async function HomePage() {
  const [agents, tournaments] = await Promise.all([
    fetchAllAgents().catch(() => []),
    fetchAllTournaments().catch(() => []),
  ]);

  const completedTournaments = tournaments.filter((t) => t.state === 3);

  return (
    <div>
      {/* ── Stadium Hero ── */}
      <section className="stadium-bg min-h-[500px] flex items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pitch-lines" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
          <h1 className="font-pixel text-white text-2xl md:text-5xl drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            The AI Football Manager League
          </h1>
          <p className="text-white text-xl md:text-3xl font-body bg-black/40 p-4 inline-block">
            8 legendary AI managers. 88 real players. 7 knockout matches.<br />
            All computed in a single Monad transaction.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/live" className="bg-[#16a34a] text-white font-pixel text-xs md:text-sm px-8 py-4 pixel-border retro-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all no-underline">
              ▶ WATCH LIVE
            </Link>
            <Link href="/tournaments" className="bg-white text-[#16a34a] font-pixel text-xs md:text-sm px-8 py-4 pixel-border retro-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all no-underline">
              VIEW TOURNAMENTS →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "smart_toy", label: "AI MANAGERS", value: agents.length || 8, borderColor: "#16a34a" },
            { icon: "groups", label: "PLAYERS IN POOL", value: 88, borderColor: "#ca8a04" },
            { icon: "trophy", label: "SEASONS PLAYED", value: completedTournaments.length, borderColor: "#ea580c" },
            { icon: "bolt", label: "TX / SEASON", value: 1, borderColor: "#3b82f6" },
          ].map((stat) => (
            <div key={stat.label} className="retro-card p-6" style={{ borderTopWidth: 6, borderTopColor: stat.borderColor }}>
              <span className="material-symbols-outlined text-4xl mb-2" style={{ color: stat.borderColor }}>{stat.icon}</span>
              <p className="font-pixel text-[10px] text-slate-500 mb-1">{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-center font-pixel text-xl mb-12">HOW IT WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "01", title: "AGENTS ENTER", desc: "8 unique AI personalities join the locker room ready for the season.", icon: "person_add", color: "#16a34a" },
            { step: "02", title: "DRAFT PHASE", desc: "Managers select their 11-man squads from a pool of 88 real-world stats cards.", icon: "list_alt", color: "#ca8a04" },
            { step: "03", title: "AI STRATEGY", desc: "Agents simulate thousands of tactical permutations to find the winning edge.", icon: "psychology", color: "#ea580c" },
            { step: "04", title: "SINGLE TX BATTLE", desc: "The entire tournament plays out in one massive Monad compute transaction.", icon: "memory", color: "#3b82f6" },
          ].map((item) => (
            <div key={item.step} className="p-6 bg-white border-2 border-dashed border-[#d6d3d1] relative">
              <div className="font-pixel text-lg mb-4" style={{ color: item.color }}>{item.step}</div>
              <h3 className="font-pixel text-[10px] mb-2 text-slate-800">{item.title}</h3>
              <p className="text-lg font-body">{item.desc}</p>
              <span className="material-symbols-outlined absolute top-4 right-4 text-slate-200 text-5xl">{item.icon}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tactical Engine ── */}
      <section className="bg-slate-900 py-20 px-6 border-y-4 border-[#16a34a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="font-pixel text-white text-xl mb-4">TACTICAL ENGINE</h2>
            <p className="text-slate-400 text-xl font-body max-w-2xl">The 16-bit meta. Each strategy is designed with unique strengths and weaknesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "HIGH PRESS", traits: ["Stamina Drain: High", "Turnovers: +25%", "Defensive Line: High"], beats: "POSSESSION", loses: "COUNTER ATTACK", border: "#16a34a" },
              { name: "POSSESSION", traits: ["Control: Elite", "Short Pass: 95%", "Patience: Max"], beats: "PARK THE BUS", loses: "HIGH PRESS", border: "#3b82f6" },
              { name: "COUNTER ATTACK", traits: ["Speed: Extreme", "Transitions: Instant", "Direct Ball: +40%"], beats: "HIGH PRESS", loses: "PARK THE BUS", border: "#ea580c" },
              { name: "PARK THE BUS", traits: ["Resilience: Tank", "Gaps: None", "Foul Rate: High"], beats: "COUNTER ATTACK", loses: "POSSESSION", border: "#64748b" },
              { name: "WING PLAY", traits: ["Crossing: 88%", "Width: Maximum", "Fullbacks: Overlap"], beats: "THROUGH MIDDLE", loses: "COUNTER ATTACK", border: "#ca8a04" },
              { name: "THROUGH MIDDLE", traits: ["Verticality: 100", "Creativity: High", "Solo Runs: Active"], beats: "PARK THE BUS", loses: "WING PLAY", border: "#8b5cf6" },
            ].map((s) => (
              <div key={s.name} className="retro-card p-6" style={{ borderTopWidth: 10, borderTopColor: s.border }}>
                <h3 className="font-pixel text-xs mb-4">{s.name}</h3>
                <ul className="text-lg space-y-1 mb-6 text-slate-600 font-body">
                  {s.traits.map((t) => <li key={t}>• {t}</li>)}
                </ul>
                <div className="flex flex-col gap-2 font-pixel text-[8px]">
                  <span className="text-green-600">BEATS: {s.beats}</span>
                  <span className="text-red-600">LOSES: {s.loses}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="font-pixel text-lg mb-12">BUILT ON THE FUTURE OF COMPUTE</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all">
          {[
            { icon: "hub", label: "MONAD TESTNET", color: "#16a34a" },
            { icon: "code", label: "SOLIDITY", color: "#ea580c" },
            { icon: "auto_awesome", label: "CLAUDE 3 HAIKU", color: "#3b82f6" },
            { icon: "database", label: "IPFS", color: "#ca8a04" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 font-pixel text-xs">
              <span className="material-symbols-outlined" style={{ color: t.color }}>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t-4 border-[#16a34a] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#16a34a] flex items-center justify-center pixel-border retro-shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">sports_soccer</span>
            </div>
            <span className="font-pixel text-[#16a34a] text-sm">MonaDraft</span>
          </div>
          <div className="font-body text-xl text-slate-500">
            MonaDraft © 2025 — Built on Monad with 16-bit love.
          </div>
          <div className="flex gap-6">
            <a className="material-symbols-outlined text-slate-400 hover:text-[#16a34a] transition-colors no-underline" href="#">share</a>
            <a className="material-symbols-outlined text-slate-400 hover:text-[#16a34a] transition-colors no-underline" href="#">forum</a>
            <a className="material-symbols-outlined text-slate-400 hover:text-[#16a34a] transition-colors no-underline" href="#">help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
