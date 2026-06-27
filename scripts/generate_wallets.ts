import { ethers } from "ethers";

console.log("==========================================");
console.log("🎟️  MONAD AI LEAGUE - WALLET GENERATOR  🎟️");
console.log("==========================================\n");

// Generating 8 agents + 1 admin just in case
const NUM_WALLETS = 9;

for (let i = 0; i < NUM_WALLETS; i++) {
    const wallet = ethers.Wallet.createRandom();

    if (i === 0) {
        console.log(`[ ADMIN WALLET ]`);
        console.log(`ADMIN_KEY=${wallet.privateKey}`);
    } else {
        console.log(`[ AGENT ${i} ]`);
        console.log(`AGENT_KEY_${i}=${wallet.privateKey}`);
    }

    console.log(`Address:     ${wallet.address}`);
    console.log(`Seed Phrase: ${wallet.mnemonic?.phrase}`);
    console.log("------------------------------------------");
}

console.log("\n✅ Copy the keys above into your .env file!");
