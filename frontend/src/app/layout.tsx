import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <Nav />
        <main className="min-h-screen pt-16">{children}</main>
      </body>
    </html>
  );
}
