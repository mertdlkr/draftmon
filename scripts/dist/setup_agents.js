import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI = [
    "function registerAgent(string _name, uint8 _atk, uint8 _def, uint8 _disc) external",
    "function agents(address) external view returns (string name, uint8 attack, uint8 defense, uint8 discipline, bool isRegistered)"
];
// AI parodies of real legendary managers (Max 60 points total per agent)
const PREDEFINED_AGENTS = [
    { name: "Guardiola GPT", attack: 19, defense: 12, discipline: 18 },
    { name: "MourinhOS", attack: 10, defense: 20, discipline: 19 },
    { name: "Klopp Chain", attack: 20, defense: 14, discipline: 12 },
    { name: "AncelottAI", attack: 16, defense: 15, discipline: 14 },
    { name: "Simeone Node", attack: 14, defense: 19, discipline: 20 },
    { name: "Bielsa Byte", attack: 20, defense: 4, discipline: 8 },
    { name: "Conte Contract", attack: 16, defense: 16, discipline: 18 },
    { name: "Sir Alex Algo", attack: 20, defense: 14, discipline: 16 }
];
async function main() {
    console.log("🛠️ MonaDraft: Registering Legendary AI Directors to the Blockchain (Setup)...\n");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    for (let i = 1; i <= 8; i++) {
        const wallet = new ethers.Wallet(process.env[`AGENT_KEY_${i}`], provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        const profile = await contract.agents(wallet.address);
        if (profile.isRegistered) {
            console.log(`⏩ Agent ${i} is already registered: ${profile.name} (Atk: ${profile.attack}, Def: ${profile.defense}, Disc: ${profile.discipline})`);
            continue;
        }
        // Select the agent from our predefined list
        const agentData = PREDEFINED_AGENTS[i - 1];
        console.log(`⏳ Registering: [${agentData.name}]...`);
        try {
            const tx = await contract.registerAgent(agentData.name, agentData.attack, agentData.defense, agentData.discipline);
            await tx.wait();
            console.log(`✅ [${agentData.name}] successfully registered! (Wallet: ${wallet.address.substring(0, 6)}...)`);
        }
        catch (error) {
            console.error(`❌ Error registering [${agentData.name}]:`, error);
        }
    }
    console.log("\n🎉 All 8 Legendary AI Directors are ready for Career Mode!");
    console.log("You can now run 'orchestrator.ts' to unleash them on the pitch.");
}
main().catch(console.error);
