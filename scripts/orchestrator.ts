import { ethers } from "ethers";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import * as dotenv from "dotenv";
import { draftTeams } from "./players.js"; // players.ts dosyamız

dotenv.config({ path: "../.env" });

const RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const ENTRY_FEE = ethers.parseEther("0.1");

const ABI = [
    "function enterTournament(uint256 _tId) external payable",
    "function setTeam(uint256 _tId, address _agentWallet, tuple(string name, string position, uint8 pace, uint8 shooting, uint8 passing, uint8 tackling)[11] _players) external",
    "function openStrategyPhase(uint256 _tId) external",
    "function commitStrategy(uint256 _tId, uint8 _strategyId, string _reasoning) external",
    "function playEightFinalTournament(uint256 _tId) external",
    "function getMatches(uint256 _tId) external view returns (tuple(address teamA, address teamB, address winner, uint256 scoreA, uint256 scoreB)[])",
    "function agents(address) external view returns (string name, uint8 attack, uint8 defense, uint8 discipline, bool isRegistered)",
    "function currentTournamentId() external view returns (uint256)",
    "function tournaments(uint256) external view returns (uint256 id, uint8 tType, uint8 state, uint256 prizePool, address champion)",
    "function startNewSeason(uint8 _type) external"
];

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

async function getStrategyFromLLM(agentName: string, identity: any, teamAvg: any, playersWithPositions: string[], formation: string): Promise<{ strategyId: number, reasoning: string }> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        return { strategyId: Math.floor(Math.random() * 6) + 1, reasoning: `With ${playersWithPositions[0]} and ${playersWithPositions[1]} on the pitch, we cannot lose!` };
    }

    // Calculate the agent's strongest attribute to enforce personality
    const attrs = [
        { name: "Attack", val: Number(identity.attack) },
        { name: "Defense", val: Number(identity.defense) },
        { name: "Discipline", val: Number(identity.discipline) }
    ].sort((a, b) => b.val - a.val);
    const dominantTrait = attrs[0].name;

    const systemPrompt = `You are a charismatic AI Football Manager named ${agentName} in MonaDraft League.
    Your Manager Identity (Max 20): Attack ${identity.attack}, Defense ${identity.defense}, Discipline ${identity.discipline}.
    Your Team Avg Stats (Max 100): Pace ${teamAvg.pace}, Shoot ${teamAvg.shooting}, Pass ${teamAvg.passing}, Tackle ${teamAvg.tackling}.
    Your Formation: ${formation}.
    Your Key Players: ${playersWithPositions.join(', ')}.
    
    CRITICAL PERSONALITY RULE: Your dominant managerial trait is ${dominantTrait}. You MUST heavily favor tactics that align with your highest identity stat. 
    If Defense is highest, you MUST lean towards counter-attacks or parking the bus. 
    If Attack is highest, you MUST lean towards wings or through middle. 
    If Discipline is highest, you MUST lean towards possession or pressing.
    DO NOT default to High Press unless it perfectly matches your stats. Be controversial, unique, and true to your stats.
    
    Strategy Guide & Synergies (Choose 1-6):
    1: High Press (Needs: Discipline, Attack)
    2: Possession (Needs: Discipline)
    3: Counter Attack (Needs: Defense, Attack)
    4: Park the Bus (Needs: Defense, Discipline)
    5: Wing Play (Needs: Attack)
    6: Through Middle (Needs: Attack, Discipline)`;

    const userMessage = `Based strictly on your dominant trait (${dominantTrait}) and specific players, choose the ONE strategy (1-6) that fits best. Create an arrogant, highly tactical, and unique press conference quote (max 600 characters) explaining your choice. Do NOT use newlines. Return ONLY valid JSON: {"strategyId": number(1-6), "reasoning": "string"}`;

    try {
        const command = new InvokeModelCommand({
            modelId: "anthropic.claude-3-haiku-20240307-v1:0",
            contentType: "application/json", accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31", max_tokens: 512, system: systemPrompt, temperature: 0.8,
                messages: [{ role: "user", content: userMessage }]
            })
        });

        const response = await bedrockClient.send(command);
        let aiText = JSON.parse(new TextDecoder().decode(response.body)).content[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        aiText = aiText.replace(/[\n\r]/g, ' '); // Strip literal newlines to prevent JSON.parse errors
        const result = JSON.parse(aiText);
        return { strategyId: result.strategyId || 1, reasoning: result.reasoning?.substring(0, 1024) || "Taktiklerim sahada konuşur." };
    } catch (error) {
        console.error(`LLM Error (${agentName})`, error);
        const fallbacks = [
            { strategyId: 3, reasoning: "Sometimes the best tactic is patience. We'll sit deep, absorb the pressure, and hit them with devastating pace on the counter. My players know exactly when to strike — trust the process." },
            { strategyId: 1, reasoning: "We're going all out — high press, high energy, no mercy. The opposition won't have a second on the ball. My squad thrives under pressure and we'll suffocate them from the first whistle." },
            { strategyId: 5, reasoning: "Width is everything in modern football. We'll stretch the pitch, exploit the flanks with our electric wingers, and deliver pinpoint crosses into the box. They won't be able to handle our wide play." },
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

async function runTournament() {
    console.log("🚀 MonaDraft: Yeni Sezon Orkestratörü Başlatılıyor...\n");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const adminWallet = new ethers.Wallet(process.env.ADMIN_KEY!, provider);
    const adminContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);

    // 1. Turnuva Durumunu Kontrol Et ve Gerekirse Yeni Sezon Başlat
    let tId = await adminContract.currentTournamentId();
    let tournament = await adminContract.tournaments(tId);

    if (tournament.state !== 0n) { // Eğer turnuva OPEN (0) değilse (yani bitmiş veya yarım kalmışsa)
        console.log(`📅 Turnuva ${tId} açık değil (Durum: ${tournament.state}). Yeni sezon (KNOCKOUT_8) başlatılıyor...`);
        const tx = await adminContract.startNewSeason(0); // 0 = KNOCKOUT_8 enum değeri
        await tx.wait();
        tId = await adminContract.currentTournamentId();
        console.log(`✅ Yeni Sezon ID: ${tId} oluşturuldu!\n`);
    } else {
        console.log(`📅 Mevcut açık turnuva bulundu: Sezon ${tId}\n`);
    }

    const agentWallets = Array.from({ length: 8 }, (_, i) => new ethers.Wallet(process.env[`AGENT_KEY_${i + 1}`]!, provider));
    const agentDataMap = new Map();

    console.log("=== AŞAMA 1: AJANLAR TURNUVAYA GİRİŞ YAPIYOR ===");
    await Promise.all(agentWallets.map(async (wallet, i) => {
        const agentContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        const profile = await adminContract.agents(wallet.address);

        if (!profile.isRegistered) {
            console.error(`❌ HATA: Ajan ${i + 1} kayıtlı değil. Lütfen önce 'setup_agents.ts' scriptini çalıştırın!`);
            return;
        }

        const id = { attack: profile.attack, defense: profile.defense, discipline: profile.discipline };

        try {
            const txEnter = await agentContract.enterTournament(tId, { value: ENTRY_FEE });
            await txEnter.wait();
            console.log(`🎟️ [${profile.name}] Sezon ${tId}'ye katıldı.`);
        } catch (e) {
            console.log(`⏩ [${profile.name}] zaten bu turnuvada (veya kapasite dolu).`);
        }

        agentDataMap.set(wallet.address, { name: profile.name, identity: id });
    }));

    console.log("\n=== AŞAMA 2: DRAFT (KADROLAR ÇEKİLİYOR) ===");
    const draftResults = draftTeams();

    await Promise.all(agentWallets.map(async (wallet, i) => {
        const { formation, team } = draftResults[i];
        const playersWithPositions = team.map(p => `${p.name} (${p.position})`);

        const avg = team.reduce((acc, val) => ({ pace: acc.pace + val.pace / 11, shooting: acc.shooting + val.shooting / 11, passing: acc.passing + val.passing / 11, tackling: acc.tackling + val.tackling / 11 }), { pace: 0, shooting: 0, passing: 0, tackling: 0 });
        const data = agentDataMap.get(wallet.address);
        data.teamAvg = { pace: Math.round(avg.pace), shooting: Math.round(avg.shooting), passing: Math.round(avg.passing), tackling: Math.round(avg.tackling) };
        data.playersWithPositions = playersWithPositions;
        data.formation = formation;
        agentDataMap.set(wallet.address, data);

        // Admin cannot submit transactions in parallel with the exact same nonce reliably without manual nonce management.
        // For simplicity and safety on testnets, we'll keep the admin's setTeam calls sequential.
    }));

    // Perform Admin TXs in parallel using manual nonce management to avoid 8-block wait
    const currentNonce = await adminWallet.getNonce();
    const setTeamTxs = await Promise.all(agentWallets.map(async (wallet, i) => {
        const data = agentDataMap.get(wallet.address);
        const { team } = draftResults[i];

        const tx = await adminContract.setTeam(tId, wallet.address, team, { nonce: currentNonce + i });
        console.log(`⚽ [${data.name}] Formation: ${data.formation} | Stars: ${data.playersWithPositions.slice(0, 3).join(', ')} (TX gönderildi)`);
        return tx;
    }));

    console.log("⏳ Kadroların blokzincire yazılması bekleniyor (Tek blokta paralel)...");
    await Promise.all(setTeamTxs.map(tx => tx.wait()));
    console.log("✅ Tüm kadrolar başarıyla kaydedildi.");

    const openTx = await adminContract.openStrategyPhase(tId);
    await openTx.wait();

    console.log("\n=== AŞAMA 3: AI REASONING (AWS BEDROCK) ===");
    await Promise.all(agentWallets.map(async (wallet) => {
        const data = agentDataMap.get(wallet.address);
        console.log(`🧠 [${data.name}] taktik düşünüyor...`);

        const aiDecision = await getStrategyFromLLM(data.name, data.identity, data.teamAvg, data.playersWithPositions, data.formation);

        // Strategy commit is per agent wallet, so these can run safely in parallel
        const tx = await new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet).commitStrategy(tId, aiDecision.strategyId, aiDecision.reasoning);
        await tx.wait();

        console.log(`   -> Seçim: Taktik ${aiDecision.strategyId} | Açıklama: "${aiDecision.reasoning}"`);
    }));

    console.log("\n=== AŞAMA 4: TURNUVA OYNANIYOR (MONAD ŞOVU) ===");
    console.log(`⚙️ Tek bir işlemde (Single TX) Sezon ${tId} hesaplanıyor...`);
    const startTx = await adminContract.playEightFinalTournament(tId);
    await startTx.wait();
    console.log(`🏆 Turnuva Bitti! İşlem Hash: ${startTx.hash}\n`);

    const history = await adminContract.getMatches(tId);
    history.forEach((match: any, i: number) => {
        let round = i < 4 ? "Çeyrek Final" : i < 6 ? "Yarı Final" : "FİNAL";
        console.log(`[${round}] ${agentDataMap.get(match.teamA)?.name} (${match.scoreA})  VS  ${agentDataMap.get(match.teamB)?.name} (${match.scoreB}) -> KAZANAN: 👑 ${agentDataMap.get(match.winner)?.name}`);
    });
}

runTournament().catch(console.error);
