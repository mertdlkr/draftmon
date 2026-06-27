import Link from "next/link";
import { StatsRow } from "@/components/home/StatsRow";

export default async function HomePage() {
  return (
    <div>
      {/* ── Stadium Hero ── */}
      <section className="hero-scanlines relative w-full min-h-[85vh] flex items-center justify-center text-center px-6 pb-20 overflow-hidden">
        {/* Stadium GIF background with TV wave filter */}
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/football_stadium.gif')" }}
        />
        {/* Scrolling TV scan band */}
        <div className="hero-scan-band" aria-hidden="true" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8 items-center">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-pixel text-[8px] md:text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Built for Monad Hackathon
          </div>

          <h1 className="font-pixel text-white text-xl md:text-3xl lg:text-4xl leading-tight pixel-shadow blink-cursor glitch-text">
            RETRO FOOTBALL DRAFT
            <br />
            & ON-CHAIN BETTING
          </h1>

          <p className="text-border-green text-lg md:text-2xl font-body max-w-2xl text-slate-100">
            Scan the QR, pay the entry fee, draft your team in 60 seconds,
            and compete or place bets on match outcomes. Built on Monad.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="relative overflow-hidden rounded shadow-lg shadow-primary/20">
              <Link
                href="/rooms"
                className="retro-btn bg-primary text-dark-green font-bold text-sm px-8 py-4 rounded uppercase tracking-wider hover:bg-[#0ea640] transition-all no-underline flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 bg-dark-green rounded-full animate-pulse" />
                Active Leagues
              </Link>
              <div className="live-ribbon">LIVE</div>
            </div>
            <Link
              href="/admin"
              className="retro-btn bg-dark-green text-white font-bold text-sm px-8 py-4 rounded uppercase tracking-wider border-2 border-primary/30 hover:border-primary transition-all no-underline"
            >
              Admin Panel
            </Link>
          </div>

          <p className="font-pixel text-[8px] text-white/50 tracking-widest text-blink">
            ▶ PRESS START ◀
          </p>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="bg-dark-green border-y-2 border-primary/40 overflow-hidden py-2.5">
        <div className="ticker-track">
          {[1, 2].map((i) => (
            <span
              key={i}
              className="flex items-center gap-10 px-10 font-pixel text-[8px] text-primary whitespace-nowrap"
            >
              <span>⚽ RETRO DRAFT TOURNAMENT ACTIVE</span>
              <span className="text-white/30">■</span>
              <span>🏆 SCAN QR CODE TO JOIN ROOMS</span>
              <span className="text-white/30">■</span>
              <span>⚡ DRAFT IN 60 SECONDS</span>
              <span className="text-white/30">■</span>
              <span>🎮 PLACE MON BETS ON WINNERS</span>
              <span className="text-white/30">■</span>
              <span>📊 100% VERIFIABLE ON-CHAIN PAYOUTS</span>
              <span className="text-white/30">■</span>
              <span>💎 BUILT ON MONAD TESTNET</span>
              <span className="text-white/30">■</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <StatsRow
        stats={[
          { label: "Matches Played", value: "83" },
          { label: "Total MON Won", value: "10+" },
          { label: "Active Pools", value: "Available" },
          { label: "Live Tournaments", value: "3" },
        ]}
      />

      {/* ── Choose Your Path ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-center font-pixel text-xl md:text-2xl text-slate-900 mb-4 uppercase">
          Choose Your Path
        </h2>
        <p className="text-center text-slate-500 mb-12 font-body text-2xl">
          Will you draft the winning squad or back one with your MON?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: The Manager */}
          <div className="retro-card p-8 bg-white border-l-8 border-primary flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border-2 border-emerald-400 font-pixel text-[10px] uppercase mb-6">
                <span className="material-symbols-outlined text-sm">sports_score</span>
                The Manager
              </div>
              <h3 className="font-pixel text-lg text-slate-900 mb-4">DRAFT & COMPETE</h3>
              <p className="font-body text-xl text-slate-600 mb-6 leading-relaxed">
                Scan the tournament room QR code, pay the MON entry fee, and enter the high-stakes draft. 
                You have exactly 60 seconds to build your 11-man squad position-by-position. Out-draft your 
                opponents and take home the entire entry fee pool!
              </p>
            </div>
            <ul className="space-y-3 font-pixel text-[10px] text-slate-700 border-t-2 border-dashed border-slate-200 pt-6">
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">✔</span> 60s Pressure Draft
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">✔</span> Real-world Stat Cards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">✔</span> Winner Takes the Entry Pool
              </li>
            </ul>
          </div>

          {/* Card 2: The Bettor */}
          <div className="retro-card p-8 bg-white border-l-8 border-amber-400 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 border-2 border-amber-400 font-pixel text-[10px] uppercase mb-6">
                <span className="material-symbols-outlined text-sm">payments</span>
                The Bettor
              </div>
              <h3 className="font-pixel text-lg text-slate-900 mb-4">ANALYZE & BACK</h3>
              <p className="font-body text-xl text-slate-600 mb-6 leading-relaxed">
                Don't want to manage? No problem. Watch the drafts happen in real-time, analyze team 
                lineups, and back your favorite manager with MON during the 60-second betting window. 
                Successful predictions earn a proportional share of the bet pool!
              </p>
            </div>
            <ul className="space-y-3 font-pixel text-[10px] text-slate-700 border-t-2 border-dashed border-slate-200 pt-6">
              <li className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">✔</span> Roster Analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">✔</span> 60s Betting Window
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">✔</span> Proportional Pool Payouts
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Pixel Divider ── */}
      <div className="pixel-divider" aria-hidden="true" />

      {/* ── League Mechanics ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-center font-pixel text-lg md:text-xl mb-4 text-slate-900">
          League Mechanics
        </h2>
        <p className="text-center text-slate-500 mb-12 font-body text-xl">
          How the retro draft and betting tournament works
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "JOIN ROOM",
              desc: "Players scan the QR code to enter the room lobby and deposit their entry fee (MON).",
              icon: "qr_code_scanner",
              color: "var(--color-primary)",
            },
            {
              step: "02",
              title: "SPEED DRAFT",
              desc: "Build your 11-man roster from random player cards within 60s (ATT -> MID -> DEF -> GK).",
              icon: "list_alt",
              color: "#ca8a04",
            },
            {
              step: "03",
              title: "PLACE BETS",
              desc: "Analyze other managers' lineups and place MON bets during the 60-second betting window.",
              icon: "payments",
              color: "#ea580c",
            },
            {
              step: "04",
              title: "SIM & PAYOUT",
              desc: "Watch retro 16-bit match replays. Winners and correct bettors receive on-chain rewards.",
              icon: "sports_score",
              color: "#3b82f6",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="retro-card p-6 relative group hover:-translate-y-1 transition-transform bg-white border-2 border-slate-200 shadow-md"
            >
              <span
                className="material-symbols-outlined text-3xl mb-4 block"
                style={{ color: item.color }}
              >
                {item.icon}
              </span>
              <div className="font-pixel text-lg mb-3" style={{ color: item.color }}>
                {item.step}
              </div>
              <h3 className="font-pixel text-[10px] md:text-xs mb-2 text-slate-800">
                {item.title}
              </h3>
              <p className="text-base font-body text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t-4 border-primary py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DraftMon Logo" className="h-8 md:h-10 w-auto" />
            <span className="font-pixel text-primary text-sm">DraftMon</span>
          </div>
          <div className="flex gap-6 font-pixel text-[8px] text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors no-underline">
              Rules
            </a>
            <a href="#" className="hover:text-primary transition-colors no-underline">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors no-underline">
              Discord
            </a>
            <a href="#" className="hover:text-primary transition-colors no-underline">
              Twitter
            </a>
          </div>
          <div className="font-body text-lg text-slate-400">
            © 2026 DraftMon — Built on Monad
          </div>
        </div>
      </footer>
    </div>
  );
}
