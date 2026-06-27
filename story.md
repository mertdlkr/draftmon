# 🏆 MonaDraft: The TPS League

**Tagline**: 11 Players. 8 Agents. 1 Transaction.

---

## 1. Executive Summary

MonaDraft is an on-chain, agentic football manager game built for the Monad Hackathon. It showcases Monad's extreme TPS (Transactions Per Second) and low gas fees.
8 Autonomous AI Managers (LLMs) are assigned a football team, analyze their opponents, and choose a tactical strategy. The entire 8-team knockout tournament (Quarter Finals, Semi Finals, Final - 7 matches total) and all complex game theory math (RNG, synergies, multipliers) are executed in a **SINGLE on-chain transaction**.

---

## 2. Tech Stack

- **Smart Contract**: Solidity, Foundry
- **Network**: Monad Testnet
- **Backend / Orchestrator**: Node.js, TypeScript, ethers.js v6
- **AI Agent Engine**: AWS Bedrock (anthropic.claude-3-haiku-20240307-v1:0)
- **Frontend (Upcoming)**: Next.js (App Router), TailwindCSS, wagmi/viem

---

## 3. Game Mechanics & Mathematics

The game uses a deterministic match engine based on "Rock-Paper-Scissors" mechanics.

### A. Agent Identity (Max 60 points total)
Each AI manager has a persistent profile:
- attack (0-20)
- defense (0-20)
- discipline (0-20)

### B. Player Stats (Max 100 per stat)
Each player has 4 core stats: **pace, shooting, passing, tackling**. We use a predefined database of 88 real/meme football players (e.g., Maldini, Sabri, Antony, Messi) divided into 8 tiers.

### C. The 6 Strategies & Synergies
Agents must choose 1 of 6 strategies. Each strategy requires specific manager identity traits, relies on specific player stats, and counters another strategy.

1. **High Press**: (Needs: Disc/Atk | Stats: Pace, Tackle) -> Beats Possession(2), Loses to Counter(3).
2. **Possession**: (Needs: Disc | Stats: Pass, Shoot) -> Beats Bus(4), Loses to Press(1).
3. **Counter Attack**: (Needs: Def/Atk | Stats: Pace, Shoot) -> Beats Press(1), Loses to Bus(4).
4. **Park the Bus**: (Needs: Def/Disc | Stats: Tackle, Pass) -> Beats Counter(3) & Wing(5), Loses to Possession(2).
5. **Wing Play**: (Needs: Atk | Stats: Pace, Pass) -> Beats Middle(6), Loses to Bus(4).
6. **Through Middle**: (Needs: Atk/Disc | Stats: Pass, Shoot) -> Beats Press(1), Loses to Wing(5).

### D. Match Engine Math (Calculated On-Chain)
- **Base Power**: Sum of the 11 players' 2 relevant stats based on the chosen strategy (e.g., if High Press, Base Power = sum of Pace + Tackling for all 11 players).
- **Identity Multiplier**: Matches the Agent's identity to the strategy. (e.g., If strategy is Park the Bus, multiplier = 100 + (Defense + Discipline) / 2). Max 120% (1.2x).
- **Synergy Multiplier**: Rock-Paper-Scissors. Advantage = 120% (1.2x), Disadvantage = 80% (0.8x), Neutral = 100% (1.0x).
- **RNG Factor**: Pseudo-random number between 90 and 110 (±10% luck factor).
- **Formula**: `Total Score = (Base Power * Identity * Synergy * RNG) / 1,000,000` (Simplified by dividing by 100 at each step).

---

## 4. System Architecture (Career Mode Flow)

The system operates in a "Career Mode" loop where agents persist, but tournaments are cyclical.

### Phase 0: Global Setup (`setup_agents.ts`)
- Run ONLY ONCE.
- Registers 8 legendary AI personas (e.g., "Guardiola GPT", "MourinhOS") to the blockchain with hardcoded, extreme identity stats.

### Phase 1: Tournament Entry (`orchestrator.ts`)
- Orchestrator checks the `currentTournamentId`. If completed, calls `startNewSeason()`.
- The 8 registered AI wallets call `enterTournament(tId)` and pay the entry fee.

### Phase 2: Drafting (`orchestrator.ts`)
- The backend scripts shuffle the 88-player database.
- Assigns exactly 11 unique players to each of the 8 agents using `setTeam(tId, wallet, playersArray)`.

### Phase 3: AI Reasoning (`orchestrator.ts` -> AWS Bedrock)
- For each agent, the orchestrator pulls their Identity, Team Averages, and Key Player Names.
- Sends this context to **Claude 3 Haiku**.
- Claude returns a JSON with: `strategyId (1-6)` and `reasoning` (a 256-char arrogant/tactical press quote mentioning their specific players).
- Orchestrator submits this via `commitStrategy(tId, strategyId, reasoning)`.

### Phase 4: Monad Magic Execution (`orchestrator.ts`)
- Admin calls `playEightFinalTournament(tId)`.
- The smart contract calculates all QF, SF, and Final matches in a SINGLE transaction.
- Emits events and transfers the prize pool to the champion agent.

---

## 5. The 8 AI Legends (Personas)

Hardcoded in `setup_agents.ts`:

- **Guardiola GPT**: Atk: 19, Def: 12, Disc: 18
- **MourinhOS**: Atk: 10, Def: 20, Disc: 19
- **Klopp Chain**: Atk: 20, Def: 14, Disc: 12
- **AncelottAI**: Atk: 16, Def: 15, Disc: 14
- **Simeone Node**: Atk: 14, Def: 19, Disc: 20
- **Bielsa Byte**: Atk: 20, Def: 4, Disc: 8
- **Conte Contract**: Atk: 16, Def: 16, Disc: 18
- **Sir Alex Algo**: Atk: 20, Def: 14, Disc: 16

---

## 6. AWS Bedrock System Prompt

Used in `getStrategyFromLLM`:

```text
You are a charismatic AI Football Manager named ${agentName} in MonaDraft League.
Your Manager Identity (Max 20): Attack ${identity.attack}, Defense ${identity.defense}, Discipline ${identity.discipline}.
Your Team Avg Stats (Max 100): Pace ${teamAvg.pace}, Shoot ${teamAvg.shooting}, Pass ${teamAvg.passing}, Tackle ${teamAvg.tackling}.
Your Key Players: ${playerNames.join(', ')}.

Strategy Guide & Synergies (Choose 1-6 carefully):
1: High Press (Needs: Discipline, Attack | Best Stats: Pace, Tackle) -> Beats Possession(2), Loses to Counter(3).
2: Possession (Needs: Discipline | Best Stats: Pass, Shoot) -> Beats Bus(4), Loses to Press(1).
3: Counter Attack (Needs: Defense, Attack | Best Stats: Pace, Shoot) -> Beats Press(1), Loses to Bus(4).
4: Park the Bus (Needs: Defense, Discipline | Best Stats: Tackle, Pass) -> Beats Counter(3) & Wing(5), Loses to Possession(2).
5: Wing Play (Needs: Attack | Best Stats: Pace, Pass) -> Beats Middle(6), Loses to Bus(4).
6: Through Middle (Needs: Attack, Discipline | Best Stats: Pass, Shoot) -> Beats Press(1), Loses to Wing(5).

USER PROMPT:
Based on your identity, average stats, and specific players, choose the most logical strategy. Create an arrogant or highly tactical 256-character press conference quote explaining why your choice fits your team and counters potential threats. Return ONLY valid JSON: {"strategyId": number(1-6), "reasoning": "string"}
```

---

## 7. Future UI Vision (For Context)

- **Framework**: Next.js + Tailwind + Wagmi.
- **Visuals**: 8 "Flip Cards" on a dashboard.
- **Front**: AI Avatar, Name, and their LLM-generated press quote.
- **Back**: Team Stats, Key Players, and Manager Identity.
- **Bracket**: A dynamic tournament bracket showing Quarter Finals -> Semi Finals -> Final, updating instantly as the single transaction is mined on Monad.
- **Interactivity**: Open endpoints for human users to connect their wallets, define an identity, and join as the 9th+ manager in future seasons.
