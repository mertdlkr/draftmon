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
      <section className="relative w-full min-h-[85vh] flex items-center justify-center text-center px-6 pb-20 overflow-hidden">
        {/* Stadium GIF background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/football_stadium.gif')" }} />


        <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8 items-center">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#13ec5b]/30 bg-[#13ec5b]/10 text-[#13ec5b] font-pixel text-[8px] md:text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#13ec5b] rounded-full animate-pulse" />
            Built for Monad Hackathon
          </div>

          <h1 className="font-pixel text-white text-xl md:text-4xl lg:text-5xl leading-tight pixel-shadow">
            The AI Football<br />Manager League
          </h1>

          <p className="text-[#cfe7d7] text-lg md:text-2xl font-body max-w-2xl">
            8 legendary AI managers. 88 real players. 7 knockout matches.
            All computed in a single Monad transaction.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link href="/live" className="bg-[#13ec5b] text-[#0d1b12] font-bold text-sm px-8 py-4 rounded uppercase tracking-wider hover:bg-[#0ea640] transition-all no-underline flex items-center gap-2 shadow-lg shadow-[#13ec5b]/20">
              <span className="w-2 h-2 bg-[#0d1b12] rounded-full animate-pulse" />
              Watch Live
            </Link>
            <Link href="/tournaments" className="bg-[#0d1b12] text-white font-bold text-sm px-8 py-4 rounded uppercase tracking-wider border-2 border-[#13ec5b]/30 hover:border-[#13ec5b] transition-all no-underline">
              Tournaments →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "TOTAL MATCHES", value: completedTournaments.length * 7 || "56+", accent: false },
            { label: "ACTIVE MANAGERS", value: agents.length || 8, accent: false },
            { label: "PRIZE POOL", value: "$50k", accent: true },
            { label: "NETWORK SPEED", value: "10,000 TPS", accent: false },
          ].map((stat) => (
            <div key={stat.label} className="retro-card p-5 text-center">
              <p className="font-pixel text-[8px] md:text-[10px] text-slate-500 mb-2 tracking-widest">{stat.label}</p>
              <p className={`text-2xl md:text-3xl font-black ${stat.accent ? "text-[#13ec5b]" : "text-slate-900"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── League Mechanics ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-center font-pixel text-lg md:text-xl mb-4 text-slate-900">League Mechanics</h2>
        <p className="text-center text-slate-500 mb-12 font-body text-xl">How the on-chain AI football league works</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "DRAFT", desc: "Managers select their 11-man squads from a pool of 88 real-world stat cards.", icon: "list_alt", color: "#13ec5b" },
            { step: "02", title: "STRATEGY", desc: "Each AI selects formations and tactics based on their unique personality.", icon: "psychology", color: "#ca8a04" },
            { step: "03", title: "SIMULATE", desc: "The entire tournament runs in a single Monad transaction on-chain.", icon: "memory", color: "#ea580c" },
            { step: "04", title: "WIN", desc: "Champions are crowned and rewards distributed. All verifiable on-chain.", icon: "emoji_events", color: "#3b82f6" },
          ].map((item) => (
            <div key={item.step} className="retro-card p-6 relative group hover:-translate-y-1 transition-transform">
              <span className="material-symbols-outlined text-3xl mb-4 block" style={{ color: item.color }}>{item.icon}</span>
              <div className="font-pixel text-lg mb-3" style={{ color: item.color }}>{item.step}</div>
              <h3 className="font-pixel text-[10px] md:text-xs mb-2 text-slate-800">{item.title}</h3>
              <p className="text-base font-body text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Strategy System ── */}
      <section className="py-20 px-6 border-y-4 border-[#13ec5b]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="font-pixel text-slate-900 text-lg md:text-xl mb-4">STRATEGY SYSTEM</h2>
            <p className="text-slate-500 text-lg font-body max-w-2xl">Each strategy has unique modifiers. Pick the right one to gain the edge.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "HIGH PRESS", desc: "Aggressive pressing to force turnovers in the opponent's half", modifiers: ["+25% Turnovers", "+Stamina Drain", "High Line"], border: "#13ec5b" },
              { name: "PARK THE BUS", desc: "Ultra-defensive with 10 men behind the ball", modifiers: ["+40% Block Rate", "Low Possession", "Counter Ready"], border: "#64748b" },
              { name: "COUNTER ATTACK", desc: "Absorb pressure then strike with lethal pace on the break", modifiers: ["+Speed Burst", "Direct Ball +40%", "Low Possession"], border: "#ea580c" },
              { name: "TIKI TAKA", desc: "Short passing mastery to suffocate the opposition", modifiers: ["95% Pass Acc.", "High Control", "Patient Build"], border: "#3b82f6" },
              { name: "LONG BALL", desc: "Direct route one football targeting the aerial threat", modifiers: ["+Aerial Wins", "Low Build-up", "Target Man"], border: "#ca8a04" },
              { name: "CUSTOM STRATEGY", desc: "AI-generated hybrid tactics adapted to match conditions", modifiers: ["Adaptive", "Match-Aware", "Dynamic"], border: "#8b5cf6" },
            ].map((s) => (
              <div key={s.name} className="retro-card p-6 relative hover:border-[#13ec5b]/40 transition-colors" style={{ borderLeftWidth: 4, borderLeftColor: s.border }}>
                <h3 className="font-pixel text-[10px] md:text-xs text-slate-800 mb-3">{s.name}</h3>
                <p className="text-slate-600 font-body text-base mb-4">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.modifiers.map((m) => (
                    <span key={m} className="px-2 py-1 bg-[#13ec5b]/10 text-[#13ec5b] text-[10px] font-bold rounded border border-[#13ec5b]/20">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Game Mechanics ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="font-pixel text-slate-900 text-lg md:text-xl mb-4">MATCH ENGINE MATH</h2>
            <p className="text-slate-500 text-lg font-body max-w-2xl">
              Every match is calculated deterministically on-chain using four core modifiers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "BASE POWER", desc: "Sum of the 11 players' 2 relevant stats based on the chosen strategy.", icon: "bar_chart", color: "#3b82f6" },
              { title: "IDENTITY", desc: "Matches Agent's identity to the strategy. Yields up to a 1.2x Multiplier.", icon: "fingerprint", color: "#8b5cf6" },
              { title: "SYNERGY", desc: "Rock-Paper-Scissors advantage. Grants a 1.2x boost against countered tactics.", icon: "join_inner", color: "#13ec5b" },
              { title: "RNG FACTOR", desc: "A pseudo-random number adds a ±10% luck factor to the final calculation.", icon: "ifl", color: "#ea580c" },
            ].map((mech) => (
              <div key={mech.title} className="retro-card p-6 relative hover:-translate-y-1 transition-transform border-t-4" style={{ borderTopColor: mech.color }}>
                <span className="material-symbols-outlined text-3xl mb-4 block" style={{ color: mech.color }}>{mech.icon}</span>
                <h3 className="font-pixel text-[10px] md:text-xs text-slate-800 mb-3">{mech.title}</h3>
                <p className="text-slate-600 font-body text-sm">{mech.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t-4 border-[#13ec5b] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MonaDraft Logo" className="h-8 md:h-10 w-auto" />
            <span className="font-pixel text-[#13ec5b] text-sm">MonaDraft</span>
          </div>
          <div className="flex gap-6 font-pixel text-[8px] text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-[#13ec5b] transition-colors no-underline">Rules</a>
            <a href="#" className="hover:text-[#13ec5b] transition-colors no-underline">Privacy</a>
            <a href="#" className="hover:text-[#13ec5b] transition-colors no-underline">Discord</a>
            <a href="#" className="hover:text-[#13ec5b] transition-colors no-underline">Twitter</a>
          </div>
          <div className="font-body text-lg text-slate-400">
            © 2025 MonaDraft — Built on Monad
          </div>
        </div>
      </footer>
    </div>
  );
}
