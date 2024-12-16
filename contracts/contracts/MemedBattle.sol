// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedToken.sol";
import "./MemedFactory.sol";

contract MemedBattle is Ownable {
    Factory public factory;
    uint256 public constant BATTLE_DURATION = 10 minutes;
    uint256 public constant MIN_TOKENS_TO_CREATE = 1000 * 10**18;
    uint256 public constant CREATION_FEE = 0.0002 ether;

    struct Battle {
        address token1;
        address token2;
        uint256 token1Votes;
        uint256 token2Votes;
        uint256 startTime;
        uint256 endTime;
        bool settled;
        address winner;
    }

    struct TokenScore {
        uint256 wins;
        uint256 totalBattles;
        uint256 totalVotes;
    }

    // New: Stats tracking
    struct TokenStats {
        uint256 totalBattlesInitiated;
        uint256 totalBattlesParticipated;
        uint256 totalWins;
        uint256 totalVotes;
        uint256 lastBattleTime;
        uint256 lastWinTime;
        bool isKing;
        uint256 kingCrownedTime;
    }

    struct MonthlyData {
        uint256[] battles;
        uint256[] wins;
    }

    mapping(uint256 => Battle) public battles;
    mapping(address => TokenScore) public tokenScores;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public userVotingPower;
    
    // New: Enhanced stats mappings
    mapping(address => TokenStats) public tokenStats;
    mapping(address => mapping(uint256 => uint256)) public monthlyBattleCount;
    mapping(address => mapping(uint256 => uint256)) public monthlyWinCount;
    
    uint256 public battleCount;
    uint256 public feesBalance;
    address public currentKing;

    event BattleCreated(
        uint256 indexed battleId,
        address indexed token1,
        address indexed token2,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(
        uint256 indexed battleId,
        address indexed voter,
        address indexed votedFor,
        uint256 votingPower
    );
    event BattleSettled(
        uint256 indexed battleId,
        address indexed winner,
        uint256 token1FinalVotes,
        uint256 token2FinalVotes
    );
    event NewKingCrowned(address indexed token, uint256 timestamp);

    constructor(address payable _factory) Ownable(msg.sender) {
        factory = Factory(_factory);
    }

    function createBattle(address _token1, address _token2) external payable {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");
        require(_token1 != _token2, "Cannot battle same token");

        // Get token data and check stage
        (,,,,,Factory.TokenStages stage1,,) = factory.tokenData(_token1);
        (,,,,,Factory.TokenStages stage2,,) = factory.tokenData(_token2);
        
        require(
            stage1 == Factory.TokenStages.GRADUATED &&
            stage2 == Factory.TokenStages.GRADUATED,
            "Only graduated tokens can battle"
        );

        MemedToken token1 = MemedToken(_token1);
        MemedToken token2 = MemedToken(_token2);
        require(
            token1.totalSupply() >= MIN_TOKENS_TO_CREATE &&
            token2.totalSupply() >= MIN_TOKENS_TO_CREATE,
            "Insufficient token supply"
        );

        uint256 battleId = battleCount++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + BATTLE_DURATION;

        battles[battleId] = Battle({
            token1: _token1,
            token2: _token2,
            token1Votes: 0,
            token2Votes: 0,
            startTime: startTime,
            endTime: endTime,
            settled: false,
            winner: address(0)
        });

        // Update stats
        updateBattleStats(_token1, true);
        updateBattleStats(_token2, false);

        feesBalance += CREATION_FEE;

        emit BattleCreated(battleId, _token1, _token2, startTime, endTime);
    }

    // New: Update battle statistics
    function updateBattleStats(address token, bool isInitiator) internal {
        TokenStats storage stats = tokenStats[token];
        uint256 currentMonth = (block.timestamp / 30 days) % 6;

        if(isInitiator) {
            stats.totalBattlesInitiated++;
        }
        stats.totalBattlesParticipated++;
        stats.lastBattleTime = block.timestamp;
        
        // Update monthly stats
        monthlyBattleCount[token][currentMonth]++;
    }

    function getTokenBasicStats(address token) external view returns (
        uint256 totalBattles,
        uint256 totalWins,
        uint256 totalVotes,
        bool isCurrentKing,
        uint256 kingTime
    ) {
        TokenStats storage stats = tokenStats[token];
        return (
            stats.totalBattlesParticipated,
            stats.totalWins,
            stats.totalVotes,
            currentKing == token,
            stats.kingCrownedTime
        );
    }

    function getTokenMonthlyStats(address token) external view returns (
        uint256[] memory monthlyBattles,
        uint256[] memory monthlyWins
    ) {
        monthlyBattles = new uint256[](6);
        monthlyWins = new uint256[](6);
        
        uint256 currentMonth = (block.timestamp / 30 days) % 6;
        
        for(uint256 i = 0; i < 6; i++) {
            uint256 monthIndex = (currentMonth + i) % 6;
            monthlyBattles[i] = monthlyBattleCount[token][monthIndex];
            monthlyWins[i] = monthlyWinCount[token][monthIndex];
        }

        return (monthlyBattles, monthlyWins);
    }

    function vote(uint256 _battleId, address _votingFor) external {
        Battle storage battle = battles[_battleId];
        require(block.timestamp >= battle.startTime, "Battle not started");
        require(block.timestamp < battle.endTime, "Battle ended");
        require(!hasVoted[_battleId][msg.sender], "Already voted");
        require(
            _votingFor == battle.token1 || _votingFor == battle.token2,
            "Invalid token"
        );

        uint256 votingPower = calculateVotingPower(msg.sender, battle.token1, battle.token2);
        require(votingPower > 0, "No voting power");

        if (_votingFor == battle.token1) {
            battle.token1Votes += votingPower;
        } else {
            battle.token2Votes += votingPower;
        }

        // Update vote stats
        tokenStats[_votingFor].totalVotes += votingPower;

        hasVoted[_battleId][msg.sender] = true;
        userVotingPower[_battleId][msg.sender] = votingPower;

        emit VoteCast(_battleId, msg.sender, _votingFor, votingPower);
    }

    function settleBattle(uint256 _battleId) external {
        Battle storage battle = battles[_battleId];
        require(block.timestamp >= battle.endTime, "Battle not ended");
        require(!battle.settled, "Already settled");

        address winner;
        if (battle.token1Votes > battle.token2Votes) {
            winner = battle.token1;
        } else if (battle.token2Votes > battle.token1Votes) {
            winner = battle.token2;
        } else {
            winner = battle.token1Votes == 0 ? address(0) : 
                    block.timestamp % 2 == 0 ? battle.token1 : battle.token2;
        }

        battle.winner = winner;
        battle.settled = true;

        if (winner != address(0)) {
            // Update winner stats
            TokenStats storage winnerStats = tokenStats[winner];
            winnerStats.totalWins++;
            winnerStats.lastWinTime = block.timestamp;
            monthlyWinCount[winner][(block.timestamp / 30 days) % 6]++;

            // Check for new king (e.g., if won 3 battles in current month)
            if (monthlyWinCount[winner][(block.timestamp / 30 days) % 6] >= 3 && 
                winner != currentKing) {
                currentKing = winner;
                winnerStats.isKing = true;
                winnerStats.kingCrownedTime = block.timestamp;
                emit NewKingCrowned(winner, block.timestamp);
            }
        }

        emit BattleSettled(
            _battleId,
            winner,
            battle.token1Votes,
            battle.token2Votes
        );
    }

    function calculateVotingPower(
        address _voter,
        address _token1,
        address _token2
    ) public view returns (uint256) {
        MemedToken token1 = MemedToken(_token1);
        MemedToken token2 = MemedToken(_token2);
        
        uint256 token1Balance = token1.balanceOf(_voter);
        uint256 token2Balance = token2.balanceOf(_voter);
        
        // Square root of token balance to prevent whale dominance
        uint256 power1 = sqrt(token1Balance);
        uint256 power2 = sqrt(token2Balance);
        
        return power1 + power2;
    }

    function getLeaderboard(uint256 limit) external view returns (
        address[] memory tokens,
        uint256[] memory wins,
        uint256[] memory totalBattles,
        uint256[] memory totalVotes
    ) {
        // Get all tokens from factory
        Factory.AllTokenData[] memory allTokens = factory.getTokens(address(0));
        
        // Create arrays for sorting
        address[] memory sortedTokens = new address[](allTokens.length);
        uint256[] memory sortedWins = new uint256[](allTokens.length);
        uint256[] memory sortedBattles = new uint256[](allTokens.length);
        uint256[] memory sortedVotes = new uint256[](allTokens.length);
        
        // Fill arrays
        for (uint i = 0; i < allTokens.length; i++) {
            address tokenAddr = allTokens[i].token;
            TokenScore memory score = tokenScores[tokenAddr];
            sortedTokens[i] = tokenAddr;
            sortedWins[i] = score.wins;
            sortedBattles[i] = score.totalBattles;
            sortedVotes[i] = score.totalVotes;
        }
        
        // Sort by wins (simple bubble sort)
        for (uint i = 0; i < sortedTokens.length; i++) {
            for (uint j = i + 1; j < sortedTokens.length; j++) {
                if (sortedWins[j] > sortedWins[i]) {
                    // Swap all arrays
                    (sortedTokens[i], sortedTokens[j]) = (sortedTokens[j], sortedTokens[i]);
                    (sortedWins[i], sortedWins[j]) = (sortedWins[j], sortedWins[i]);
                    (sortedBattles[i], sortedBattles[j]) = (sortedBattles[j], sortedBattles[i]);
                    (sortedVotes[i], sortedVotes[j]) = (sortedVotes[j], sortedVotes[i]);
                }
            }
        }
        
        // Return limited results
        uint256 resultSize = limit > sortedTokens.length ? sortedTokens.length : limit;
        tokens = new address[](resultSize);
        wins = new uint256[](resultSize);
        totalBattles = new uint256[](resultSize);
        totalVotes = new uint256[](resultSize);
        
        for (uint i = 0; i < resultSize; i++) {
            tokens[i] = sortedTokens[i];
            wins[i] = sortedWins[i];
            totalBattles[i] = sortedBattles[i];
            totalVotes[i] = sortedVotes[i];
        }
    }

    // Helper function to calculate square root
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = feesBalance;
        feesBalance = 0;
        payable(owner()).transfer(amount);
    }
} 