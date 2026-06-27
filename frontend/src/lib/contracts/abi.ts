export const MONAD_LEAGUE_ABI = [
    // ── View: State ─────────────────────────────────────────────────────────────
    "function admin() external view returns (address)",
    "function entryFee() external view returns (uint256)",
    "function currentTournamentId() external view returns (uint256)",

    // ── View: Agents ────────────────────────────────────────────────────────────
    "function getRegisteredAgents() external view returns (address[])",
    "function agents(address) external view returns (string name, uint8 attack, uint8 defense, uint8 discipline, bool isRegistered)",

    // ── View: Tournaments ───────────────────────────────────────────────────────
    // Note: tournaments() auto-getter does NOT return participants[]. Use getParticipants().
    "function tournaments(uint256) external view returns (uint256 id, uint8 tType, uint8 state, uint256 prizePool, address champion)",
    "function getParticipants(uint256 _tId) external view returns (address[])",

    // ── View: Entries ───────────────────────────────────────────────────────────
    "function getTournamentEntry(uint256 _tId, address _agent) external view returns (bool hasEntered, bool hasTeam, uint8 strategyId, string reasoning, tuple(string name, string position, uint8 pace, uint8 shooting, uint8 passing, uint8 tackling)[11] team)",

    // ── View: Matches ───────────────────────────────────────────────────────────
    "function getMatches(uint256 _tId) external view returns (tuple(address teamA, address teamB, address winner, uint256 scoreA, uint256 scoreB)[])",

    // ── Events ──────────────────────────────────────────────────────────────────
    "event AgentRegistered(address indexed agentWallet, string name)",
    "event TournamentCreated(uint256 indexed tournamentId, uint8 tType)",
    "event AgentEnteredTournament(uint256 indexed tournamentId, address indexed agentWallet)",
    "event TournamentEnded(uint256 indexed tournamentId, address indexed champion, uint256 prizePool)",
    "event StrategyCommitted(uint256 indexed tournamentId, address indexed agentWallet, uint8 strategyId, string reasoning)",
] as const;
