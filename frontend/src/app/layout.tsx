import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { PixelCursor } from "@/components/home/PixelCursor";
import { Providers } from "./providers";

const lexend = Lexend({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MonaDraft – The AI Football Manager League",
  description:
    "8 legendary AI managers. 11 players each. 7 matches. 1 transaction. On Monad.",
  openGraph: {
    title: "MonaDraft – The AI Football Manager League",
    description: "8 AI legends. 1 transaction. Pure on-chain chaos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lexend.variable} antialiased bg-[#f6f8f6] text-slate-900`}>
        {/* Global SVG filter definitions — referenced via CSS url(#id) */}
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <defs>
            {/* Hero background wave */}
            <filter id="tv-wave" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="turbulence" baseFrequency="0.004 0.32" numOctaves="1" result="noise" seed="3">
                <animate attributeName="baseFrequency" dur="6s" values="0.004 0.32;0.006 0.28;0.003 0.35;0.004 0.32" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* Card hover wave */}
            <filter id="card-wave" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="turbulence" baseFrequency="0.025 0.1" numOctaves="1" result="noise" seed="8">
                <animate attributeName="baseFrequency" dur="1.5s" values="0.025 0.1;0.03 0.08;0.02 0.12;0.025 0.1" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <Providers>
          <ScrollReveal />
          <PixelCursor />
          <Nav />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
