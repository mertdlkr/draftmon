"use client";

import { useState, useMemo, useEffect, useRef } from "react";

// ─── Player Database (mirrors scripts/players.ts) ────────────────────────────

interface BazaarPlayer {
    name: string;
    position: string;
    pace: number;
    shooting: number;
    passing: number;
    tackling: number;
    tier: number;
    tierLabel: string;
    overall: number;
    marketValue: number; // in MON
    owner: string; // agent name
    bidHistory: BidEntry[];
    isSold: boolean;
}

interface BidEntry {
    bidder: string;
    amount: number;
    timestamp: string;
    won: boolean;
}

const AGENT_NAMES = [
    "Guardiola GPT", "MourinhOS", "Klopp Chain", "AncelottAI",
    "Simeone Node", "Bielsa Byte", "Conte Contract", "Sir Alex Algo"
];

const AGENT_COLORS: Record<string, string> = {
    "Guardiola GPT": "#3b82f6",
    "MourinhOS": "#6366f1",
    "Klopp Chain": "#ef4444",
    "AncelottAI": "#f59e0b",
    "Simeone Node": "#ec4899",
    "Bielsa Byte": "#14b8a6",
    "Conte Contract": "#8b5cf6",
    "Sir Alex Algo": "#22c55e",
};

const TIER_CONFIG: Record<number, { label: string; color: string; glow: string }> = {
    1: { label: "LEGEND", color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
    2: { label: "ELITE", color: "#a78bfa", glow: "rgba(167,139,250,0.2)" },
    3: { label: "GREAT", color: "#60a5fa", glow: "rgba(96,165,250,0.2)" },
    4: { label: "GOOD", color: "#34d399", glow: "rgba(52,211,153,0.15)" },
    5: { label: "AVERAGE", color: "#9ca3af", glow: "none" },
    6: { label: "BELOW AVG", color: "#f97316", glow: "none" },
    7: { label: "POOR", color: "#ef4444", glow: "none" },
    8: { label: "MEME", color: "#71717a", glow: "none" },
};

const POSITION_COLORS: Record<string, string> = {
    GK: "#f59e0b",
    CB: "#3b82f6", LB: "#3b82f6", RB: "#3b82f6",
    CDM: "#22c55e", CM: "#22c55e", CAM: "#22c55e",
    LW: "#ef4444", RW: "#ef4444", ST: "#ef4444",
};

// ─── Live Log Templates ──────────────────────────────────────────────────────

const LOG_TEMPLATES = [
    (p: string, a: string) => `🔍 ${a} is scouting ${p}`,
    (p: string, a: string) => `💬 ${a} opened negotiations for ${p}`,
    (p: string, a: string) => `📊 ${a} analyzing ${p}'s match data`,
    (p: string, _a: string) => `📈 ${p}'s market value rising`,
    (p: string, a: string) => `🤝 ${a} submitted a bid for ${p}`,
    (p: string, _a: string) => `⚡ High demand alert for ${p}`,
    (p: string, a: string) => `🎯 ${a} targeting ${p} for the squad`,
    (p: string, a: string) => `💰 ${a} evaluating ${p}'s transfer fee`,
    (p: string, _a: string) => `🔄 Trade window active for ${p}`,
    (p: string, a: string) => `📋 ${a} added ${p} to watchlist`,
    (p: string, a: string) => `🏷️ ${a} placed a bid on ${p}`,
    (p: string, _a: string) => `📉 ${p}'s price adjusted by market`,
    (p: string, a: string) => `🤖 ${a} running valuation model on ${p}`,
    (p: string, _a: string) => `🔥 Bidding war heating up for ${p}`,
    (p: string, a: string) => `📝 ${a} drafting contract terms for ${p}`,
    (p: string, a: string) => `🧠 ${a} comparing ${p} to alternatives`,
    (p: string, _a: string) => `⏳ Transfer deadline approaching for ${p}`,
    (p: string, a: string) => `💎 ${a} considers ${p} a hidden gem`,
    (p: string, a: string) => `🔒 ${a} locked in offer for ${p}`,
    (p: string, _a: string) => `📢 New intel received on ${p}`,
];

function LiveLogTicker({ playerName, playerHash }: { playerName: string; playerHash: number }) {
    const [logIndex, setLogIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Generate a set of logs for this player
    const logs = useMemo(() => {
        const result: string[] = [];
        for (let i = 0; i < 6; i++) {
            const templateIdx = (playerHash + i * 13) % LOG_TEMPLATES.length;
            const agentIdx = (playerHash + i * 7 + 3) % AGENT_NAMES.length;
            result.push(LOG_TEMPLATES[templateIdx](playerName, AGENT_NAMES[agentIdx]));
        }
        return result;
    }, [playerName, playerHash]);

    useEffect(() => {
        // Stagger start based on player hash to avoid all ticking at once
        const delay = (playerHash % 2000) + 1500;
        const timer = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setFade(false);
                setTimeout(() => {
                    setLogIndex((prev) => (prev + 1) % logs.length);
                    setFade(true);
                }, 200);
            }, 2800 + (playerHash % 1200));
        }, delay);

        return () => {
            clearTimeout(timer);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [playerHash, logs.length]);

    return (
        <div className="bg-slate-50 p-2 rounded text-[10px] font-bold text-slate-500 flex items-center gap-2 mt-1 min-h-[1.4rem] overflow-hidden">
            <span className="text-[#16a34a] animate-pulse">●</span>
            <span style={{
                opacity: fade ? 1 : 0,
                transition: "opacity 0.2s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}>
                {logs[logIndex]}
            </span>
        </div>
    );
}

// Deterministic pseudo-random from player name
function nameHash(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    return Math.abs(h);
}

function generateBidHistory(player: { name: string; tier: number; overall: number }): BidEntry[] {
    const hash = nameHash(player.name);
    const numBids = (hash % 5) + 1; // 1-5 bids
    const basePrice = player.overall * 0.008;
    const bids: BidEntry[] = [];

    for (let i = 0; i < numBids; i++) {
        const bidderIdx = (hash + i * 7) % AGENT_NAMES.length;
        const variance = ((hash * (i + 3)) % 40 - 20) / 100; // -20% to +20%
        const amount = parseFloat((basePrice * (0.7 + i * 0.15 + variance)).toFixed(3));
        const hour = 8 + ((hash + i * 3) % 14);
        const minute = (hash * (i + 1)) % 60;

        bids.push({
            bidder: AGENT_NAMES[bidderIdx],
            amount: Math.max(0.001, amount),
            timestamp: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
            won: i === numBids - 1,
        });
    }

    return bids;
}

// Generate all bazaar data deterministically
function generateBazaarData(): BazaarPlayer[] {
    const raw = [
        // TIER 1
        { name: "Rustu", position: "GK", pace: 50, shooting: 20, passing: 75, tackling: 98, tier: 1 },
        { name: "Maldini", position: "CB", pace: 80, shooting: 45, passing: 75, tackling: 99, tier: 1 },
        { name: "Ramos", position: "CB", pace: 78, shooting: 70, passing: 75, tackling: 96, tier: 1 },
        { name: "Cafu", position: "RB", pace: 90, shooting: 65, passing: 85, tackling: 90, tier: 1 },
        { name: "Carlos", position: "LB", pace: 94, shooting: 92, passing: 82, tackling: 85, tier: 1 },
        { name: "Zidane", position: "CM", pace: 75, shooting: 88, passing: 98, tackling: 70, tier: 1 },
        { name: "Iniesta", position: "CM", pace: 76, shooting: 75, passing: 97, tackling: 65, tier: 1 },
        { name: "Messi", position: "RW", pace: 90, shooting: 96, passing: 96, tackling: 35, tier: 1 },
        { name: "Ronaldinho", position: "LW", pace: 88, shooting: 88, passing: 94, tackling: 40, tier: 1 },
        { name: "Pele", position: "ST", pace: 93, shooting: 97, passing: 88, tackling: 45, tier: 1 },
        { name: "Maradona", position: "ST", pace: 89, shooting: 92, passing: 95, tackling: 40, tier: 1 },
        // TIER 2
        { name: "Neuer", position: "GK", pace: 55, shooting: 25, passing: 85, tackling: 92, tier: 2 },
        { name: "VanDijk", position: "CB", pace: 77, shooting: 50, passing: 72, tackling: 93, tier: 2 },
        { name: "Silva", position: "CB", pace: 70, shooting: 45, passing: 76, tackling: 91, tier: 2 },
        { name: "Walker", position: "RB", pace: 92, shooting: 60, passing: 78, tackling: 85, tier: 2 },
        { name: "Davies", position: "LB", pace: 95, shooting: 68, passing: 77, tackling: 82, tier: 2 },
        { name: "Calhanoglu", position: "CM", pace: 72, shooting: 88, passing: 94, tackling: 70, tier: 2 },
        { name: "DeBruyne", position: "CM", pace: 74, shooting: 86, passing: 95, tackling: 65, tier: 2 },
        { name: "Salah", position: "RW", pace: 90, shooting: 89, passing: 84, tackling: 45, tier: 2 },
        { name: "Neymar", position: "LW", pace: 87, shooting: 84, passing: 88, tackling: 38, tier: 2 },
        { name: "Ronaldo", position: "ST", pace: 88, shooting: 94, passing: 80, tackling: 40, tier: 2 },
        { name: "Mbappe", position: "ST", pace: 97, shooting: 90, passing: 82, tackling: 36, tier: 2 },
        // TIER 3
        { name: "Alisson", position: "GK", pace: 50, shooting: 20, passing: 80, tackling: 88, tier: 3 },
        { name: "Dias", position: "CB", pace: 68, shooting: 40, passing: 68, tackling: 88, tier: 3 },
        { name: "Rudiger", position: "CB", pace: 82, shooting: 45, passing: 65, tackling: 86, tier: 3 },
        { name: "Hakimi", position: "RB", pace: 92, shooting: 72, passing: 78, tackling: 80, tier: 3 },
        { name: "Theo", position: "LB", pace: 93, shooting: 70, passing: 75, tackling: 79, tier: 3 },
        { name: "Kroos", position: "CM", pace: 55, shooting: 82, passing: 92, tackling: 65, tier: 3 },
        { name: "Guler", position: "CAM", pace: 80, shooting: 82, passing: 88, tackling: 40, tier: 3 },
        { name: "Ferdi", position: "RB", pace: 90, shooting: 70, passing: 82, tackling: 80, tier: 3 },
        { name: "Vinicius", position: "LW", pace: 95, shooting: 84, passing: 81, tackling: 35, tier: 3 },
        { name: "Haaland", position: "ST", pace: 89, shooting: 93, passing: 66, tackling: 45, tier: 3 },
        { name: "Kane", position: "ST", pace: 68, shooting: 92, passing: 84, tackling: 48, tier: 3 },
        // TIER 4
        { name: "Martinez", position: "GK", pace: 45, shooting: 20, passing: 65, tackling: 82, tier: 4 },
        { name: "Merih", position: "CB", pace: 72, shooting: 40, passing: 55, tackling: 84, tier: 4 },
        { name: "Saliba", position: "CB", pace: 77, shooting: 38, passing: 68, tackling: 82, tier: 4 },
        { name: "James", position: "RB", pace: 80, shooting: 75, passing: 82, tackling: 78, tier: 4 },
        { name: "Robertson", position: "LB", pace: 82, shooting: 60, passing: 80, tackling: 79, tier: 4 },
        { name: "Yildiz", position: "RW", pace: 85, shooting: 78, passing: 75, tackling: 40, tier: 4 },
        { name: "Odegaard", position: "CAM", pace: 75, shooting: 78, passing: 86, tackling: 60, tier: 4 },
        { name: "Foden", position: "RW", pace: 84, shooting: 80, passing: 82, tackling: 50, tier: 4 },
        { name: "Leao", position: "LW", pace: 92, shooting: 78, passing: 75, tackling: 35, tier: 4 },
        { name: "Osimhen", position: "ST", pace: 88, shooting: 82, passing: 65, tackling: 40, tier: 4 },
        { name: "Lautaro", position: "ST", pace: 82, shooting: 84, passing: 72, tackling: 45, tier: 4 },
        // TIER 5
        { name: "Onana", position: "GK", pace: 40, shooting: 15, passing: 75, tackling: 72, tier: 5 },
        { name: "Maguire", position: "CB", pace: 48, shooting: 50, passing: 65, tackling: 76, tier: 5 },
        { name: "Upamecano", position: "CB", pace: 78, shooting: 35, passing: 62, tackling: 74, tier: 5 },
        { name: "WanBissaka", position: "RB", pace: 82, shooting: 40, passing: 60, tackling: 82, tier: 5 },
        { name: "Cucurella", position: "LB", pace: 78, shooting: 55, passing: 70, tackling: 73, tier: 5 },
        { name: "Mor", position: "RW", pace: 92, shooting: 65, passing: 68, tackling: 30, tier: 5 },
        { name: "Cengiz", position: "RW", pace: 84, shooting: 74, passing: 70, tackling: 35, tier: 5 },
        { name: "Antony", position: "RW", pace: 84, shooting: 65, passing: 68, tackling: 45, tier: 5 },
        { name: "Mudryk", position: "LW", pace: 94, shooting: 60, passing: 62, tackling: 35, tier: 5 },
        { name: "Werner", position: "ST", pace: 90, shooting: 68, passing: 65, tackling: 30, tier: 5 },
        { name: "Nunez", position: "ST", pace: 88, shooting: 72, passing: 64, tackling: 42, tier: 5 },
        // TIER 6
        { name: "Karius", position: "GK", pace: 35, shooting: 10, passing: 50, tackling: 62, tier: 6 },
        { name: "Mustafi", position: "CB", pace: 52, shooting: 40, passing: 55, tackling: 65, tier: 6 },
        { name: "Lovren", position: "CB", pace: 50, shooting: 45, passing: 52, tackling: 68, tier: 6 },
        { name: "Sabri", position: "RB", pace: 88, shooting: 20, passing: 60, tackling: 65, tier: 6 },
        { name: "Kurzawa", position: "LB", pace: 65, shooting: 55, passing: 60, tackling: 62, tier: 6 },
        { name: "Arthur", position: "CM", pace: 60, shooting: 55, passing: 72, tackling: 58, tier: 6 },
        { name: "Bakayoko", position: "CDM", pace: 62, shooting: 50, passing: 60, tackling: 68, tier: 6 },
        { name: "Pepe", position: "CB", pace: 80, shooting: 68, passing: 65, tackling: 35, tier: 6 },
        { name: "Hazard", position: "LW", pace: 68, shooting: 65, passing: 70, tackling: 30, tier: 6 },
        { name: "Morata", position: "ST", pace: 75, shooting: 65, passing: 58, tackling: 35, tier: 6 },
        { name: "Balotelli", position: "ST", pace: 70, shooting: 72, passing: 55, tackling: 30, tier: 6 },
        // TIER 7
        { name: "Kepa", position: "GK", pace: 30, shooting: 10, passing: 60, tackling: 52, tier: 7 },
        { name: "Jones", position: "CB", pace: 55, shooting: 30, passing: 50, tackling: 55, tier: 7 },
        { name: "Bailly", position: "CB", pace: 65, shooting: 30, passing: 45, tackling: 58, tier: 7 },
        { name: "Camdal", position: "RB", pace: 70, shooting: 30, passing: 50, tackling: 45, tier: 7 },
        { name: "Mendy", position: "LB", pace: 62, shooting: 35, passing: 50, tackling: 55, tier: 7 },
        { name: "Alli", position: "CAM", pace: 60, shooting: 55, passing: 60, tackling: 45, tier: 7 },
        { name: "Drinkwater", position: "CM", pace: 55, shooting: 45, passing: 62, tackling: 50, tier: 7 },
        { name: "Jese", position: "LW", pace: 70, shooting: 55, passing: 55, tackling: 25, tier: 7 },
        { name: "Lingard", position: "CAM", pace: 68, shooting: 50, passing: 58, tackling: 35, tier: 7 },
        { name: "Bendtner", position: "ST", pace: 55, shooting: 60, passing: 45, tackling: 25, tier: 7 },
        { name: "Carroll", position: "ST", pace: 45, shooting: 62, passing: 40, tackling: 30, tier: 7 },
        // TIER 8
        { name: "Taibi", position: "GK", pace: 25, shooting: 5, passing: 40, tackling: 40, tier: 8 },
        { name: "Squillaci", position: "CB", pace: 35, shooting: 20, passing: 35, tackling: 45, tier: 8 },
        { name: "Senderos", position: "CB", pace: 38, shooting: 25, passing: 30, tackling: 48, tier: 8 },
        { name: "Jenkinson", position: "RB", pace: 65, shooting: 30, passing: 45, tackling: 42, tier: 8 },
        { name: "Santos", position: "LB", pace: 55, shooting: 40, passing: 48, tackling: 35, tier: 8 },
        { name: "Kleberson", position: "CM", pace: 50, shooting: 38, passing: 52, tackling: 45, tier: 8 },
        { name: "Djemba", position: "CDM", pace: 55, shooting: 35, passing: 48, tackling: 48, tier: 8 },
        { name: "Obertan", position: "RW", pace: 80, shooting: 35, passing: 40, tackling: 25, tier: 8 },
        { name: "Karadeniz", position: "ST", pace: 40, shooting: 50, passing: 35, tackling: 20, tier: 8 },
        { name: "Heskey", position: "ST", pace: 45, shooting: 48, passing: 40, tackling: 30, tier: 8 },
        { name: "Chamakh", position: "ST", pace: 50, shooting: 45, passing: 42, tackling: 25, tier: 8 },
    ];

    return raw.map((p) => {
        const overall = Math.round((p.pace + p.shooting + p.passing + p.tackling) / 4);
        const hash = nameHash(p.name);
        const ownerIdx = hash % AGENT_NAMES.length;
        const marketValue = parseFloat((overall * 0.012 + (hash % 30) * 0.01).toFixed(3));
        const isSold = hash % 3 !== 0; // ~67% sold

        return {
            ...p,
            tierLabel: TIER_CONFIG[p.tier].label,
            overall,
            marketValue,
            owner: AGENT_NAMES[ownerIdx],
            bidHistory: generateBidHistory({ ...p, overall }),
            isSold,
        };
    });
}

// ─── Filters & Sorting ───────────────────────────────────────────────────────

type SortKey = "overall" | "marketValue" | "pace" | "shooting" | "passing" | "tackling" | "name";
type PositionFilter = "ALL" | "GK" | "DEF" | "MID" | "ATK";
type TierFilter = "ALL" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const POS_GROUPS: Record<PositionFilter, string[]> = {
    ALL: [],
    GK: ["GK"],
    DEF: ["CB", "LB", "RB"],
    MID: ["CDM", "CM", "CAM"],
    ATK: ["LW", "RW", "ST"],
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PlayerBazaar() {
    const allPlayers = useMemo(() => generateBazaarData(), []);

    const [posFilter, setPosFilter] = useState<PositionFilter>("ALL");
    const [tierFilter, setTierFilter] = useState<TierFilter>("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("overall");
    const [sortAsc, setSortAsc] = useState(false);
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let list = [...allPlayers];

        if (posFilter !== "ALL") {
            const positions = POS_GROUPS[posFilter];
            list = list.filter((p) => positions.includes(p.position));
        }
        if (tierFilter !== "ALL") {
            list = list.filter((p) => p.tier === tierFilter);
        }
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q));
        }

        list.sort((a, b) => {
            const va = a[sortKey as keyof BazaarPlayer];
            const vb = b[sortKey as keyof BazaarPlayer];
            if (typeof va === "string" && typeof vb === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
        });

        return list;
    }, [allPlayers, posFilter, tierFilter, sortKey, sortAsc, search]);

    const stats = useMemo(() => ({
        total: allPlayers.length,
        sold: allPlayers.filter((p) => p.isSold).length,
        totalValue: allPlayers.reduce((s, p) => s + p.marketValue, 0).toFixed(2),
        avgOverall: Math.round(allPlayers.reduce((s, p) => s + p.overall, 0) / allPlayers.length),
    }), [allPlayers]);

    function handleSort(key: SortKey) {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(false); }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Market Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Players", value: stats.total },
                    { label: "Players Traded", value: stats.sold },
                    { label: "Market Cap", value: `${stats.totalValue} MON` },
                    { label: "Avg Overall", value: stats.avgOverall },
                ].map((s) => (
                    <div key={s.label} className="bg-white p-6 border-b-4 border-[#16a34a] rounded-xl shadow-sm">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-black">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 items-center">
                {/* Search */}
                <div className="relative w-full xl:w-72">
                    <input
                        type="text"
                        placeholder="Search 16-bit legends..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded py-2 pl-4 pr-4 text-sm focus:ring-2 focus:ring-[#16a34a] outline-none"
                    />
                </div>

                {/* Position filter */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Position</span>
                    <div className="flex bg-slate-100 p-1 rounded">
                        {(["ALL", "GK", "DEF", "MID", "ATK"] as PositionFilter[]).map((p) => (
                            <button key={p} onClick={() => setPosFilter(p)} className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition-all ${posFilter === p ? "bg-white shadow-sm" : "hover:bg-white"
                                }`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tier filter */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Tier</span>
                    <div className="flex gap-1">
                        <button onClick={() => setTierFilter("ALL")} className={`size-7 flex items-center justify-center rounded font-black text-[10px] cursor-pointer transition-all ${tierFilter === "ALL" ? "bg-[#16a34a] text-white" : "bg-slate-200"
                            }`}>
                            ALL
                        </button>
                        {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((t) => (
                            <button key={t} onClick={() => setTierFilter(t)} className="size-7 flex items-center justify-center rounded font-black text-[10px] cursor-pointer transition-all" style={{
                                background: tierFilter === t ? TIER_CONFIG[t].color : "#e2e8f0",
                                color: tierFilter === t ? "#000" : TIER_CONFIG[t].color,
                            }}>
                                T{t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="xl:ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Sort By</span>
                    <select
                        className="bg-slate-100 border-none text-xs font-bold rounded py-1.5 focus:ring-[#16a34a] cursor-pointer"
                        value={sortKey}
                        onChange={(e) => { setSortKey(e.target.value as SortKey); setSortAsc(false); }}
                    >
                        <option value="overall">Highest Overall</option>
                        <option value="marketValue">Highest Value</option>
                        <option value="pace">Top Pace</option>
                        <option value="shooting">Top Shooting</option>
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-slate-500 font-medium">
                Showing {filtered.length} of {allPlayers.length} players
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {filtered.map((player) => {
                    const tierCfg = TIER_CONFIG[player.tier];
                    const isExpanded = expanded === player.name;
                    const posColor = POSITION_COLORS[player.position] || "#9ca3af";
                    const ownerColor = AGENT_COLORS[player.owner] || "#9ca3af";
                    const lastBid = player.bidHistory[player.bidHistory.length - 1];

                    return (
                        <div
                            key={player.name}
                            className={`bg-white rounded-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 cursor-pointer ${player.tier === 1 ? "legend-card" : player.tier === 2 ? "elite-card" : player.tier === 3 ? "great-card" : player.tier === 4 ? "good-card" : "border border-slate-200 shadow-sm"
                                }`}
                            onClick={() => setExpanded(isExpanded ? null : player.name)}
                        >
                            {/* Sold badge */}
                            {player.isSold && (
                                <div className="absolute top-2 right-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-600">
                                    SOLD
                                </div>
                            )}

                            {/* Card header with tier gradient */}
                            <div className={`p-4 ${player.tier <= 2 ? `bg-gradient-to-b ${player.tier === 1 ? 'from-yellow-100/50' : 'from-purple-100/50'} to-transparent` : 'p-4'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`font-black px-2 py-0.5 text-[10px] flex items-center gap-1 rounded`} style={{ background: tierCfg.color, color: player.tier <= 2 ? '#000' : '#fff' }}>
                                        <span className="material-symbols-outlined text-[14px]">{player.tier === 1 ? 'star' : player.tier === 2 ? 'shield' : 'person'}</span>
                                        {tierCfg.label}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Market Value</p>
                                        <p className="text-lg font-black italic" style={{ color: tierCfg.color }}>{player.marketValue} MON</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="size-16 bg-slate-200 rounded p-1 flex items-center justify-center overflow-hidden" style={{ border: `2px solid ${tierCfg.color}` }}>
                                        <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>sports_soccer</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black italic uppercase leading-none">{player.name}</h3>
                                        <p className="text-slate-500 font-bold text-xs">{player.position} • Tier {player.tier}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="px-4 pb-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {([
                                        { key: "pace", label: "PAC" },
                                        { key: "shooting", label: "SHO" },
                                        { key: "passing", label: "PAS" },
                                        { key: "tackling", label: "TAC" },
                                    ] as const).map((stat) => (
                                        <div key={stat.key}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">{stat.label}</span>
                                                <span className="text-[9px] font-black">{player[stat.key]}</span>
                                            </div>
                                            <div className="stat-bar rounded-full overflow-hidden">
                                                <div className="stat-fill rounded-full" style={{ width: `${player[stat.key]}%`, background: tierCfg.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Owner */}
                                <div className="pt-3 border-t border-slate-100 px-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="size-5 rounded-full" style={{ background: ownerColor }} />
                                        <span className="text-[10px] font-bold">
                                            Owned by <span style={{ color: ownerColor }}>{player.owner}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Live log ticker */}
                                <div className="px-4 pb-3">
                                    <LiveLogTicker playerName={player.name} playerHash={nameHash(player.name)} />
                                </div>

                                {/* Expanded: Bid History */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 pt-3 px-4 pb-4">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Bid History</div>
                                        {player.bidHistory.map((bid, i) => (
                                            <div key={i} className="flex items-center gap-2 py-1 text-xs" style={{ borderBottom: i < player.bidHistory.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                                                <span className="text-[10px] text-slate-400 shrink-0 font-mono">{bid.timestamp}</span>
                                                <div className="size-2 rounded-full shrink-0" style={{ background: AGENT_COLORS[bid.bidder] || "#9ca3af" }} />
                                                <span className="font-bold" style={{ color: AGENT_COLORS[bid.bidder] || "#64748b" }}>{bid.bidder}</span>
                                                <div className="flex-1" />
                                                <span className={`font-bold font-mono ${bid.won ? "text-green-600" : ""}`}>{bid.amount.toFixed(3)} MON</span>
                                                {bid.won && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-green-100 text-green-600">WON</span>}
                                            </div>
                                        ))}
                                        {lastBid && (
                                            <div className="mt-2 p-2 bg-slate-50 rounded text-[10px] text-slate-500 font-mono">
                                                Final price: <strong className="text-[#16a34a]">{lastBid.amount.toFixed(3)} MON</strong> → {lastBid.bidder}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                    No players match your filters.
                </div>
            )}
        </div>
    );
}
