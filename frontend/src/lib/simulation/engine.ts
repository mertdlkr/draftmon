import type {
    SimInput,
    MatchSimulation,
    MatchEvent,
    MatchTick,
    PlayerFrame,
    Pos,
    Player,
} from "./types";
import { SeededRNG, createSeed } from "./seeder";
import { getTactic } from "./tactics";
import {
    buildFormationPositions,
    lerpPos,
    moveToward,
    ROLE_DRIFT_OWN,
    ROLE_DRIFT_OPPONENT,
    computeProximityDrift,
    spatialWeight,
} from "./positions";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_TICKS = 270; // 90 min × 3 ticks/min

// ─── Poisson sampling via Knuth algorithm ────────────────────────────────────

function poissonSample(lambda: number, rng: SeededRNG): number {
    const L = Math.exp(-Math.max(lambda, 0.01));
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= rng.next();
    } while (p > L);
    return k - 1;
}

// ─── Scorer selection ─────────────────────────────────────────────────────────

const BASE_SCORER_WEIGHT: Record<string, number> = {
    ST: 35, CAM: 18, LW: 14, RW: 14,
    CM: 8, CDM: 4, CB: 3, LB: 2, RB: 2, GK: 0,
};

function selectScorer(
    players: Player[],
    rng: SeededRNG,
    override?: Partial<Record<string, number>>,
    formations?: Pos[],
    ballPos?: Pos
): Player {
    const weights = players.map((p, i) => {
        const base = (override ?? BASE_SCORER_WEIGHT)[p.position] ?? 1;
        const shootingBonus = 0.5 + (p.shooting ?? 50) / 100;
        let w = Math.max(base, 0) * shootingBonus;
        // Apply spatial weighting if formation + ball position available
        if (formations && ballPos) {
            w = spatialWeight(w, formations[i], ballPos);
        }
        return w;
    });
    const total = weights.reduce((s, w) => s + w, 0);
    if (total === 0) return players[0];
    let r = rng.next() * total;
    for (let i = 0; i < players.length; i++) {
        r -= weights[i];
        if (r <= 0) return players[i];
    }
    return players[players.length - 1];
}

// ─── Goal time distribution ───────────────────────────────────────────────────

function generateGoalMinutes(count: number, rng: SeededRNG): number[] {
    const minutes: number[] = [];
    const used = new Set<number>();

    for (let i = 0; i < count; i++) {
        let minute: number;
        let attempts = 0;
        do {
            const r = rng.next();
            // Weight: 20% first-30, 35% 31-45, 10% 46-50, 35% 51-90
            if (r < 0.20) {
                minute = rng.int(1, 30);
            } else if (r < 0.55) {
                minute = rng.int(31, 45);
            } else if (r < 0.65) {
                minute = rng.int(46, 50);
            } else {
                minute = rng.int(51, 90);
            }
            attempts++;
        } while (used.has(minute) && attempts < 200);
        used.add(minute);
        minutes.push(minute);
    }
    return minutes.sort((a, b) => a - b);
}

// ─── Event description generators ─────────────────────────────────────────────

const GOAL_DESCS = [
    (p: string) => `${p} fires low into the corner!`,
    (p: string) => `${p} with a thunderbolt strike!`,
    (p: string) => `${p} taps it in from close range!`,
    (p: string) => `${p} heads it powerfully into the net!`,
    (p: string) => `${p} slots it coolly past the keeper!`,
    (p: string) => `${p} with a stunning curled effort — GOAL!`,
];
const PASS_DESCS = [
    (p: string) => `${p} plays it forward.`,
    (p: string) => `${p} with a crisp pass through the lines.`,
    (p: string) => `${p} switches play to the far side.`,
    (p: string) => `${p} finds space and drives forward.`,
];
const TACKLE_DESCS = [
    (p: string) => `${p} wins it back with a crunching tackle!`,
    (p: string) => `${p} intercepts the pass!`,
    (p: string) => `${p} slides in and dispossesses the attacker.`,
];
const SHOT_SAVED_DESCS = [
    (p: string) => `${p} shoots — the keeper makes a great save!`,
    (p: string) => `${p} rattles the crossbar!`,
    (p: string) => `Brilliant stop denies ${p}!`,
];
const SHOT_MISS_DESCS = [
    (p: string) => `${p} fires over the bar!`,
    (p: string) => `${p}'s shot goes wide!`,
    (p: string) => `${p} skies it into the stands!`,
];
const CORNER_DESCS = [(_p: string) => `Corner kick.`, (_p: string) => `The ball goes out for a corner.`];
const FK_DESCS = [(_p: string) => `Free kick awarded.`, (_p: string) => `Referee stops play — free kick.`];
const DRIBBLE_DESCS = [
    (p: string) => `${p} beats a man with a clever step-over.`,
    (p: string) => `${p} drives at the defence!`,
];
const OFFSIDE_DESCS = [(_p: string) => `Offside called.`];
const YELLOW_DESCS = [
    (p: string) => `${p} receives a yellow card!`,
    (p: string) => `Referee books ${p}.`,
];

function pickDesc(arr: ((p: string) => string)[], player: string, rng: SeededRNG): string {
    return rng.pick(arr)(player);
}

// ─── Ball positions by zone (phase-based progression) ─────────────────────────

/** Position based on current phase progression (phaseX tracks buildup advance) */
function phasePos(team: "A" | "B", phaseX: number, rng: SeededRNG): Pos {
    const noise = rng.int(-5, 5);
    const x = Math.max(5, Math.min(95, phaseX + noise));
    return { x, y: rng.int(20, 80) };
}

/** Position for shot/attacking events — snaps to the final third */
function shotPos(team: "A" | "B", rng: SeededRNG): Pos {
    if (team === "A") {
        return { x: rng.int(75, 90), y: rng.int(25, 75) };
    }
    return { x: rng.int(10, 25), y: rng.int(25, 75) };
}

/** Advance phaseX toward the opponent goal by a step */
function advancePhase(team: "A" | "B", phaseX: number, step: number): number {
    if (team === "A") return Math.min(85, phaseX + step);
    return Math.max(15, phaseX - step);
}

/** Starting phaseX for a new possession phase */
function initPhaseX(team: "A" | "B", rng: SeededRNG): number {
    if (team === "A") return 25 + rng.int(0, 10); // own half → midfield
    return 75 - rng.int(0, 10);
}

/** Formation-aware event position — anchors y to acting player's formation slot */
function playerPhasePos(phaseX: number, playerFormationY: number, rng: SeededRNG): Pos {
    const noiseX = rng.int(-5, 5);
    const noiseY = rng.int(-12, 12);
    const x = Math.max(5, Math.min(95, phaseX + noiseX));
    const y = Math.max(10, Math.min(90, playerFormationY + noiseY));
    return { x, y };
}

/** Formation-aware shot position — snaps to final third, anchored to player's lane */
function playerShotPos(team: "A" | "B", playerFormationY: number, rng: SeededRNG): Pos {
    const noiseY = rng.int(-10, 10);
    const y = Math.max(20, Math.min(80, playerFormationY + noiseY));
    if (team === "A") {
        return { x: rng.int(75, 90), y };
    }
    return { x: rng.int(10, 25), y };
}

/** Goal position — uses scorer's y-lane instead of fixed center */
function goalPos(team: "A" | "B", scorerY: number, rng: SeededRNG): Pos {
    const y = Math.max(30, Math.min(70, scorerY + rng.int(-10, 10)));
    if (team === "A") return { x: 90 + rng.int(0, 5), y };
    return { x: 5 + rng.int(0, 5), y };
}

// ─── Main engine ──────────────────────────────────────────────────────────────

export function simulateMatch(input: SimInput): MatchSimulation {
    const { teamA, teamB, power } = input;
    const { scoreA, scoreB } = power;

    // 1. SEED
    const seed = createSeed(scoreA, scoreB);
    const rng = new SeededRNG(seed);

    // 2. COMPUTE GOALS (Poisson-based, guarantees winner)
    const total = scoreA + scoreB || 1;
    const powerShare = scoreA / total;

    const tacticA = getTactic(teamA.strategyId);
    const tacticB = getTactic(teamB.strategyId);

    // Pre-compute formation positions for spatial selection during event generation
    const formationA = buildFormationPositions(teamA.players, "left");
    const formationB = buildFormationPositions(teamB.players, "right");

    // xG shifted slightly by shot rate tactic
    const xgA = (0.5 + powerShare * 3.0) * (0.9 + tacticA.shotRate * 0.1);
    const xgB = (0.5 + (1 - powerShare) * 3.0) * (0.9 + tacticB.shotRate * 0.1);

    let goalsA = poissonSample(xgA, rng);
    let goalsB = poissonSample(xgB, rng);

    // Guarantee winner
    if (scoreA > scoreB && goalsA <= goalsB) goalsA = goalsB + 1;
    if (scoreB > scoreA && goalsB <= goalsA) goalsB = goalsA + 1;
    // Equal power → draw is valid

    // 3. GOAL TIMES & SCORERS
    const totalGoals = goalsA + goalsB;
    const goalMinutes = generateGoalMinutes(totalGoals, rng);

    // Assign goals to teams: first goalsA goals → team A, rest → team B
    // Sort deterministically: interleave based on rng
    const goalTeams: ("A" | "B")[] = [];
    const aSlots = Array.from({ length: goalsA }, () => "A" as const);
    const bSlots = Array.from({ length: goalsB }, () => "B" as const);
    const combined = [...aSlots, ...bSlots];
    // Fisher-Yates shuffle
    for (let i = combined.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    goalTeams.push(...combined);

    // Build goal events with scorer-aware positions + pre-goal buildup
    const goalEvents: MatchEvent[] = [];
    const preGoalEvents: MatchEvent[] = [];

    goalMinutes.forEach((minute, idx) => {
        const team = goalTeams[idx];
        const players = team === "A" ? teamA.players : teamB.players;
        const tactic = team === "A" ? tacticA : tacticB;
        const formations = team === "A" ? formationA : formationB;
        // Ball is near opponent goal during scoring chance
        const goalBallEstimate: Pos = team === "A" ? { x: 85, y: 50 } : { x: 15, y: 50 };
        const scorer = selectScorer(players, rng, tactic.scorerWeightOverride, formations, goalBallEstimate);

        // Look up scorer's formation y-coordinate for spatial coherence
        const scorerIdx = players.findIndex((p) => p.name === scorer.name);
        const scorerY = scorerIdx >= 0 ? formations[scorerIdx].y : 50;

        const pos = goalPos(team, scorerY, rng);

        goalEvents.push({
            id: -1,
            minute,
            second: rng.int(0, 59),
            type: "GOAL",
            team,
            player: scorer.name,
            position: pos,
            description: pickDesc(GOAL_DESCS, scorer.name, rng),
        });

        // Inject a pre-goal buildup event 1 minute before (scorer on the ball)
        const preMinute = minute - 1;
        if (preMinute >= 1 && preMinute !== 45) {
            const preX = team === "A" ? rng.int(70, 82) : rng.int(18, 30);
            const preY = Math.max(15, Math.min(85, pos.y + rng.int(-8, 8)));
            preGoalEvents.push({
                id: -1,
                minute: preMinute,
                second: rng.int(30, 59),
                type: "DRIBBLE",
                team,
                player: scorer.name,
                position: { x: preX, y: preY },
                description: pickDesc(DRIBBLE_DESCS, scorer.name, rng),
            });
        }
    });

    // 4. BUILD FULL EVENT LIST
    const events: MatchEvent[] = [];
    let eventId = 0;

    const addEvent = (e: Omit<MatchEvent, "id">) => {
        events.push({ ...e, id: eventId++ });
    };

    // KICKOFF
    addEvent({
        minute: 0, second: 0, type: "KICKOFF", team: "A", player: "",
        position: { x: 50, y: 50 }, description: "Kick off!",
    });

    // Build possession-phase events between minute 1 and 90
    // Normalise possession
    const posShareA = tacticA.possessionShare / (tacticA.possessionShare + tacticB.possessionShare);
    // Adjust by power delta
    const powerDelta = (scoreA - scoreB) / (total);
    const adjPossA = Math.min(0.8, Math.max(0.2, posShareA + powerDelta * 0.15));

    let currentPossession: "A" | "B" = rng.next() < adjPossA ? "A" : "B";
    let minute = 1;
    let goalIdx = 0;
    let phaseX = initPhaseX(currentPossession, rng);

    // Collect pre-goal minutes for quick lookup
    const preGoalMinuteMap = new Map<number, MatchEvent>();
    for (const pge of preGoalEvents) {
        preGoalMinuteMap.set(pge.minute, pge);
    }

    while (minute <= 89) {
        // Inject pre-goal buildup event if this minute has one
        const preGoal = preGoalMinuteMap.get(minute);
        if (preGoal && !(goalIdx < goalEvents.length && goalEvents[goalIdx].minute === minute)) {
            addEvent({ ...preGoal });
        }

        // Check if a goal fires this minute
        if (goalIdx < goalEvents.length && goalEvents[goalIdx].minute === minute) {
            const ge = goalEvents[goalIdx++];
            addEvent({ ...ge });
            // Change possession after goal
            currentPossession = rng.next() < 0.5 ? "A" : "B";
            phaseX = initPhaseX(currentPossession, rng);
            minute++;
            continue;
        }

        // Half-time marker
        if (minute === 45) {
            addEvent({
                minute: 45, second: 0, type: "HALF_TIME", team: currentPossession,
                player: "", position: { x: 50, y: 50 }, description: "Half time!",
            });
            minute++;
            continue;
        }

        // Build a possession phase
        const tactic = currentPossession === "A" ? tacticA : tacticB;
        const players = currentPossession === "A" ? teamA.players : teamB.players;
        const oppPlayers = currentPossession === "A" ? teamB.players : teamA.players;
        const ownFormations = currentPossession === "A" ? formationA : formationB;
        const oppFormations = currentPossession === "A" ? formationB : formationA;
        const phaseLen = Math.max(1, tactic.buildupLength + rng.int(-1, 1));

        for (let p = 0; p < phaseLen && minute <= 89; p++) {
            if (goalIdx < goalEvents.length && goalEvents[goalIdx].minute === minute) break;
            if (minute === 45) break;

            // Current ball estimate for spatial selection
            const ballEst: Pos = { x: phaseX, y: 50 };

            const r = rng.next();

            if (r < 0.55) {
                // PASS — advance ball up the pitch
                const passer = selectPasser(players, rng, tactic.widePlay, ownFormations, ballEst);
                const passerIdx = players.indexOf(passer);
                const passerY = passerIdx >= 0 ? ownFormations[passerIdx].y : 50;
                phaseX = advancePhase(currentPossession, phaseX, rng.int(5, 10));
                addEvent({
                    minute, second: rng.int(0, 59), type: "PASS",
                    team: currentPossession, player: passer.name,
                    position: playerPhasePos(phaseX, passerY, rng),
                    description: pickDesc(PASS_DESCS, passer.name, rng),
                });
            } else if (r < 0.70) {
                // TACKLE / PRESS by opponent
                const tackler = selectTackler(oppPlayers, rng, oppFormations, ballEst);
                const pressR = currentPossession === "A" ? tacticB.pressIntensity : tacticA.pressIntensity;
                // Tackling stat modulates success: base press * (0.7 + tackling/200)
                const tackleBonus = 0.7 + (tackler.tackling ?? 50) / 200;
                if (rng.next() < pressR * tackleBonus) {
                    const tacklerIdx = oppPlayers.indexOf(tackler);
                    const tacklerY = tacklerIdx >= 0 ? oppFormations[tacklerIdx].y : 50;
                    addEvent({
                        minute, second: rng.int(0, 59), type: "TACKLE",
                        team: currentPossession === "A" ? "B" : "A",
                        player: tackler.name,
                        position: playerPhasePos(phaseX, tacklerY, rng),
                        description: pickDesc(TACKLE_DESCS, tackler.name, rng),
                    });
                    currentPossession = currentPossession === "A" ? "B" : "A";
                    phaseX = initPhaseX(currentPossession, rng);
                    break;
                } else {
                    // Dribble past — big advance
                    const dribbler = selectPasser(players, rng, tactic.widePlay, ownFormations, ballEst);
                    const dribblerIdx = players.indexOf(dribbler);
                    const dribblerY = dribblerIdx >= 0 ? ownFormations[dribblerIdx].y : 50;
                    phaseX = advancePhase(currentPossession, phaseX, rng.int(8, 15));
                    addEvent({
                        minute, second: rng.int(0, 59), type: "DRIBBLE",
                        team: currentPossession, player: dribbler.name,
                        position: playerPhasePos(phaseX, dribblerY, rng),
                        description: pickDesc(DRIBBLE_DESCS, dribbler.name, rng),
                    });
                }
            } else if (r < 0.80) {
                // SHOT attempt (not a goal) — final third
                const shotBallEst: Pos = currentPossession === "A" ? { x: 82, y: 50 } : { x: 18, y: 50 };
                const shooter = selectScorer(players, rng, tactic.scorerWeightOverride, ownFormations, shotBallEst);
                const shooterIdx = players.indexOf(shooter);
                const shooterY = shooterIdx >= 0 ? ownFormations[shooterIdx].y : 50;
                const shotR = rng.next();
                if (shotR < 0.4) {
                    addEvent({
                        minute, second: rng.int(0, 59), type: "SHOT_SAVED",
                        team: currentPossession, player: shooter.name,
                        position: playerShotPos(currentPossession, shooterY, rng),
                        description: pickDesc(SHOT_SAVED_DESCS, shooter.name, rng),
                    });
                    // Corner chance
                    if (rng.next() < 0.4) {
                        addEvent({
                            minute, second: rng.int(30, 59), type: "CORNER",
                            team: currentPossession, player: "",
                            position: currentPossession === "A"
                                ? { x: 100, y: rng.next() < 0.5 ? 0 : 100 }
                                : { x: 0, y: rng.next() < 0.5 ? 0 : 100 },
                            description: rng.pick(CORNER_DESCS)(""),
                        });
                    }
                    currentPossession = currentPossession === "A" ? "B" : "A";
                    phaseX = initPhaseX(currentPossession, rng);
                    break;
                } else {
                    addEvent({
                        minute, second: rng.int(0, 59), type: "SHOT_MISS",
                        team: currentPossession, player: shooter.name,
                        position: playerShotPos(currentPossession, shooterY, rng),
                        description: pickDesc(SHOT_MISS_DESCS, shooter.name, rng),
                    });
                    currentPossession = currentPossession === "A" ? "B" : "A";
                    phaseX = initPhaseX(currentPossession, rng);
                    break;
                }
            } else if (r < 0.87) {
                // FREE KICK — at current phase position
                const fkPlayer = selectPasser(players, rng, false, ownFormations, ballEst);
                const fkIdx = players.indexOf(fkPlayer);
                const fkY = fkIdx >= 0 ? ownFormations[fkIdx].y : 50;
                addEvent({
                    minute, second: rng.int(0, 59), type: "FREE_KICK",
                    team: currentPossession, player: fkPlayer.name,
                    position: playerPhasePos(phaseX, fkY, rng),
                    description: pickDesc(FK_DESCS, fkPlayer.name, rng),
                });
            } else if (r < 0.92) {
                // OFFSIDE — at advanced position beyond current phase
                const offsidePlayer = selectScorer(players, rng, undefined, ownFormations, ballEst);
                const offIdx = players.indexOf(offsidePlayer);
                const offY = offIdx >= 0 ? ownFormations[offIdx].y : 50;
                const offsideX = currentPossession === "A"
                    ? Math.min(90, phaseX + rng.int(5, 15))
                    : Math.max(10, phaseX - rng.int(5, 15));
                addEvent({
                    minute, second: rng.int(0, 59), type: "OFFSIDE",
                    team: currentPossession, player: offsidePlayer.name,
                    position: { x: offsideX, y: Math.max(10, Math.min(90, offY + rng.int(-10, 10))) },
                    description: pickDesc(OFFSIDE_DESCS, offsidePlayer.name, rng),
                });
            } else {
                // YELLOW CARD — at current phase position (opponent fouls)
                const cardPlayer = selectTackler(oppPlayers, rng, oppFormations, ballEst);
                const cardIdx = oppPlayers.indexOf(cardPlayer);
                const cardY = cardIdx >= 0 ? oppFormations[cardIdx].y : 50;
                addEvent({
                    minute, second: rng.int(0, 59), type: "YELLOW_CARD",
                    team: currentPossession === "A" ? "B" : "A",
                    player: cardPlayer.name,
                    position: playerPhasePos(phaseX, cardY, rng),
                    description: pickDesc(YELLOW_DESCS, cardPlayer.name, rng),
                });
            }

            minute++;
        }

        // Switch possession after phase (with probability based on press)
        const switchR = (currentPossession === "A" ? tacticB.pressIntensity : tacticA.pressIntensity) * 0.5;
        if (rng.next() < switchR) {
            currentPossession = currentPossession === "A" ? "B" : "A";
            phaseX = initPhaseX(currentPossession, rng);
        }
        if (minute > 89) break;
        if (goalIdx >= goalEvents.length || goalEvents[goalIdx].minute > minute) {
            minute++;
        }
    }

    // Ensure remaining goal events are added (edge case)
    while (goalIdx < goalEvents.length) {
        const ge = goalEvents[goalIdx++];
        addEvent({ ...ge });
    }

    // FULL TIME
    addEvent({
        minute: 90, second: 0, type: "FULL_TIME", team: currentPossession,
        player: "", position: { x: 50, y: 50 }, description: "Full time!",
    });

    // Sort events chronologically
    events.sort((a, b) => a.minute !== b.minute ? a.minute - b.minute : a.second - b.second);
    events.forEach((e, i) => { e.id = i; });

    // 5. BUILD TICKS (formations already computed above for spatial selection)
    // Initial player positions = formation
    let currentPosA: Pos[] = formationA.map((p) => ({ ...p }));
    let currentPosB: Pos[] = formationB.map((p) => ({ ...p }));

    const ticks: MatchTick[] = [];
    let eventPointer = 0;

    for (let tick = 0; tick < TOTAL_TICKS; tick++) {
        const tickMinute = Math.floor((tick / TOTAL_TICKS) * 90);
        const t = tick / TOTAL_TICKS;

        // Find surrounding events for ball position interpolation
        let prevEvent = events[0];
        let nextEvent = events[events.length - 1];
        for (let ei = 0; ei < events.length - 1; ei++) {
            const eMin = events[ei].minute / 90;
            const eMinNext = events[ei + 1].minute / 90;
            if (t >= eMin && t <= eMinNext) {
                prevEvent = events[ei];
                nextEvent = events[ei + 1];
                break;
            }
        }

        const span = (nextEvent.minute - prevEvent.minute) / 90;
        const localT = span > 0 ? Math.min(1, (t - prevEvent.minute / 90) / span) : 0;
        const ballPosition = lerpPos(prevEvent.position, nextEvent.position, localT);

        // Active event for this tick
        while (
            eventPointer < events.length - 1 &&
            events[eventPointer + 1].minute / 90 <= t
        ) {
            eventPointer++;
        }
        const activeEvent = events[eventPointer]?.minute === tickMinute ? events[eventPointer] : undefined;

        // Current possession from nearest event
        const nearPossession: "A" | "B" = events[eventPointer]?.team ?? "A";

        // Move players (proximity-aware drift + goal scorer snap)
        const maxStep = 1.5; // % of pitch per tick

        // Snap scorer to ball on goal ticks
        const isGoalTick = activeEvent?.type === "GOAL";
        const goalScorerName = isGoalTick ? activeEvent.player : null;
        const goalTeam = isGoalTick ? activeEvent.team : null;

        currentPosA = teamA.players.map((player, i) => {
            // Snap scorer to ball on goal tick
            if (goalTeam === "A" && player.name === goalScorerName) {
                return { ...ballPosition };
            }
            const formation = formationA[i];
            const baseDrift =
                nearPossession === "A"
                    ? (ROLE_DRIFT_OWN[player.position] ?? 0.4)
                    : (ROLE_DRIFT_OPPONENT[player.position] ?? 0.2);
            const drift = computeProximityDrift(baseDrift, formation, ballPosition);
            const target = nearPossession === "A"
                ? lerpPos(formation, ballPosition, drift)
                : lerpPos(formation, { x: 6, y: 50 }, drift * 0.5); // retreat toward own goal
            const pace = (player.pace ?? 50) / 50; // 1.0 = average
            return moveToward(currentPosA[i], target, maxStep * pace);
        });

        currentPosB = teamB.players.map((player, i) => {
            // Snap scorer to ball on goal tick
            if (goalTeam === "B" && player.name === goalScorerName) {
                return { ...ballPosition };
            }
            const formation = formationB[i];
            const baseDrift =
                nearPossession === "B"
                    ? (ROLE_DRIFT_OWN[player.position] ?? 0.4)
                    : (ROLE_DRIFT_OPPONENT[player.position] ?? 0.2);
            const drift = computeProximityDrift(baseDrift, formation, ballPosition);
            const target = nearPossession === "B"
                ? lerpPos(formation, ballPosition, drift)
                : lerpPos(formation, { x: 94, y: 50 }, drift * 0.5);
            const pace = (player.pace ?? 50) / 50;
            return moveToward(currentPosB[i], target, maxStep * pace);
        });

        const playersA: PlayerFrame[] = teamA.players.map((p, i) => ({
            name: p.name,
            position: { ...currentPosA[i] },
        }));
        const playersB: PlayerFrame[] = teamB.players.map((p, i) => ({
            name: p.name,
            position: { ...currentPosB[i] },
        }));

        ticks.push({
            tick,
            minute: tickMinute,
            ballPosition,
            possession: nearPossession,
            playersA,
            playersB,
            activeEvent,
        });
    }

    return { seed, goalsA, goalsB, events, ticks };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Base passer weight by position — midfielders and fullbacks distribute the ball */
const BASE_PASSER_WEIGHT: Record<string, number> = {
    GK: 1, CB: 3, LB: 8, RB: 8,
    CDM: 15, CM: 20, CAM: 18,
    LW: 10, RW: 10, ST: 4,
};

function selectPasser(
    players: Player[],
    rng: SeededRNG,
    widePlay: boolean,
    formations?: Pos[],
    ballPos?: Pos
): Player {
    const weights = players.map((p, i) => {
        let base = BASE_PASSER_WEIGHT[p.position] ?? 5;
        // Boost wingers if widePlay tactic
        if (widePlay && (p.position === "LW" || p.position === "RW")) {
            base *= 2.5;
        }
        // Passing stat bonus: 0.5 (passing=0) to 1.5 (passing=100)
        const passingBonus = 0.5 + (p.passing ?? 50) / 100;
        let w = base * passingBonus;
        // Spatial weighting
        if (formations && ballPos) {
            w = spatialWeight(w, formations[i], ballPos);
        }
        return w;
    });
    const total = weights.reduce((s, w) => s + w, 0);
    if (total === 0) return players[0];
    let r = rng.next() * total;
    for (let i = 0; i < players.length; i++) {
        r -= weights[i];
        if (r <= 0) return players[i];
    }
    return players[players.length - 1];
}

/** Select a tackler from opponent squad — weighted by tackling stat + proximity */
function selectTackler(
    oppPlayers: Player[],
    rng: SeededRNG,
    formations?: Pos[],
    ballPos?: Pos
): Player {
    const weights = oppPlayers.map((p, i) => {
        // Defenders and CDMs tackle more
        const posWeight: Record<string, number> = {
            GK: 0, CB: 20, LB: 15, RB: 15,
            CDM: 18, CM: 10, CAM: 5,
            LW: 3, RW: 3, ST: 2,
        };
        const base = posWeight[p.position] ?? 5;
        const tacklingBonus = 0.5 + (p.tackling ?? 50) / 100;
        let w = base * tacklingBonus;
        if (formations && ballPos) {
            w = spatialWeight(w, formations[i], ballPos);
        }
        return w;
    });
    const total = weights.reduce((s, w) => s + w, 0);
    if (total === 0) return oppPlayers[0];
    let r = rng.next() * total;
    for (let i = 0; i < oppPlayers.length; i++) {
        r -= weights[i];
        if (r <= 0) return oppPlayers[i];
    }
    return oppPlayers[oppPlayers.length - 1];
}
