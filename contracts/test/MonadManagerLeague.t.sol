// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/MonadManagerLeague.sol";

contract MonadManagerLeagueTest is Test {
    MonadManagerLeague public league;

    address public admin = makeAddr("admin");
    address[8] public agentWallets;

    uint256 constant ENTRY_FEE = 10 ether;
    uint256 constant TOURNAMENT_ID = 1;

    // ─── Helpers ──────────────────────────────────────────────

    function setUp() public {
        for (uint256 i = 0; i < 8; i++) {
            agentWallets[i] = makeAddr(
                string(abi.encodePacked("agent", vm.toString(i)))
            );
            vm.deal(agentWallets[i], 100 ether);
        }
        vm.deal(admin, 100 ether);

        vm.prank(admin);
        league = new MonadManagerLeague(ENTRY_FEE);
    }

    function _defaultPlayers()
        internal
        pure
        returns (MonadManagerLeague.Player[11] memory players)
    {
        for (uint256 i = 0; i < 11; i++) {
            players[i] = MonadManagerLeague.Player(
                "Test Player",
                75,
                70,
                65,
                80
            );
        }
    }

    function _registerAgent(
        uint256 idx,
        uint8 atk,
        uint8 def,
        uint8 disc
    ) internal {
        vm.prank(agentWallets[idx]);
        league.registerAgent(
            string(abi.encodePacked("Agent_", vm.toString(idx))),
            atk,
            def,
            disc
        );
    }

    function _enterTournament(uint256 idx, uint256 fee) internal {
        vm.prank(agentWallets[idx]);
        league.enterTournament{value: fee}(TOURNAMENT_ID);
    }

    function _registerAndEnterAll() internal {
        for (uint256 i = 0; i < 8; i++) {
            _registerAgent(i, 15, 15, 15);
            _enterTournament(i, ENTRY_FEE);
        }
    }

    // ─── Constructor ──────────────────────────────────────────────

    function test_Constructor() public view {
        assertEq(league.admin(), admin, "Admin not set correctly");
        assertEq(league.entryFee(), ENTRY_FEE, "Entry fee incorrect");
        assertEq(
            league.currentTournamentId(),
            1,
            "Tournament 1 should be created"
        );

        // Check tournament 1 state
        (
            uint256 tId,
            MonadManagerLeague.TournamentType tType,
            MonadManagerLeague.TournamentState state,
            uint256 prize,
            address champ
        ) = league.tournaments(1);
        assertEq(tId, 1);
        assertEq(
            uint(tType),
            uint(MonadManagerLeague.TournamentType.KNOCKOUT_8)
        );
        assertEq(uint(state), uint(MonadManagerLeague.TournamentState.OPEN));
        assertEq(prize, 0);
        assertEq(champ, address(0));
    }

    // ─── Global Registration ──────────────────────────────────────

    function test_RegisterAgent() public {
        vm.prank(agentWallets[0]);
        league.registerAgent("Agent_0", 10, 20, 30);

        (
            string memory name,
            uint8 atk,
            uint8 def,
            uint8 disc,
            bool isReg
        ) = league.agents(agentWallets[0]);
        assertEq(name, "Agent_0");
        assertEq(atk, 10);
        assertEq(def, 20);
        assertEq(disc, 30);
        assertTrue(isReg);
    }

    function test_RevertWhen_RegisterTwice() public {
        _registerAgent(0, 15, 15, 15);

        vm.expectRevert("Already registered");
        _registerAgent(0, 15, 15, 15);
    }

    function test_RevertWhen_IdentityTooHigh() public {
        vm.prank(agentWallets[0]);
        vm.expectRevert("Max identity 60");
        league.registerAgent("MaxCheat", 20, 25, 20); // 65 total
    }

    // ─── Entering Tournament ──────────────────────────────────────

    function test_EnterTournament() public {
        _registerAgent(0, 15, 15, 15);
        _enterTournament(0, ENTRY_FEE);

        (
            bool hasEntered,
            bool hasTeam,
            uint8 sId,
            string memory reason
        ) = league.tournamentEntries(TOURNAMENT_ID, agentWallets[0]);
        assertTrue(hasEntered);
        assertFalse(hasTeam);
        assertEq(sId, 0);
        assertEq(reason, "");
    }

    function test_RevertWhen_EnterWithoutRegistering() public {
        vm.prank(agentWallets[0]);
        vm.expectRevert("Register profile first");
        league.enterTournament{value: ENTRY_FEE}(TOURNAMENT_ID);
    }

    function test_RevertWhen_EnterWithWrongFee() public {
        _registerAgent(0, 15, 15, 15);
        vm.prank(agentWallets[0]);
        vm.expectRevert("Invalid fee");
        league.enterTournament{value: 5 ether}(TOURNAMENT_ID);
    }

    function test_FullTournamentEntryTriggersDrafting() public {
        for (uint256 i = 0; i < 7; i++) {
            _registerAgent(i, 15, 15, 15);
            _enterTournament(i, ENTRY_FEE);
        }

        (, , MonadManagerLeague.TournamentState state1, , ) = league
            .tournaments(TOURNAMENT_ID);
        assertEq(uint(state1), uint(MonadManagerLeague.TournamentState.OPEN));

        _registerAgent(7, 15, 15, 15);
        _enterTournament(7, ENTRY_FEE);

        (, , MonadManagerLeague.TournamentState state2, , ) = league
            .tournaments(TOURNAMENT_ID);
        assertEq(
            uint(state2),
            uint(MonadManagerLeague.TournamentState.DRAFTING)
        );
    }

    function test_RevertWhen_EnterFullTournament() public {
        _registerAndEnterAll();

        address lateAgent = makeAddr("lateAgent");
        vm.deal(lateAgent, 100 ether);
        vm.prank(lateAgent);
        league.registerAgent("Late", 10, 10, 10);

        vm.prank(lateAgent);
        vm.expectRevert("Tournament not open");
        league.enterTournament{value: ENTRY_FEE}(TOURNAMENT_ID);
    }

    // ─── Drafting Phase ───────────────────────────────────────────

    function test_SetTeam() public {
        _registerAndEnterAll();

        MonadManagerLeague.Player[11] memory players = _defaultPlayers();
        vm.prank(admin);
        league.setTeam(TOURNAMENT_ID, agentWallets[0], players);

        (, bool hasTeam, , ) = league.tournamentEntries(
            TOURNAMENT_ID,
            agentWallets[0]
        );
        assertTrue(hasTeam);
    }

    function test_RevertWhen_SetTeamNotAdmin() public {
        _registerAndEnterAll();

        MonadManagerLeague.Player[11] memory players = _defaultPlayers();
        vm.prank(agentWallets[0]);
        vm.expectRevert("Only admin");
        league.setTeam(TOURNAMENT_ID, agentWallets[0], players);
    }

    function test_RevertWhen_SetTeamNotInDrafting() public {
        _registerAgent(0, 15, 15, 15);
        _enterTournament(0, ENTRY_FEE);
        // Only 1 person, tournament still OPEN

        MonadManagerLeague.Player[11] memory players = _defaultPlayers();
        vm.prank(admin);
        vm.expectRevert("Not in drafting phase");
        league.setTeam(TOURNAMENT_ID, agentWallets[0], players);
    }

    // ─── Strategy Phase ───────────────────────────────────────────

    function test_OpenStrategyPhase() public {
        _registerAndEnterAll();

        vm.prank(admin);
        league.openStrategyPhase(TOURNAMENT_ID);

        (, , MonadManagerLeague.TournamentState state, , ) = league.tournaments(
            TOURNAMENT_ID
        );
        assertEq(
            uint(state),
            uint(MonadManagerLeague.TournamentState.STRATEGY)
        );
    }

    function test_CommitStrategy() public {
        _registerAndEnterAll();

        vm.prank(admin);
        league.openStrategyPhase(TOURNAMENT_ID);

        vm.prank(agentWallets[0]);
        league.commitStrategy(TOURNAMENT_ID, 1, "We play high press");

        (, , uint8 sId, string memory reason) = league.tournamentEntries(
            TOURNAMENT_ID,
            agentWallets[0]
        );
        assertEq(sId, 1);
        assertEq(reason, "We play high press");
    }

    function test_RevertWhen_CommitInvalidStrategy() public {
        _registerAndEnterAll();
        vm.prank(admin);
        league.openStrategyPhase(TOURNAMENT_ID);

        vm.prank(agentWallets[0]);
        vm.expectRevert("Invalid strategy ID");
        league.commitStrategy(TOURNAMENT_ID, 7, "Hack");
    }

    // ─── Tournament Execution ─────────────────────────────────────

    function test_PlayEightFinalTournament() public {
        _registerAndEnterAll();

        MonadManagerLeague.Player[11] memory players = _defaultPlayers();
        for (uint256 i = 0; i < 8; i++) {
            vm.prank(admin);
            league.setTeam(TOURNAMENT_ID, agentWallets[i], players);
        }

        vm.prank(admin);
        league.openStrategyPhase(TOURNAMENT_ID);

        for (uint256 i = 0; i < 8; i++) {
            vm.prank(agentWallets[i]);
            league.commitStrategy(
                TOURNAMENT_ID,
                uint8((i % 6) + 1),
                "Test Strat"
            );
        }

        vm.prank(admin);
        league.playEightFinalTournament(TOURNAMENT_ID);

        (
            ,
            ,
            MonadManagerLeague.TournamentState state,
            uint256 prize,
            address champ
        ) = league.tournaments(TOURNAMENT_ID);
        assertEq(
            uint(state),
            uint(MonadManagerLeague.TournamentState.COMPLETED)
        );
        assertEq(prize, 80 ether, "Prize pool should be 80");
        assertNotEq(champ, address(0), "Champion should not be zero address");

        MonadManagerLeague.MatchResult[] memory history = league.getMatches(
            TOURNAMENT_ID
        );
        assertEq(history.length, 7, "Should be 7 matches for 8 teams");
    }

    // ─── New Season ───────────────────────────────────────────────

    function test_StartNewSeason() public {
        test_PlayEightFinalTournament();

        vm.prank(admin);
        league.startNewSeason(MonadManagerLeague.TournamentType.KNOCKOUT_8);

        assertEq(league.currentTournamentId(), 2);

        (, , MonadManagerLeague.TournamentState state, , ) = league.tournaments(
            2
        );
        assertEq(uint(state), uint(MonadManagerLeague.TournamentState.OPEN));
    }
}
