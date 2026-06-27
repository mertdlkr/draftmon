/**
 * Public API for the MonaDraft contract data library.
 * Import from here in Server Components and Route Handlers.
 *
 * @example
 * import { fetchLeagueSummary, fetchTournamentDetail, STRATEGIES } from "@/lib/contracts";
 */

export * from "./types";
export * from "./strategies";
export * from "./queries";
export { getContract, getProvider } from "./client";
export { MONAD_LEAGUE_ABI } from "./abi";
