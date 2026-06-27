export const TOURNAMENT_POOL_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "betAmounts",
    "inputs": [
      { "name": "", "type": "bytes32", "internalType": "bytes32" },
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "closeRoom",
    "inputs": [{ "name": "roomId", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createRoom",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "entryFee", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "declareWinner",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "winnerAddress", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "distributeBetWinners",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "winners", "type": "address[]", "internalType": "address[]" },
      { "name": "amounts", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "enter",
    "inputs": [{ "name": "roomId", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getPlayers",
    "inputs": [{ "name": "roomId", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "address[]", "internalType": "address[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRoom",
    "inputs": [{ "name": "roomId", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [
      { "name": "entryFee", "type": "uint256", "internalType": "uint256" },
      { "name": "entryPool", "type": "uint256", "internalType": "uint256" },
      { "name": "betPool", "type": "uint256", "internalType": "uint256" },
      { "name": "status", "type": "uint8", "internalType": "enum TournamentPool.RoomStatus" },
      { "name": "winner", "type": "address", "internalType": "address" },
      { "name": "players", "type": "address[]", "internalType": "address[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasEntered",
    "inputs": [
      { "name": "", "type": "bytes32", "internalType": "bytes32" },
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "placeBet",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "target", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "event",
    "name": "BetPlaced",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "bettor", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "target", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BetWinnerPaid",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "bettor", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "EntryPaid",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "player", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RoomClosed",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "entryPool", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "betPool", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RoomCreated",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "entryFee", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "WinnerPaid",
    "inputs": [
      { "name": "roomId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "winner", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  { "type": "error", "name": "AlreadyEntered", "inputs": [] },
  { "type": "error", "name": "ArrayLengthMismatch", "inputs": [] },
  { "type": "error", "name": "InvalidTarget", "inputs": [] },
  { "type": "error", "name": "InvalidWinner", "inputs": [] },
  { "type": "error", "name": "NoBetPool", "inputs": [] },
  { "type": "error", "name": "NotOwner", "inputs": [] },
  { "type": "error", "name": "RoomAlreadyExists", "inputs": [] },
  { "type": "error", "name": "RoomNotClosed", "inputs": [] },
  { "type": "error", "name": "RoomNotOpen", "inputs": [] },
  { "type": "error", "name": "TransferFailed", "inputs": [] },
  {
    "type": "error",
    "name": "WrongFee",
    "inputs": [
      { "name": "sent", "type": "uint256", "internalType": "uint256" },
      { "name": "required", "type": "uint256", "internalType": "uint256" }
    ]
  }
] as const
