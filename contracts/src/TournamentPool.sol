// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TournamentPool {

    enum RoomStatus { Open, Closed, Finished }

    struct Room {
        bytes32 id;
        uint256 entryFee;
        uint256 entryPool;
        uint256 betPool;
        RoomStatus status;
        address winner;
        address[] players;
    }

    address public immutable owner;

    mapping(bytes32 => Room) private rooms;
    mapping(bytes32 => mapping(address => bool)) public hasEntered;
    mapping(bytes32 => mapping(address => uint256)) public betAmounts;

    event RoomCreated(bytes32 indexed roomId, uint256 entryFee);
    event EntryPaid(bytes32 indexed roomId, address indexed player, uint256 amount);
    event BetPlaced(bytes32 indexed roomId, address indexed bettor, address indexed target, uint256 amount);
    event RoomClosed(bytes32 indexed roomId, uint256 entryPool, uint256 betPool);
    event WinnerPaid(bytes32 indexed roomId, address indexed winner, uint256 amount);
    event BetWinnerPaid(bytes32 indexed roomId, address indexed bettor, uint256 amount);

    error NotOwner();
    error RoomNotOpen();
    error RoomNotClosed();
    error AlreadyEntered();
    error WrongFee(uint256 sent, uint256 required);
    error RoomAlreadyExists();
    error TransferFailed();
    error InvalidWinner();
    error InvalidTarget();
    error ArrayLengthMismatch();
    error NoBetPool();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createRoom(bytes32 roomId, uint256 entryFee) external onlyOwner {
        if (rooms[roomId].entryFee != 0) revert RoomAlreadyExists();
        rooms[roomId].id = roomId;
        rooms[roomId].entryFee = entryFee;
        rooms[roomId].status = RoomStatus.Open;
        emit RoomCreated(roomId, entryFee);
    }

    function closeRoom(bytes32 roomId) external onlyOwner {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Open) revert RoomNotOpen();
        room.status = RoomStatus.Closed;
        emit RoomClosed(roomId, room.entryPool, room.betPool);
    }

    function declareWinner(bytes32 roomId, address winnerAddress) external onlyOwner {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Closed) revert RoomNotClosed();
        if (!hasEntered[roomId][winnerAddress]) revert InvalidWinner();
        room.winner = winnerAddress;
        room.status = RoomStatus.Finished;
        uint256 payout = room.entryPool;
        room.entryPool = 0;
        (bool ok,) = winnerAddress.call{value: payout}("");
        if (!ok) revert TransferFailed();
        emit WinnerPaid(roomId, winnerAddress, payout);
    }

    function distributeBetWinners(
        bytes32 roomId,
        address[] calldata winners,
        uint256[] calldata amounts
    ) external onlyOwner {
        if (winners.length != amounts.length) revert ArrayLengthMismatch();
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Finished) revert RoomNotClosed();
        if (room.betPool == 0) revert NoBetPool();
        uint256 remaining = room.betPool;
        room.betPool = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            require(amounts[i] <= remaining, "Payout exceeds pool");
            remaining -= amounts[i];
            (bool ok,) = winners[i].call{value: amounts[i]}("");
            if (!ok) revert TransferFailed();
            emit BetWinnerPaid(roomId, winners[i], amounts[i]);
        }
        if (remaining > 0) {
            (bool ok,) = owner.call{value: remaining}("");
            if (!ok) revert TransferFailed();
        }
    }

    function enter(bytes32 roomId) external payable {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Open) revert RoomNotOpen();
        if (hasEntered[roomId][msg.sender]) revert AlreadyEntered();
        if (msg.value != room.entryFee) revert WrongFee(msg.value, room.entryFee);
        hasEntered[roomId][msg.sender] = true;
        room.players.push(msg.sender);
        room.entryPool += msg.value;
        emit EntryPaid(roomId, msg.sender, msg.value);
    }

    function placeBet(bytes32 roomId, address target) external payable {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Open) revert RoomNotOpen();
        if (!hasEntered[roomId][target]) revert InvalidTarget();
        if (betAmounts[roomId][msg.sender] > 0) revert AlreadyEntered();
        if (msg.value == 0) revert WrongFee(0, 1);
        betAmounts[roomId][msg.sender] = msg.value;
        room.betPool += msg.value;
        emit BetPlaced(roomId, msg.sender, target, msg.value);
    }

    function getRoom(bytes32 roomId) external view returns (
        uint256 entryFee,
        uint256 entryPool,
        uint256 betPool,
        RoomStatus status,
        address winner,
        address[] memory players
    ) {
        Room storage room = rooms[roomId];
        return (room.entryFee, room.entryPool, room.betPool, room.status, room.winner, room.players);
    }

    function getPlayers(bytes32 roomId) external view returns (address[] memory) {
        return rooms[roomId].players;
    }
}
