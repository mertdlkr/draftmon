interface Props {
    label: string;
    value: number;
    max?: number;
    colorClass?: string;
    color?: string;
}

export function PixelStatBar({ label, value, max = 20, colorClass, color }: Props) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
        <div className="flex items-center justify-between text-[10px] font-pixel gap-2">
            <span className="text-slate-500 w-8 shrink-0">{label}</span>
            <div className="flex-1 relative bg-gray-200 border-2 border-slate-900" style={{ height: "12px" }}>
                <div
                    className={colorClass}
                    style={{
                        height: "100%",
                        width: `${pct}%`,
                        color: color,
                        backgroundImage: "repeating-linear-gradient(90deg, currentColor, currentColor 4px, transparent 4px, transparent 6px)",
                    }}
                />
            </div>
            <span className="text-slate-400 w-5 text-right shrink-0">{value}</span>
        </div>
    );
}
