import type { Pos } from "./types";

// ─── Formation Slots (% of pitch) ────────────────────────────────────────────
// Pitch is 600×400 SVG. Team A attacks right, Team B attacks left.
// These match FootballPitch.tsx exactly so static and animated views are consistent.

export const LEFT_POSITIONS: Record<string, Pos[]> = {
    GK:  [{ x: 6,  y: 50 }],
    CB:  [{ x: 20, y: 35 }, { x: 20, y: 65 }, { x: 20, y: 50 }],
    LB:  [{ x: 17, y: 85 }],
    RB:  [{ x: 17, y: 15 }],
    CDM: [{ x: 30, y: 40 }, { x: 30, y: 60 }],
    CM:  [{ x: 33, y: 35 }, { x: 33, y: 65 }, { x: 33, y: 50 }],
    CAM: [{ x: 38, y: 50 }, { x: 38, y: 35 }, { x: 38, y: 65 }],
    LW:  [{ x: 42, y: 18 }],
    RW:  [{ x: 42, y: 82 }],
    ST:  [{ x: 44, y: 50 }, { x: 44, y: 38 }, { x: 44, y: 62 }],
};

function buildRightPositions(): Record<string, Pos[]> {
    const mirrored: Record<string, Pos[]> = {};
    for (const [pos, coords] of Object.entries(LEFT_POSITIONS)) {
        let key = pos;
        if (pos === "LB") key = "RB";
        else if (pos === "RB") key = "LB";
        else if (pos === "LW") key = "RW";
        else if (pos === "RW") key = "LW";

        if (!mirrored[key]) mirrored[key] = [];
        mirrored[key].push(...coords.map((c) => ({ x: 100 - c.x, y: c.y })));
    }
    return mirrored;
}

export const RIGHT_POSITIONS = buildRightPositions();

/** Assign each player their static formation position (index-aware) */
export function buildFormationPositions(
    players: { position: string }[],
    side: "left" | "right"
): Pos[] {
    const table = side === "left" ? LEFT_POSITIONS : RIGHT_POSITIONS;
    const counters = new Map<string, number>();
    return players.map((p) => {
        const pos = p.position || "CM";
        const slots = table[pos] ?? table["CM"];
        const idx = counters.get(pos) ?? 0;
        counters.set(pos, idx + 1);
        return slots[idx % slots.length];
    });
}

// ─── Interpolation ────────────────────────────────────────────────────────────

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function lerpPos(a: Pos, b: Pos, t: number): Pos {
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/**
 * Move player toward a target point up to `maxStep` units per tick (% of pitch).
 * Returns a new position moved at most `maxStep` toward `target`.
 */
export function moveToward(current: Pos, target: Pos, maxStep: number): Pos {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= maxStep) return target;
    const ratio = maxStep / dist;
    return { x: current.x + dx * ratio, y: current.y + dy * ratio };
}

// ─── Role drift weights toward ball ──────────────────────────────────────────
// 1.0 = attackers chase ball hard; 0.0 = keeper stays put

export const ROLE_DRIFT_OWN: Record<string, number> = {
    GK: 0.05, CB: 0.15, LB: 0.25, RB: 0.25,
    CDM: 0.35, CM: 0.55, CAM: 0.70,
    LW: 0.80, RW: 0.80, ST: 0.90,
};

export const ROLE_DRIFT_OPPONENT: Record<string, number> = {
    GK: 0.02, CB: 0.10, LB: 0.15, RB: 0.15,
    CDM: 0.20, CM: 0.30, CAM: 0.40,
    LW: 0.50, RW: 0.50, ST: 0.60,
};

// ─── Proximity utilities ──────────────────────────────────────────────────────

const PITCH_DIAGONAL = Math.sqrt(100 * 100 + 100 * 100); // ~141.4

/**
 * Proximity factor: 1.0 when formation position is at ball, 0.0 at far corner.
 */
export function proximityFactor(formationPos: Pos, ballPos: Pos): number {
    const dx = formationPos.x - ballPos.x;
    const dy = formationPos.y - ballPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return 1 - dist / PITCH_DIAGONAL;
}

/**
 * Modulates base drift by how close the ball is to the player's home position.
 * When ball is near: drift stays close to base. When far: drift is dampened.
 */
export function computeProximityDrift(
    baseDrift: number,
    formationPos: Pos,
    ballPos: Pos
): number {
    return baseDrift * (0.4 + 0.6 * proximityFactor(formationPos, ballPos));
}

/**
 * Compute a spatial weight for player selection.
 * Combines a base weight with proximity to the ball position.
 * Floor of 0.3 ensures distant players can still occasionally be picked.
 */
export function spatialWeight(
    baseWeight: number,
    formationPos: Pos,
    ballPos: Pos
): number {
    const prox = proximityFactor(formationPos, ballPos);
    return baseWeight * (0.3 + 0.7 * prox);
}
