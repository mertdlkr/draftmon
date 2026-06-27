import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { draftTeams } from "./players";

dotenv.config({ path: "../.env" });

const RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

const ABI = [
    "function setTeam(address _agentWallet, tuple(string name, uint8 pace, uint8 shooting, uint8 passing, uint8 tackling)[11] _players) external",
    "function openStrategyPhase() external"
];

async function pushPlayers() {
    console.log("==========================================");
    console.log("⚽ PUSHING PLAYERS TO CONTRACT");
    console.log("==========================================\n");

    if (!CONTRACT_ADDRESS) {
        throw new Error("Missing CONTRACT_ADDRESS in .env");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const adminWallet = new ethers.Wallet(process.env.ADMIN_KEY!, provider);
    const adminContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);

    const agentWallets = Array.from({ length: 8 }, (_, i) => new ethers.Wallet(process.env[`AGENT_KEY_${i + 1}`]!, provider));

    const teams = draftTeams();

    for (let i = 0; i < 8; i++) {
        const wallet = agentWallets[i];
        const team = teams[i];

        console.log(`Pushing 11 drafted players for Agent ${i + 1} (${wallet.address})...`);
        const tx = await adminContract.setTeam(wallet.address, team);
        await tx.wait();
        console.log(`✅ [Agent ${i + 1}] Team pushed! Tx: ${tx.hash}`);
    }

    // Optionally open the strategy phase here if ready
    // const rx = await adminContract.openStrategyPhase();
    // await rx.wait();
    // console.log("Strategy phase opened.");

    console.log("\n✅ All 8 teams have been successfully pushed to the contract!");
}

pushPlayers().catch(console.error);
