import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "@/lib/chains";

export { monadTestnet };

export const config = getDefaultConfig({
  appName: "MonaDraft",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [monadTestnet],
  ssr: true,
});
