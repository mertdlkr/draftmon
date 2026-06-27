import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const ABI = [
    "function currentTournamentId() external view returns (uint256)",
    "function playEightFinalTournament(uint256 _tId) external"
];
const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);
const adminWallet = new ethers.Wallet(process.env.ADMIN_KEY, provider);
const adminContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, adminWallet);

async function run() {
    try {
        const tId = await adminContract.currentTournamentId();
        console.log("Finishing tournament", tId.toString());
        const tx = await adminContract.playEightFinalTournament(tId);
        await tx.wait();
        console.log("Success!");
    } catch (e) {
        console.error(e);
    }
}
run();
