// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/TournamentPool.sol";

contract TournamentPoolTest is Test {
    TournamentPool pool;

    address owner;
    address player1;
    address player2;
    address player3;
    address player4;
    address bettor1;
    address bettor2;
    address outsider;

    bytes32 constant ROOM_A = keccak256("roomA");
    bytes32 constant ROOM_B = keccak256("roomB");
    uint256 constant ENTRY_FEE = 0.01 ether;

    function setUp() public {
        owner   = address(this);
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");
        player4 = makeAddr("player4");
        bettor1 = makeAddr("bettor1");
        bettor2 = makeAddr("bettor2");
        outsider = makeAddr("outsider");

        pool = new TournamentPool();

        vm.deal(player1, 1 ether);
        vm.deal(player2, 1 ether);
        vm.deal(player3, 1 ether);
        vm.deal(player4, 1 ether);
        vm.deal(bettor1, 1 ether);
        vm.deal(bettor2, 1 ether);
        vm.deal(outsider, 1 ether);
    }

    // ── createRoom ───────────────────────────────────────────────────────────────

    function test_createRoom_success() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        (uint256 fee,,, TournamentPool.RoomStatus status,,) = pool.getRoom(ROOM_A);
        assertEq(fee, ENTRY_FEE);
        assertEq(uint8(status), uint8(TournamentPool.RoomStatus.Open));
    }

    function test_createRoom_emitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit TournamentPool.RoomCreated(ROOM_A, ENTRY_FEE);
        pool.createRoom(ROOM_A, ENTRY_FEE);
    }

    function test_createRoom_duplicate_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.expectRevert(TournamentPool.RoomAlreadyExists.selector);
        pool.createRoom(ROOM_A, ENTRY_FEE);
    }

    function test_createRoom_nonOwner_reverts() public {
        vm.prank(outsider);
        vm.expectRevert(TournamentPool.NotOwner.selector);
        pool.createRoom(ROOM_A, ENTRY_FEE);
    }

    // ── enter ────────────────────────────────────────────────────────────────────

    function test_enter_success_accumulatesPool() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);

        vm.prank(player1);
        pool.enter{value: ENTRY_FEE}(ROOM_A);

        vm.prank(player2);
        pool.enter{value: ENTRY_FEE}(ROOM_A);

        (, uint256 entryPool,,,,) = pool.getRoom(ROOM_A);
        assertEq(entryPool, ENTRY_FEE * 2);
        assertTrue(pool.hasEntered(ROOM_A, player1));
        assertTrue(pool.hasEntered(ROOM_A, player2));
    }

    function test_enter_wrongFee_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1);
        vm.expectRevert(abi.encodeWithSelector(TournamentPool.WrongFee.selector, 0.005 ether, ENTRY_FEE));
        pool.enter{value: 0.005 ether}(ROOM_A);
    }

    function test_enter_doubleEntry_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.startPrank(player1);
        pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.expectRevert(TournamentPool.AlreadyEntered.selector);
        pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.stopPrank();
    }

    function test_enter_closedRoom_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        pool.closeRoom(ROOM_A);
        vm.prank(player1);
        vm.expectRevert(TournamentPool.RoomNotOpen.selector);
        pool.enter{value: ENTRY_FEE}(ROOM_A);
    }

    function test_enter_emitsEvent() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.expectEmit(true, true, false, true);
        emit TournamentPool.EntryPaid(ROOM_A, player1, ENTRY_FEE);
        vm.prank(player1);
        pool.enter{value: ENTRY_FEE}(ROOM_A);
    }

    // ── placeBet ─────────────────────────────────────────────────────────────────

    function test_placeBet_success_accumulatesPool() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1);
        pool.enter{value: ENTRY_FEE}(ROOM_A);

        vm.prank(bettor1);
        pool.placeBet{value: 0.05 ether}(ROOM_A, player1);

        vm.prank(bettor2);
        pool.placeBet{value: 0.03 ether}(ROOM_A, player1);

        (,, uint256 betPool,,,) = pool.getRoom(ROOM_A);
        assertEq(betPool, 0.08 ether);
        assertEq(pool.betAmounts(ROOM_A, bettor1), 0.05 ether);
        assertEq(pool.betAmounts(ROOM_A, bettor2), 0.03 ether);
    }

    function test_placeBet_invalidTarget_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(bettor1);
        vm.expectRevert(TournamentPool.InvalidTarget.selector);
        pool.placeBet{value: 0.05 ether}(ROOM_A, outsider);
    }

    function test_placeBet_doubleBet_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1);
        pool.enter{value: ENTRY_FEE}(ROOM_A);

        vm.startPrank(bettor1);
        pool.placeBet{value: 0.05 ether}(ROOM_A, player1);
        vm.expectRevert(TournamentPool.AlreadyEntered.selector);
        pool.placeBet{value: 0.05 ether}(ROOM_A, player1);
        vm.stopPrank();
    }

    function test_placeBet_zeroAmount_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1);
        pool.enter{value: ENTRY_FEE}(ROOM_A);

        vm.prank(bettor1);
        vm.expectRevert(abi.encodeWithSelector(TournamentPool.WrongFee.selector, 0, 1));
        pool.placeBet{value: 0}(ROOM_A, player1);
    }

    function test_placeBet_closedRoom_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1);
        pool.enter{value: ENTRY_FEE}(ROOM_A);
        pool.closeRoom(ROOM_A);

        vm.prank(bettor1);
        vm.expectRevert(TournamentPool.RoomNotOpen.selector);
        pool.placeBet{value: 0.05 ether}(ROOM_A, player1);
    }

    // ── closeRoom ────────────────────────────────────────────────────────────────

    function test_closeRoom_success() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        pool.closeRoom(ROOM_A);
        (,,, TournamentPool.RoomStatus status,,) = pool.getRoom(ROOM_A);
        assertEq(uint8(status), uint8(TournamentPool.RoomStatus.Closed));
    }

    function test_closeRoom_alreadyClosed_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        pool.closeRoom(ROOM_A);
        vm.expectRevert(TournamentPool.RoomNotOpen.selector);
        pool.closeRoom(ROOM_A);
    }

    function test_closeRoom_nonOwner_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(outsider);
        vm.expectRevert(TournamentPool.NotOwner.selector);
        pool.closeRoom(ROOM_A);
    }

    // ── declareWinner ────────────────────────────────────────────────────────────

    function test_declareWinner_transfersEntryPool() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.prank(player2); pool.enter{value: ENTRY_FEE}(ROOM_A);
        pool.closeRoom(ROOM_A);

        uint256 balanceBefore = player1.balance;
        pool.declareWinner(ROOM_A, player1);
        assertEq(player1.balance, balanceBefore + ENTRY_FEE * 2);

        (, uint256 entryPool,,,,) = pool.getRoom(ROOM_A);
        assertEq(entryPool, 0);
    }

    function test_declareWinner_invalidWinner_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);
        pool.closeRoom(ROOM_A);

        vm.expectRevert(TournamentPool.InvalidWinner.selector);
        pool.declareWinner(ROOM_A, outsider);
    }

    function test_declareWinner_notClosedRoom_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);

        vm.expectRevert(TournamentPool.RoomNotClosed.selector);
        pool.declareWinner(ROOM_A, player1);
    }

    function test_declareWinner_setsStatusFinished() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);
        pool.closeRoom(ROOM_A);
        pool.declareWinner(ROOM_A, player1);

        (,,, TournamentPool.RoomStatus status, address winner,) = pool.getRoom(ROOM_A);
        assertEq(uint8(status), uint8(TournamentPool.RoomStatus.Finished));
        assertEq(winner, player1);
    }

    // ── distributeBetWinners ─────────────────────────────────────────────────────

    function test_distributeBetWinners_proportionalPayout() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);

        // bettor1: 0.06, bettor2: 0.04 — total 0.1 ether
        vm.prank(bettor1); pool.placeBet{value: 0.06 ether}(ROOM_A, player1);
        vm.prank(bettor2); pool.placeBet{value: 0.04 ether}(ROOM_A, player1);

        pool.closeRoom(ROOM_A);
        pool.declareWinner(ROOM_A, player1);

        address[] memory winners = new address[](2);
        winners[0] = bettor1;
        winners[1] = bettor2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 0.06 ether;
        amounts[1] = 0.04 ether;

        uint256 b1Before = bettor1.balance;
        uint256 b2Before = bettor2.balance;

        pool.distributeBetWinners(ROOM_A, winners, amounts);

        assertEq(bettor1.balance, b1Before + 0.06 ether);
        assertEq(bettor2.balance, b2Before + 0.04 ether);

        (,, uint256 betPool,,,) = pool.getRoom(ROOM_A);
        assertEq(betPool, 0);
    }

    function test_distributeBetWinners_arrayMismatch_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.prank(bettor1); pool.placeBet{value: 0.05 ether}(ROOM_A, player1);
        pool.closeRoom(ROOM_A);
        pool.declareWinner(ROOM_A, player1);

        address[] memory winners = new address[](1);
        winners[0] = bettor1;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 0.03 ether;
        amounts[1] = 0.02 ether;

        vm.expectRevert(TournamentPool.ArrayLengthMismatch.selector);
        pool.distributeBetWinners(ROOM_A, winners, amounts);
    }

    function test_distributeBetWinners_noBetPool_reverts() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);
        pool.closeRoom(ROOM_A);
        pool.declareWinner(ROOM_A, player1);

        address[] memory winners = new address[](0);
        uint256[] memory amounts = new uint256[](0);

        vm.expectRevert(TournamentPool.NoBetPool.selector);
        pool.distributeBetWinners(ROOM_A, winners, amounts);
    }

    function test_distributeBetWinners_remainderGoesToOwner() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.prank(bettor1); pool.placeBet{value: 0.1 ether}(ROOM_A, player1);
        pool.closeRoom(ROOM_A);
        pool.declareWinner(ROOM_A, player1);

        address[] memory winners = new address[](1);
        winners[0] = bettor1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 0.08 ether; // 0.02 remainder goes to owner

        uint256 ownerBefore = address(this).balance;
        pool.distributeBetWinners(ROOM_A, winners, amounts);
        assertEq(address(this).balance, ownerBefore + 0.02 ether);
    }

    // ── E2E: 4 oyuncu + 2 bettor → full flow ─────────────────────────────────────

    function test_e2e_fullFlow() public {
        pool.createRoom(ROOM_A, ENTRY_FEE);

        // 4 oyuncu girer
        vm.prank(player1); pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.prank(player2); pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.prank(player3); pool.enter{value: ENTRY_FEE}(ROOM_A);
        vm.prank(player4); pool.enter{value: ENTRY_FEE}(ROOM_A);

        // 2 bettor bahis yapar
        vm.prank(bettor1); pool.placeBet{value: 0.1 ether}(ROOM_A, player1);
        vm.prank(bettor2); pool.placeBet{value: 0.1 ether}(ROOM_A, player1);

        (, uint256 entryPool, uint256 betPool,,,) = pool.getRoom(ROOM_A);
        assertEq(entryPool, ENTRY_FEE * 4);
        assertEq(betPool, 0.2 ether);

        // Oda kapanır
        pool.closeRoom(ROOM_A);

        // Kazanan açıklanır — player1 tüm entry pool'u alır
        uint256 p1Before = player1.balance;
        pool.declareWinner(ROOM_A, player1);
        assertEq(player1.balance, p1Before + ENTRY_FEE * 4);

        // Bet kazananlar ödüllerini alır
        address[] memory winners = new address[](2);
        winners[0] = bettor1;
        winners[1] = bettor2;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 0.1 ether;
        amounts[1] = 0.1 ether;

        uint256 b1Before = bettor1.balance;
        uint256 b2Before = bettor2.balance;
        pool.distributeBetWinners(ROOM_A, winners, amounts);
        assertEq(bettor1.balance, b1Before + 0.1 ether);
        assertEq(bettor2.balance, b2Before + 0.1 ether);

        // Final state
        (,, uint256 finalBetPool, TournamentPool.RoomStatus status, address winner,) = pool.getRoom(ROOM_A);
        assertEq(finalBetPool, 0);
        assertEq(uint8(status), uint8(TournamentPool.RoomStatus.Finished));
        assertEq(winner, player1);

        address[] memory players = pool.getPlayers(ROOM_A);
        assertEq(players.length, 4);
    }

    // allow owner (this) to receive ETH (remainder payout)
    receive() external payable {}
}
