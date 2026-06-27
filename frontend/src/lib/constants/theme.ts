/**
 * Brand design tokens for MonaDraft.
 *
 * These match the CSS custom properties defined in globals.css @theme.
 * Use CSS var references (e.g. "var(--color-primary)") for inline styles in JSX.
 * Use the hex values here when CSS vars aren't available (e.g. SVG props, Canvas).
 */

/** Brand hex values — use only when CSS vars are unavailable */
export const BRAND_HEX = {
    primary:     "#13ec5b",   // --color-primary
    primaryDim:  "#0ea640",   // --color-primary-dim
    primaryDark: "#16a249",   // --color-primary-dark
    primaryDeep: "#15803d",   // --color-primary-deep
    darkGreen:   "#0d1b12",   // --color-dark-green
    bgDarkest:   "#071009",   // --color-bg-darkest
    borderGreen: "#cfe7d7",   // --color-border-green
} as const;

/** CSS variable references for use in JSX inline styles */
export const BRAND_VAR = {
    primary:     "var(--color-primary)",
    primaryDim:  "var(--color-primary-dim)",
    primaryDark: "var(--color-primary-dark)",
    primaryDeep: "var(--color-primary-deep)",
    darkGreen:   "var(--color-dark-green)",
    bgDarkest:   "var(--color-bg-darkest)",
    borderGreen: "var(--color-border-green)",
} as const;

/** Stat quality colors (used in SquadTable, PixelStatBar) */
export const STAT_COLORS = {
    excellent: "#13ec5b",  // ≥ 85
    good:      "#3b82f6",  // ≥ 70
    average:   "#f59e0b",  // ≥ 55
    poor:      "#94a3b8",  // < 55
} as const;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
