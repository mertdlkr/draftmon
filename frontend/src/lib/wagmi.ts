import { defineChain } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  blockExplorers: { default: { name: "MonadScan", url: "https://testnet.monadexplorer.com" } },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "MonaDraft",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [monadTestnet],
  ssr: true,
});
