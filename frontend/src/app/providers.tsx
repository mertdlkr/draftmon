"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#f59e0b", // Match amber theme
            accentColorForeground: "#0f172a",
            borderRadius: "none", // Pixel block style
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
