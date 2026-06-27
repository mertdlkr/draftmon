"use client";

import { useState, useMemo } from "react";

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
    marketValue: number;
    owner: string;
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

const TIER_COLORS: Record<number, { bg: string; border: string; text: string }> = {
    1: { bg: "bg-yellow-400", border: "border-yellow-400", text: "text-black" },
    2: { bg: "bg-slate-400", border: "border-slate-400", text: "text-white" },
    3: { bg: "bg-amber-600", border: "border-amber-600", text: "text-white" },
    4: { bg: "bg-slate-500", border: "border-slate-500", text: "text-white" },
    5: { bg: "bg-slate-500", border: "border-slate-500", text: "text-white" },
    6: { bg: "bg-slate-500", border: "border-slate-500", text: "text-white" },
    7: { bg: "bg-slate-500", border: "border-slate-500", text: "text-white" },
    8: { bg: "bg-slate-500", border: "border-slate-500", text: "text-white" },
};

const POSITION_BG: Record<string, string> = {
    GK: "bg-slate-700",
    CB: "bg-[#16a249]", LB: "bg-[#16a249]", RB: "bg-[#16a249]",
    CDM: "bg-slate-500", CM: "bg-slate-500", CAM: "bg-slate-500",
    LW: "bg-[#16a249]", RW: "bg-[#16a249]", ST: "bg-[#16a249]",
};

const POS_LABELS: Record<string, string> = {
    GK: "GK", CB: "DEF", LB: "DEF", RB: "DEF",
    CDM: "MID", CM: "MID", CAM: "MID",
    LW: "FWD", RW: "FWD", ST: "FWD",
};

// Deterministic pseudo-random from player name
function nameHash(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    return Math.abs(h);
}

function generateBidHistory(player: { name: string; tier: number; overall: number }): BidEntry[] {
    const hash = nameHash(player.name);
    const numBids = (hash % 5) + 1;
    const basePrice = player.overall * 0.008;
    const bids: BidEntry[] = [];
    for (let i = 0; i < numBids; i++) {
        const bidderIdx = (hash + i * 7) % AGENT_NAMES.length;
        const variance = ((hash * (i + 3)) % 40 - 20) / 100;
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

function generateBazaarData(): BazaarPlayer[] {
    const raw = [
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
        const isSold = hash % 3 !== 0;
        return {
            ...p,
            tierLabel: p.tier <= 2 ? "LEGEND" : p.tier <= 4 ? "ELITE" : "COMMON",
            overall,
            marketValue,
            owner: AGENT_NAMES[ownerIdx],
            bidHistory: generateBidHistory({ ...p, overall }),
            isSold,
        };
    });
}

// ─── Filters ───────────────────────────────────────────────────────────────────

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

// ─── Pixel Stat Bar ──────────────────────────────────────────────────────────

function PixelStatBar({ label, value }: { label: string; value: number }) {
    const pct = Math.min(100, value);
    const isHigh = value >= 80;
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 w-6">{label}</span>
            <div className="h-3 flex-1 bg-slate-200" style={{
                backgroundImage: 'linear-gradient(to right, #e5e7eb 50%, transparent 50%)',
                backgroundSize: '6px 100%',
            }}>
                <div className="h-full" style={{
                    width: `${pct}%`,
                    backgroundImage: `linear-gradient(to right, ${isHigh ? '#16a249' : '#ca8a04'} 50%, transparent 50%)`,
                    backgroundSize: '6px 100%',
                }} />
            </div>
            <span className="text-[10px] font-bold w-5 text-right">{value}</span>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlayerBazaar() {
    const allPlayers = useMemo(() => generateBazaarData(), []);

    const [posFilter, setPosFilter] = useState<PositionFilter>("ALL");
    const [tierFilter, setTierFilter] = useState<TierFilter>("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("overall");
    const [sortAsc, setSortAsc] = useState(false);
    const [search, setSearch] = useState("");

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
        totalValue: allPlayers.reduce((s, p) => s + p.marketValue, 0).toFixed(1),
        avgOverall: Math.round(allPlayers.reduce((s, p) => s + p.overall, 0) / allPlayers.length),
    }), [allPlayers]);

    return (
        <div className="flex flex-col gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-4xl font-pixel leading-tight">PLAYER DRAFT</h1>
                <p className="text-[#16a249] font-bold text-lg font-code">Scout and acquire 16-bit legends for your Monad league.</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Players", value: stats.total },
                    { label: "Players Traded", value: stats.sold },
                    { label: "Market Cap", value: stats.totalValue },
                    { label: "Avg Overall", value: stats.avgOverall },
                ].map((s) => (
                    <div key={s.label} className="bg-white p-6 flex flex-col items-center justify-center gap-1" style={{
                        boxShadow: '-2px 0 0 0 #000, 2px 0 0 0 #000, 0 -2px 0 0 #000, 0 2px 0 0 #000',
                        margin: '2px',
                    }}>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
                        <p className={`text-2xl font-pixel mt-2 ${s.label === "Market Cap" ? "text-[#16a249]" : ""}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-6 bg-white/50 p-4 rounded-lg border-2 border-slate-200 items-start lg:items-end justify-between">
                <div className="flex flex-col gap-4 w-full lg:w-auto flex-1">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-300 focus:border-[#16a249] focus:ring-0 font-code text-sm font-medium placeholder:text-slate-400 outline-none"
                                style={{ boxShadow: '-1px 0 0 0 #d1d5db, 1px 0 0 0 #d1d5db, 0 -1px 0 0 #d1d5db, 0 1px 0 0 #d1d5db', margin: '1px' }}
                                placeholder="Search player..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {/* Position Filters */}
                        <div className="flex gap-2 flex-wrap">
                            {(["ALL", "GK", "DEF", "MID", "ATK"] as PositionFilter[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPosFilter(p)}
                                    className={`px-3 py-2 text-xs font-bold cursor-pointer transition-all ${posFilter === p
                                        ? "bg-[#16a249] text-white"
                                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                        }`}
                                    style={posFilter === p ? {
                                        boxShadow: '-2px 0 0 0 #000, 2px 0 0 0 #000, 0 -2px 0 0 #000, 0 2px 0 0 #000, 2px 2px 0 0 rgba(0,0,0,1)',
                                        margin: '2px',
                                    } : {
                                        boxShadow: '-1px 0 0 0 #d1d5db, 1px 0 0 0 #d1d5db, 0 -1px 0 0 #d1d5db, 0 1px 0 0 #d1d5db',
                                        margin: '1px',
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Tier Filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-slate-500 mr-2 uppercase">Tier:</span>
                        <button
                            onClick={() => setTierFilter("ALL")}
                            className={`size-8 flex items-center justify-center text-[10px] font-bold border-2 border-black cursor-pointer ${tierFilter === "ALL" ? "bg-[#16a249] text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]" : "bg-slate-200 opacity-50 hover:opacity-100"}`}
                        >ALL</button>
                        {([1, 2, 3, 4] as const).map((t) => {
                            const tc = TIER_COLORS[t];
                            return (
                                <button
                                    key={t}
                                    onClick={() => setTierFilter(t)}
                                    className={`size-8 flex items-center justify-center ${tc.bg} ${tc.text} text-[10px] font-bold border-2 border-black cursor-pointer ${tierFilter === t ? "shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]" : "opacity-50 hover:opacity-100"}`}
                                >T{t}</button>
                            );
                        })}
                    </div>
                </div>
                {/* Sort */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                    <span className="text-xs font-bold text-slate-500 uppercase">Sort by:</span>
                    <select
                        className="px-4 py-2 bg-white border-2 border-slate-300 text-sm font-bold focus:border-[#16a249] focus:ring-0 cursor-pointer"
                        style={{ boxShadow: '-1px 0 0 0 #d1d5db, 1px 0 0 0 #d1d5db, 0 -1px 0 0 #d1d5db, 0 1px 0 0 #d1d5db', margin: '1px' }}
                        value={sortKey}
                        onChange={(e) => { setSortKey(e.target.value as SortKey); setSortAsc(false); }}
                    >
                        <option value="overall">Overall Rating</option>
                        <option value="marketValue">Market Value</option>
                        <option value="pace">Pace</option>
                        <option value="shooting">Shooting</option>
                    </select>
                </div>
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((player) => {
                    const tierCfg = TIER_COLORS[player.tier] || TIER_COLORS[4];
                    const isLegend = player.tier === 1;
                    const lastBid = player.bidHistory[player.bidHistory.length - 1];
                    const posLabel = POS_LABELS[player.position] || player.position;
                    const posBg = POSITION_BG[player.position] || "bg-slate-500";

                    const cardStyle = isLegend ? {
                        borderTop: '5px solid #ca8a04',
                        borderLeft: '5px solid #ca8a04',
                        borderRight: '2px solid #000',
                        borderBottom: '2px solid #000',
                        boxShadow: '3px 3px 0 0 #ca8a04',
                    } : {
                        boxShadow: '-2px 0 0 0 #000, 2px 0 0 0 #000, 0 -2px 0 0 #000, 0 2px 0 0 #000',
                        margin: '2px',
                    };

                    return (
                        <div
                            key={player.name}
                            className={`relative bg-white p-5 group transition-transform hover:-translate-y-1 ${player.isSold ? '' : ''}`}
                            style={cardStyle}
                        >
                            {/* Legend star badge */}
                            {isLegend && (
                                <div className="absolute -top-3 -right-3 bg-[#ca8a04] border-2 border-black text-black p-1 z-10 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                    <span className="material-symbols-outlined text-sm font-bold">star</span>
                                </div>
                            )}

                            {/* SOLD stamp */}
                            {player.isSold && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 z-20" style={{
                                    transform: 'translate(-50%, -50%) rotate(-5deg)',
                                    border: '2px solid #fff',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                                }}>
                                    <span className="font-pixel text-xl font-bold">SOLD</span>
                                </div>
                            )}

                            {/* Player Info */}
                            <div className={`flex gap-4 items-start mb-4 ${player.isSold ? 'opacity-50' : ''}`}>
                                <div className="size-[64px] bg-slate-100 border-2 border-black p-1 shrink-0 flex items-center justify-center overflow-hidden bg-white" style={{ imageRendering: 'pixelated' }}>
                                    <img
                                        src={`/players/player_${((nameHash(player.name) % 23) + 1).toString().padStart(2, '0')}.png`}
                                        alt={player.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-pixel text-xs leading-tight mb-2 mt-1 uppercase">{player.name}</h3>
                                    <div className="flex gap-2 mb-2">
                                        <span className={`${posBg} text-white text-[10px] font-bold px-1 py-0.5 border border-black`}>{posLabel}</span>
                                        <span className={`${tierCfg.bg} ${tierCfg.text} text-[10px] font-bold px-1 py-0.5 border border-black`}>T{player.tier}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-code leading-none">
                                        Owned by <span className="text-[#16a249] font-bold">{player.owner}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className={`grid grid-cols-2 gap-x-4 gap-y-2 mb-4 bg-slate-50 p-3 border border-slate-200 ${player.isSold ? 'opacity-50' : ''}`}>
                                <PixelStatBar label="PAC" value={player.pace} />
                                <PixelStatBar label="SHO" value={player.shooting} />
                                <PixelStatBar label="PAS" value={player.passing} />
                                <PixelStatBar label="TAC" value={player.tackling} />
                            </div>

                            {/* Bid Footer */}
                            <div className={`flex justify-between items-end border-t-2 border-dashed border-slate-200 pt-3 ${player.isSold ? 'opacity-50' : ''}`}>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">{player.isSold ? "Sold For" : "Current Bid"}</span>
                                    <span className={`text-sm font-pixel ${player.isSold ? "text-slate-700" : "text-[#16a249]"}`}>
                                        {lastBid ? lastBid.amount.toFixed(3) : player.marketValue.toFixed(3)} MON
                                    </span>
                                </div>
                                {player.isSold ? (
                                    <button className="bg-slate-300 text-slate-500 px-3 py-2 text-xs font-bold font-pixel cursor-not-allowed" disabled>CLOSED</button>
                                ) : (
                                    <button className="bg-black text-white px-3 py-2 text-xs font-bold font-pixel hover:bg-[#16a249] transition-colors cursor-pointer">BID</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center p-12 text-slate-500 font-code text-lg border-2 border-dashed border-slate-300">
                    No players match your filters.
                </div>
            )}

            {/* Bottom spacer for fixed ticker */}
            <div className="h-14" />

            {/* Fixed Live Activity Ticker */}
            <div className="fixed bottom-0 left-0 w-full bg-[#f0fdf4] border-t-4 border-[#0e1b13] py-2 z-50">
                <div className="flex items-center gap-4 px-4 overflow-hidden whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[#16a249] font-bold shrink-0 font-code text-lg">
                        <div className="size-2 bg-[#22c55e] rounded-full animate-pulse" />
                        LIVE ACTIVITY:
                    </div>
                    <div className="flex gap-12 text-lg font-medium text-[#0e1b13] font-code animate-[marquee_30s_linear_infinite]">
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            MourinhOS placed a bid on Pele (1.176 MON)
                        </span>
                        <span className="flex items-center gap-2 text-slate-500">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            2 mins ago
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                            Guardiola GPT bought Zidane for 0.883 MON
                        </span>
                        <span className="flex items-center gap-2 text-slate-500">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            5 mins ago
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            Simeone Node placed a bid on Maldini (0.45 MON)
                        </span>
                        <span className="flex items-center gap-2 text-slate-500">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            8 mins ago
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                            Klopp Chain acquired Salah for 0.72 MON
                        </span>
                        <span className="flex items-center gap-2 text-slate-500">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            12 mins ago
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            Sir Alex Algo scouting Haaland
                        </span>
                        <span className="flex items-center gap-2 text-slate-500">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            15 mins ago
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
