const PALETTE = [
    "#2563eb","#dc2626","#d97706","#7c3aed",
    "#991b1b","#0ea5e9","#1e3a8a","#b91c1c",
    "#15803d","#e11d48","#0891b2","#65a30d",
];

export function getManagerColor(name: string): string {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return PALETTE[h % PALETTE.length];
}

export function getManagerInitials(name: string): string {
    return name.split(/\s+/).map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

interface Props {
    name: string;
    /** Override the auto-derived color */
    color?: string;
    size?: number;
    className?: string;
}

export function ManagerAvatar({ name, color, size = 64, className = "" }: Props) {
    const bg = color ?? getManagerColor(name);
    const initials = getManagerInitials(name);
    const fontSize = Math.max(10, Math.round(size * 0.28));

    return (
        <div
            className={`flex items-center justify-center border-2 border-black font-pixel text-white shrink-0 select-none ${className}`}
            style={{ width: size, height: size, background: bg, imageRendering: "pixelated", fontSize }}
        >
            {initials}
        </div>
    );
}
