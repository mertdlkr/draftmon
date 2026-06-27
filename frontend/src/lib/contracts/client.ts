import { ethers } from "ethers";
import { MONAD_LEAGUE_ABI } from "./abi";

const RPC_URLS = [
    process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz",
    "https://rpc.ankr.com/monad_testnet",
    "https://monad-testnet.drpc.org",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

// Round-robin index for distributing requests across RPCs
let _rpcIndex = 0;

// Cache providers per URL to avoid re-creating them
const _providers = new Map<string, ethers.JsonRpcProvider>();

function getNextProvider(): ethers.JsonRpcProvider {
    const url = RPC_URLS[_rpcIndex % RPC_URLS.length];
    _rpcIndex++;

    let provider = _providers.get(url);
    if (!provider) {
        provider = new ethers.JsonRpcProvider(url);
        _providers.set(url, provider);
    }
    return provider;
}

export function getProvider(): ethers.JsonRpcProvider {
    return getNextProvider();
}

export function getContract(): ethers.Contract {
    return new ethers.Contract(
        CONTRACT_ADDRESS,
        MONAD_LEAGUE_ABI,
        getNextProvider()
    );
}
