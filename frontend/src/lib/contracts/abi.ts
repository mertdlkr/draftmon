// TournamentPool ABI — stub until WP1 deploys the contract.
// After deploy: replace with output of `forge build` → out/TournamentPool.sol/TournamentPool.json
export const TOURNAMENT_POOL_ABI = [
  // Owner — room management
  'function createRoom(bytes32 roomId, uint256 entryFee) external',
  'function closeRoom(bytes32 roomId) external',
  'function declareWinner(bytes32 roomId, address winnerAddress) external',
  'function distributeBetWinners(bytes32 roomId, address[] calldata winners, uint256[] calldata amounts) external',
  // Player
  'function enter(bytes32 roomId) external payable',
  // Bettor
  'function placeBet(bytes32 roomId, address target) external payable',
  // Views
  'function getRoom(bytes32 roomId) external view returns (uint256 entryFee, uint256 entryPool, uint256 betPool, uint8 status, address winner, address[] memory players)',
  'function getPlayers(bytes32 roomId) external view returns (address[] memory)',
  // Events
  'event RoomCreated(bytes32 indexed roomId, uint256 entryFee)',
  'event EntryPaid(bytes32 indexed roomId, address indexed player, uint256 amount)',
  'event BetPlaced(bytes32 indexed roomId, address indexed bettor, address indexed target, uint256 amount)',
  'event RoomClosed(bytes32 indexed roomId, uint256 entryPool, uint256 betPool)',
  'event WinnerPaid(bytes32 indexed roomId, address indexed winner, uint256 amount)',
  'event BetWinnerPaid(bytes32 indexed roomId, address indexed bettor, uint256 amount)',
] as const
