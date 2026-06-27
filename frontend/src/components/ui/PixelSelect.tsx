"use client";

import { useState, useRef, useEffect, useId } from "react";

export interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    /** Optional width class, defaults to min-w-[180px] */
    className?: string;
}

export function PixelSelect({ value, onChange, options, className = "" }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();
    const selected = options.find((o) => o.value === value);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    return (
        <div ref={ref} className={`relative ${className}`} id={id}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${id}-list`}
                className={`
                    flex items-center justify-between gap-6 w-full
                    bg-white border-2 border-slate-900 px-4 py-2
                    font-display font-bold text-slate-900 text-sm
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]
                    hover:border-primary hover:shadow-[4px_4px_0px_0px_rgba(19,236,91,0.25)]
                    transition-colors cursor-pointer
                    ${open ? "border-primary shadow-[4px_4px_0px_0px_rgba(19,236,91,0.25)]" : ""}
                `}
            >
                <span>{selected?.label ?? "Select…"}</span>
                {/* Pixel chevron — rotates when open */}
                <span
                    className="font-pixel text-[8px] text-slate-500 shrink-0 transition-transform duration-150"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    aria-hidden="true"
                >
                    ▼
                </span>
            </button>

            {/* Dropdown list */}
            {open && (
                <ul
                    id={`${id}-list`}
                    role="listbox"
                    aria-label="Options"
                    className="absolute z-50 top-full left-0 mt-[-2px] w-full bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] overflow-hidden"
                >
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <li key={opt.value} role="option" aria-selected={isSelected}>
                                <button
                                    type="button"
                                    className={`
                                        flex items-center gap-2 w-full text-left px-4 py-2
                                        font-display font-semibold text-sm
                                        border-b border-slate-100 last:border-b-0
                                        transition-colors cursor-pointer
                                        ${isSelected
                                            ? "bg-primary/10 text-primary"
                                            : "text-slate-900 hover:bg-primary hover:text-dark-green"
                                        }
                                    `}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                >
                                    {/* Active indicator */}
                                    <span className={`font-pixel text-[6px] shrink-0 w-3 ${isSelected ? "text-primary" : "text-transparent"}`}>
                                        ▶
                                    </span>
                                    {opt.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
