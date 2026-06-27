import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";

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
      <body className={`${lexend.variable} antialiased bg-[#f6f8f7] text-slate-900`}>
        <Nav />
        <main className="min-h-screen pt-[70px]">{children}</main>
      </body>
    </html>
  );
}
