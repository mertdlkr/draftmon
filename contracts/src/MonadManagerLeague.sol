// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MonadManagerLeague {
    struct Player {
        string name;
        string position;
        uint8 pace;
        uint8 shooting;
        uint8 passing;
        uint8 tackling;
    }
    struct AgentProfile {
        string name;
        uint8 attack;
        uint8 defense;
        uint8 discipline;
        bool isRegistered;
    }
    struct TournamentEntry {
        bool hasEntered;
        bool hasTeam;
        uint8 strategyId;
        string reasoning;
        Player[11] team;
    }
    struct MatchResult {
        address teamA;
        address teamB;
        address winner;
        uint256 scoreA;
        uint256 scoreB;
    }

    enum TournamentType {
        KNOCKOUT_8,
        LEAGUE
    } // Future modes can be added here
    enum TournamentState {
        OPEN,
        DRAFTING,
        STRATEGY,
        COMPLETED
    }

    struct Tournament {
        uint256 id;
        TournamentType tType;
        TournamentState state;
        address[] participants;
        uint256 prizePool;
        address champion;
    }

    address public admin;
    uint256 public entryFee;
    uint256 public currentTournamentId;
    address[] public registeredAgentList;

    mapping(address => AgentProfile) public agents;
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => mapping(address => TournamentEntry))
        public tournamentEntries;
    mapping(uint256 => MatchResult[]) public tournamentMatches;

    event AgentRegistered(address indexed agentWallet, string name);
    event TournamentCreated(uint256 indexed tournamentId, TournamentType tType);
    event AgentEnteredTournament(
        uint256 indexed tournamentId,
        address indexed agentWallet
    );
    event TeamDrafted(
        uint256 indexed tournamentId,
        address indexed agentWallet
    );
    event StrategyCommitted(
        uint256 indexed tournamentId,
        address indexed agentWallet,
        uint8 strategyId,
        string reasoning
    );
    event TournamentEnded(
        uint256 indexed tournamentId,
        address indexed champion,
        uint256 prizePool
    );

    constructor(uint256 _entryFee) {
        admin = msg.sender;
        entryFee = _entryFee;
        _createNewTournament(TournamentType.KNOCKOUT_8);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    function registerAgent(
        string memory _name,
        uint8 _atk,
        uint8 _def,
        uint8 _disc
    ) external {
        require(!agents[msg.sender].isRegistered, "Already registered");
        require(_atk + _def + _disc <= 60, "Max identity 60");
        agents[msg.sender] = AgentProfile({
            name: _name,
            attack: _atk,
            defense: _def,
            discipline: _disc,
            isRegistered: true
        });
        registeredAgentList.push(msg.sender);
        emit AgentRegistered(msg.sender, _name);
    }

    function _createNewTournament(TournamentType _type) internal {
        currentTournamentId++;
        tournaments[currentTournamentId].id = currentTournamentId;
        tournaments[currentTournamentId].tType = _type;
        tournaments[currentTournamentId].state = TournamentState.OPEN;
        emit TournamentCreated(currentTournamentId, _type);
    }

    function startNewSeason(TournamentType _type) external onlyAdmin {
        require(
            tournaments[currentTournamentId].state == TournamentState.COMPLETED,
            "Current tournament not finished"
        );
        _createNewTournament(_type);
    }

    function enterTournament(uint256 _tId) external payable {
        Tournament storage t = tournaments[_tId];
        require(t.state == TournamentState.OPEN, "Tournament not open");
        require(agents[msg.sender].isRegistered, "Register profile first");
        require(
            !tournamentEntries[_tId][msg.sender].hasEntered,
            "Already entered"
        );

        if (t.tType == TournamentType.KNOCKOUT_8) {
            require(t.participants.length < 8, "Tournament full");
        }

        require(msg.value == entryFee, "Invalid fee");

        t.participants.push(msg.sender);
        t.prizePool += msg.value;
        tournamentEntries[_tId][msg.sender].hasEntered = true;
        emit AgentEnteredTournament(_tId, msg.sender);

        if (
            t.tType == TournamentType.KNOCKOUT_8 && t.participants.length == 8
        ) {
            t.state = TournamentState.DRAFTING;
        }
    }

    function setTeam(
        uint256 _tId,
        address _agentWallet,
        Player[11] memory _players
    ) external onlyAdmin {
        require(
            tournaments[_tId].state == TournamentState.DRAFTING,
            "Not in drafting phase"
        );
        require(
            tournamentEntries[_tId][_agentWallet].hasEntered,
            "Agent not in tournament"
        );
        TournamentEntry storage entry = tournamentEntries[_tId][_agentWallet];
        for (uint i = 0; i < 11; i++) {
            entry.team[i] = _players[i];
        }
        entry.hasTeam = true;
        emit TeamDrafted(_tId, _agentWallet);
    }

    function openStrategyPhase(uint256 _tId) external onlyAdmin {
        require(
            tournaments[_tId].state == TournamentState.DRAFTING,
            "Drafting not finished"
        );
        tournaments[_tId].state = TournamentState.STRATEGY;
    }

    function commitStrategy(
        uint256 _tId,
        uint8 _strategyId,
        string memory _reasoning
    ) external {
        require(
            tournaments[_tId].state == TournamentState.STRATEGY,
            "Not in strategy phase"
        );
        require(
            tournamentEntries[_tId][msg.sender].hasEntered,
            "Not in tournament"
        );
        require(_strategyId >= 1 && _strategyId <= 6, "Invalid strategy ID");

        TournamentEntry storage entry = tournamentEntries[_tId][msg.sender];
        entry.strategyId = _strategyId;
        entry.reasoning = _reasoning;
        emit StrategyCommitted(_tId, msg.sender, _strategyId, _reasoning);
    }

    // Renamed and restricted to KNOCKOUT_8 logic
    function playEightFinalTournament(uint256 _tId) external onlyAdmin {
        Tournament storage t = tournaments[_tId];
        require(
            t.tType == TournamentType.KNOCKOUT_8,
            "Not an 8-team knockout tournament"
        );
        require(t.state == TournamentState.STRATEGY, "Strategies not ready");

        t.state = TournamentState.COMPLETED;
        address[] memory p = t.participants;

        address q1 = _playMatch(_tId, p[0], p[1]);
        address q2 = _playMatch(_tId, p[2], p[3]);
        address q3 = _playMatch(_tId, p[4], p[5]);
        address q4 = _playMatch(_tId, p[6], p[7]);

        address s1 = _playMatch(_tId, q1, q2);
        address s2 = _playMatch(_tId, q3, q4);

        address champion = _playMatch(_tId, s1, s2);
        t.champion = champion;

        uint256 reward = t.prizePool;
        (bool success, ) = champion.call{value: reward}("");
        require(success, "Reward transfer failed");
        emit TournamentEnded(_tId, champion, reward);
    }

    function _playMatch(
        uint256 _tId,
        address _teamA,
        address _teamB
    ) internal returns (address winner) {
        AgentProfile memory profA = agents[_teamA];
        AgentProfile memory profB = agents[_teamB];
        TournamentEntry memory entryA = tournamentEntries[_tId][_teamA];
        TournamentEntry memory entryB = tournamentEntries[_tId][_teamB];

        uint256 pA = _calculateBasePower(entryA);
        uint256 pB = _calculateBasePower(entryB);

        pA = (pA * _getIdentityMultiplier(profA, entryA.strategyId)) / 100;
        pB = (pB * _getIdentityMultiplier(profB, entryB.strategyId)) / 100;

        uint256 synA = _getSynergyMultiplier(
            entryA.strategyId,
            entryB.strategyId
        );
        uint256 synB = _getSynergyMultiplier(
            entryB.strategyId,
            entryA.strategyId
        );
        pA = (pA * synA) / 100;
        pB = (pB * synB) / 100;

        uint256 rngA = 90 + (_pseudoRNG(_teamA, _tId) % 21);
        uint256 rngB = 90 + (_pseudoRNG(_teamB, _tId) % 21);
        pA = (pA * rngA) / 100;
        pB = (pB * rngB) / 100;

        winner = pA >= pB ? _teamA : _teamB;
        tournamentMatches[_tId].push(
            MatchResult(_teamA, _teamB, winner, pA, pB)
        );
        return winner;
    }

    function _calculateBasePower(
        TournamentEntry memory _entry
    ) internal pure returns (uint256 totalPower) {
        uint8 sId = _entry.strategyId;
        for (uint i = 0; i < 11; i++) {
            Player memory p = _entry.team[i];
            if (sId == 1) {
                totalPower += p.pace + p.tackling;
            } else if (sId == 2) {
                totalPower += p.passing + p.shooting;
            } else if (sId == 3) {
                totalPower += p.pace + p.shooting;
            } else if (sId == 4) {
                totalPower += p.tackling + p.passing;
            } else if (sId == 5) {
                totalPower += p.pace + p.passing;
            } else if (sId == 6) {
                totalPower += p.passing + p.shooting;
            }
        }
    }

    function _getIdentityMultiplier(
        AgentProfile memory _prof,
        uint8 _sId
    ) internal pure returns (uint256) {
        uint256 multiplier = 100;
        if (_sId == 1) {
            multiplier += (_prof.discipline + _prof.attack) / 2;
        } else if (_sId == 2) {
            multiplier += _prof.discipline;
        } else if (_sId == 3) {
            multiplier += (_prof.defense + _prof.attack) / 2;
        } else if (_sId == 4) {
            multiplier += (_prof.defense + _prof.discipline) / 2;
        } else if (_sId == 5) {
            multiplier += _prof.attack;
        } else if (_sId == 6) {
            multiplier += (_prof.attack + _prof.discipline) / 2;
        }
        return multiplier;
    }

    function _getSynergyMultiplier(
        uint8 _myStrat,
        uint8 _enemyStrat
    ) internal pure returns (uint256) {
        if (_myStrat == 1 && _enemyStrat == 2) return 120;
        if (_myStrat == 1 && _enemyStrat == 3) return 80;
        if (_myStrat == 2 && _enemyStrat == 4) return 120;
        if (_myStrat == 2 && _enemyStrat == 1) return 80;
        if (_myStrat == 3 && _enemyStrat == 1) return 120;
        if (_myStrat == 3 && _enemyStrat == 4) return 80;
        if (_myStrat == 4 && _enemyStrat == 3) return 120;
        if (_myStrat == 4 && _enemyStrat == 2) return 80;
        if (_myStrat == 5 && _enemyStrat == 6) return 120;
        if (_myStrat == 5 && _enemyStrat == 4) return 80;
        if (_myStrat == 6 && _enemyStrat == 1) return 120;
        if (_myStrat == 6 && _enemyStrat == 5) return 80;
        return 100;
    }

    function _pseudoRNG(
        address _wallet,
        uint256 _nonce
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        _wallet,
                        _nonce
                    )
                )
            );
    }

    function getMatches(
        uint256 _tId
    ) external view returns (MatchResult[] memory) {
        return tournamentMatches[_tId];
    }

    function getRegisteredAgents() external view returns (address[] memory) {
        return registeredAgentList;
    }

    function getParticipants(
        uint256 _tId
    ) external view returns (address[] memory) {
        return tournaments[_tId].participants;
    }

    function getTournamentEntry(
        uint256 _tId,
        address _agent
    )
        external
        view
        returns (
            bool hasEntered,
            bool hasTeam,
            uint8 strategyId,
            string memory reasoning,
            Player[11] memory team
        )
    {
        TournamentEntry storage e = tournamentEntries[_tId][_agent];
        return (e.hasEntered, e.hasTeam, e.strategyId, e.reasoning, e.team);
    }
}
