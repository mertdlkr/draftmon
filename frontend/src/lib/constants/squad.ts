/**
 * Squad / position constants shared across SquadTable, stats views, etc.
 */

/** Sort order for positions (lower = closer to GK) */
export const POS_ORDER: Record<string, number> = {
    GK: 0,
    CB: 1, LB: 2, RB: 3,
    CDM: 4, CM: 5, CAM: 6,
    LW: 7, RW: 8, ST: 9,
};

/** Per-position accent color */
export const POS_COLOR: Record<string, string> = {
    GK: "#f59e0b",
    CB: "#13ec5b", LB: "#13ec5b", RB: "#13ec5b",
    CDM: "#3b82f6", CM: "#3b82f6", CAM: "#3b82f6",
    LW: "#8b5cf6", RW: "#8b5cf6",
    ST: "#ef4444",
};

/** Position → display group key */
export const POS_GROUP: Record<string, string> = {
    GK: "GK",
    CB: "DEF", LB: "DEF", RB: "DEF",
    CDM: "MID", CM: "MID", CAM: "MID",
    LW: "ATT", RW: "ATT", ST: "ATT",
};

/** Group key → human label */
export const GROUP_LABEL: Record<string, string> = {
    GK: "Goalkeeper",
    DEF: "Defenders",
    MID: "Midfielders",
    ATT: "Attackers",
};

/** Group key → accent color */
export const GROUP_COLOR: Record<string, string> = {
    GK: "#f59e0b",
    DEF: "#13ec5b",
    MID: "#3b82f6",
    ATT: "#ef4444",
};

/** Canonical group render order */
export const GROUP_ORDER = ["GK", "DEF", "MID", "ATT"] as const;

/** Convert a raw stat value (0-100) to a dot-fill count (1-5) */
export function statDots(val: number): number {
    if (val >= 85) return 5;
    if (val >= 70) return 4;
    if (val >= 55) return 3;
    if (val >= 40) return 2;
    return 1;
}

/** Color for a raw stat value */
export function statColor(val: number): string {
    if (val >= 85) return "#13ec5b";
    if (val >= 70) return "#3b82f6";
    if (val >= 55) return "#f59e0b";
    return "#94a3b8";
}
