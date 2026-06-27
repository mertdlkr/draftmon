export interface TacticMod {
    possessionShare: number;  // 0–1 relative weight, normalized vs opponent
    pressIntensity: number;   // 0–1 probability of tackle/press event per phase
    buildupLength: number;    // avg passes per possession phase (2–8)
    shotRate: number;         // shots per 90 min modifier (0.7–1.4)
    widePlay: boolean;        // wing players more active
    longBall: boolean;        // GK passes go directly to ST
    scorerWeightOverride?: Partial<Record<string, number>>;
}

export const TACTIC_MODS: Record<number, TacticMod> = {
    1: {
        possessionShare: 0.45,
        pressIntensity: 0.7,
        buildupLength: 3,
        shotRate: 1.2,
        widePlay: false,
        longBall: false,
    },
    2: {
        possessionShare: 0.65,
        pressIntensity: 0.2,
        buildupLength: 7,
        shotRate: 0.85,
        widePlay: false,
        longBall: false,
    },
    3: {
        possessionShare: 0.35,
        pressIntensity: 0.3,
        buildupLength: 2,
        shotRate: 1.1,
        widePlay: false,
        longBall: true,
        scorerWeightOverride: { ST: 50, LW: 12, RW: 12 },
    },
    4: {
        possessionShare: 0.30,
        pressIntensity: 0.5,
        buildupLength: 2,
        shotRate: 0.6,
        widePlay: false,
        longBall: true,
    },
    5: {
        possessionShare: 0.50,
        pressIntensity: 0.35,
        buildupLength: 5,
        shotRate: 1.05,
        widePlay: true,
        longBall: false,
        scorerWeightOverride: { LW: 28, RW: 28, ST: 25, CAM: 12 },
    },
    6: {
        possessionShare: 0.52,
        pressIntensity: 0.40,
        buildupLength: 4,
        shotRate: 1.0,
        widePlay: false,
        longBall: false,
        scorerWeightOverride: { CAM: 30, CM: 20, ST: 30 },
    },
};

// Fallback for unknown strategy IDs
export const DEFAULT_TACTIC: TacticMod = TACTIC_MODS[2];

export function getTactic(strategyId: number): TacticMod {
    return TACTIC_MODS[strategyId] ?? DEFAULT_TACTIC;
}
