"use client";

/**
 * useLiveTournament
 *
 * React hook that connects to the /api/live SSE endpoint and provides
 * real-time tournament state updates.
 *
 * Key behavior:
 *  - Automatically DISCONNECTS when the browser tab is hidden or user navigates away
 *  - Automatically RECONNECTS when the tab becomes visible again
 *  - This prevents wasted RPC calls when the Live page isn't actively viewed
 *
 * Usage:
 *   const { state, isConnected, error } = useLiveTournament(1);
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveTournamentState } from "@/lib/contracts";

export type LiveEventType =
    | "snapshot"
    | "participant_joined"
    | "strategy_revealed"
    | "tournament_ended"
    | "error";

interface UseLiveTournamentResult {
    /** Latest full tournament state (null while loading) */
    state: LiveTournamentState | null;
    /** Whether the SSE stream is currently connected */
    isConnected: boolean;
    /** Any error message from the stream */
    error: string | null;
    /** Recent events for notification toasts (last 10) */
    recentEvents: RecentEvent[];
}

export interface RecentEvent {
    type: LiveEventType;
    timestamp: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
}

export function useLiveTournament(tId: number | null): UseLiveTournamentResult {
    const [state, setState] = useState<LiveTournamentState | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const sourceRef = useRef<EventSource | null>(null);

    const pushEvent = useCallback((type: LiveEventType, payload: unknown) => {
        setRecentEvents((prev) =>
            [{ type, timestamp: Date.now(), payload }, ...prev].slice(0, 10)
        );
    }, []);

    useEffect(() => {
        if (tId === null) return;

        /** Open a fresh SSE connection */
        function connect() {
            // Close any stale connection first
            sourceRef.current?.close();

            const es = new EventSource(`/api/live?tId=${tId}`);
            sourceRef.current = es;

            es.addEventListener("open", () => {
                setIsConnected(true);
                setError(null);
            });

            es.addEventListener("snapshot", (e) => {
                setState(JSON.parse(e.data) as LiveTournamentState);
            });

            es.addEventListener("participant_joined", (e) => {
                pushEvent("participant_joined", JSON.parse(e.data));
            });

            es.addEventListener("strategy_revealed", (e) => {
                pushEvent("strategy_revealed", JSON.parse(e.data));
            });

            es.addEventListener("tournament_ended", (e) => {
                pushEvent("tournament_ended", JSON.parse(e.data));
            });

            es.addEventListener("error", (e) => {
                if (es.readyState === EventSource.CLOSED) {
                    setIsConnected(false);
                    setError("Connection closed — will retry...");
                } else if ("data" in e) {
                    const { message } = JSON.parse((e as MessageEvent).data);
                    setError(message);
                    pushEvent("error", { message });
                }
            });
        }

        /** Close the SSE connection */
        function disconnect() {
            sourceRef.current?.close();
            sourceRef.current = null;
            setIsConnected(false);
        }

        /** Pause/resume based on page visibility */
        function handleVisibility() {
            if (document.hidden) {
                disconnect();
            } else {
                connect();
            }
        }

        // Start connected only if page is visible
        if (!document.hidden) {
            connect();
        }

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            disconnect();
        };
    }, [tId, pushEvent]);

    return { state, isConnected, error, recentEvents };
}
