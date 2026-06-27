/**
 * GET /api/live?tId=<tournamentId>
 *
 * Server-Sent Events (SSE) endpoint that streams live tournament state to the client.
 * Polls the Monad RPC every 5 seconds, diffs state, and pushes only changes.
 *
 * Lifecycle:
 *  - Starts polling when a client connects
 *  - Stops polling IMMEDIATELY when:
 *    • Client disconnects (browser closed, navigation away)
 *    • The request's AbortSignal fires (Next.js edge disconnect detection)
 *    • The stream's cancel() is called
 *
 * This ensures zero wasted RPC calls when nobody is viewing the Live page.
 */

import { NextRequest } from "next/server";
import { fetchLiveTournamentState } from "@/lib/contracts";
import type { LiveTournamentState } from "@/lib/contracts";

const POLL_INTERVAL_MS = 5000;

function serialize(eventName: string, data: unknown): string {
    return `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}

function snapshotSignature(state: LiveTournamentState): string {
    return JSON.stringify({
        s: state.state,
        c: state.champion,
        p: state.participants.map((p) => ({
            a: p.profile.address,
            ht: p.hasTeam,
            sc: p.strategyCommitted,
            sid: p.strategyId,
        })),
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tId = Number(searchParams.get("tId") ?? "1");

    if (isNaN(tId) || tId < 1) {
        return new Response("Invalid tId", { status: 400 });
    }

    const encoder = new TextEncoder();
    let lastSignature = "";
    let lastParticipantCount = 0;
    let lastStrategyCount = 0;
    let isClosed = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    // Listen for client disconnect via AbortSignal (works in Next.js Edge & Node)
    const abortSignal = req.signal;
    abortSignal?.addEventListener("abort", () => {
        isClosed = true;
        if (pollTimer) clearTimeout(pollTimer);
    });

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (name: string, data: unknown) => {
                if (isClosed) return;
                try {
                    controller.enqueue(encoder.encode(serialize(name, data)));
                } catch {
                    isClosed = true;
                    if (pollTimer) clearTimeout(pollTimer);
                }
            };

            const poll = async () => {
                if (isClosed) return;

                try {
                    const state = await fetchLiveTournamentState(tId);
                    const sig = snapshotSignature(state);

                    if (sig !== lastSignature) {
                        sendEvent("snapshot", state);

                        const currentParticipantCount = state.participants.length;
                        const currentStrategyCount = state.participants.filter((p) => p.strategyCommitted).length;

                        if (lastSignature !== "" && currentParticipantCount > lastParticipantCount) {
                            const newest = state.participants[currentParticipantCount - 1];
                            sendEvent("participant_joined", { agent: newest.profile, spotsLeft: state.spotsLeft });
                        }

                        if (currentStrategyCount > lastStrategyCount) {
                            const newlyCommitted = state.participants.filter((p) => p.strategyCommitted).slice(lastStrategyCount);
                            for (const p of newlyCommitted) {
                                sendEvent("strategy_revealed", {
                                    agent: p.profile,
                                    strategyId: p.strategyId,
                                    strategyName: p.strategyName,
                                    reasoning: p.reasoning,
                                });
                            }
                        }

                        if (state.state === 3 /* COMPLETED */ && lastSignature !== "") {
                            sendEvent("tournament_ended", { champion: state.champion, prizePool: state.prizePool });
                        }

                        lastParticipantCount = currentParticipantCount;
                        lastStrategyCount = currentStrategyCount;
                        lastSignature = sig;
                    }
                } catch (err) {
                    // Silently retry on RPC rate-limit errors (15/sec on Monad Testnet)
                    const errStr = String(err);
                    const isRateLimit = errStr.includes("CALL_EXCEPTION") || errStr.includes("requests limited");
                    if (!isRateLimit) {
                        sendEvent("error", { message: errStr });
                    }
                }

                if (!isClosed) {
                    pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
                }
            };

            await poll();
        },
        cancel() {
            isClosed = true;
            if (pollTimer) clearTimeout(pollTimer);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
