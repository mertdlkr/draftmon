"use client";

import { useRef, useCallback } from "react";

type PixelSliderVariant = "dark" | "light";

interface Props {
    /** Current value (0–max) */
    value: number;
    /** Maximum value */
    max: number;
    /** Callback when the user clicks or drags to a new value */
    onChange: (value: number) => void;
    /** Visual variant — "dark" for dark panels, "light" for light pages */
    variant?: PixelSliderVariant;
    /** Track height in px (default 6) */
    trackHeight?: number;
    /** Thumb size in px (default 14) */
    thumbSize?: number;
    /** Total clickable area height in px (default 20) */
    height?: number;
    /** Optional className for the outer container */
    className?: string;
}

const THEME = {
    dark: {
        track: "rgba(255,255,255,0.1)",
        trackBorder: "rgba(255,255,255,0.08)",
        fill: "var(--color-primary)",
        thumb: "var(--color-primary)",
        thumbBorder: "#0f172a",
        thumbHover: "var(--color-primary-dim)",
    },
    light: {
        track: "rgba(0,0,0,0.08)",
        trackBorder: "rgba(0,0,0,0.06)",
        fill: "var(--color-primary-dark)",
        thumb: "var(--color-primary-dark)",
        thumbBorder: "#fff",
        thumbHover: "var(--color-primary-deep)",
    },
} as const;

export function PixelSlider({
    value,
    max,
    onChange,
    variant = "dark",
    trackHeight = 6,
    thumbSize = 14,
    height = 20,
    className,
}: Props) {
    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const pct = max > 0 ? (value / max) * 100 : 0;
    const t = THEME[variant];

    const computeValue = useCallback(
        (clientX: number) => {
            if (!trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, x / rect.width));
            onChange(Math.round(ratio * max));
        },
        [max, onChange],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            draggingRef.current = true;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            computeValue(e.clientX);
        },
        [computeValue],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!draggingRef.current) return;
            computeValue(e.clientX);
        },
        [computeValue],
    );

    const handlePointerUp = useCallback(() => {
        draggingRef.current = false;
    }, []);

    return (
        <div
            ref={trackRef}
            className={className}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
                position: "relative",
                width: "100%",
                flex: 1,
                height,
                cursor: "pointer",
                touchAction: "none",
                userSelect: "none",
            }}
        >
            {/* Track */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "100%",
                    height: trackHeight,
                    background: t.track,
                    border: `1px solid ${t.trackBorder}`,
                }}
            />

            {/* Fill */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: `${pct}%`,
                    height: trackHeight,
                    background: t.fill,
                    transition: draggingRef.current ? "none" : "width 0.05s linear",
                }}
            />

            {/* Thumb */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: `${pct}%`,
                    transform: "translate(-50%, -50%)",
                    width: thumbSize,
                    height: thumbSize,
                    background: t.thumb,
                    border: `2px solid ${t.thumbBorder}`,
                    boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.2)",
                    transition: "background 0.1s",
                }}
            />
        </div>
    );
}
