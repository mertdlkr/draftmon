"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NAV_LINKS = [
    { href: "/", label: "HOME" },
    { href: "/rooms", label: "ROOMS" },
    { href: "/leaderboard", label: "LEADERBOARD" },
    { href: "/scan", label: "SCAN" },
    { href: "/admin", label: "ADMIN" },
];

export function Nav() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close menu when route changes
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="sticky top-0 z-50 h-[70px] bg-white border-b-[3px] border-primary px-6 md:px-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 no-underline" onClick={closeMobileMenu}>
                <img src="/logo.png" alt="DraftMon Logo" className="h-8 md:h-10 w-auto" />
                <div className="flex items-center gap-2">
                    <span className="font-pixel text-sm md:text-base tracking-tight text-primary">DraftMon</span>
                </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
                {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link text-sm font-bold uppercase tracking-wide transition-colors no-underline ${isActive ? "text-primary nav-active" : "text-slate-700 hover:text-primary"}`}
                        >
                            {link.label === "LIVE" ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    {link.label}
                                </span>
                            ) : link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Connect Wallet & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== "loading";
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === "authenticated");

                    return (
                      <div
                        {...(!ready && {
                          "aria-hidden": true,
                          style: {
                            opacity: 0,
                            pointerEvents: "none",
                            userSelect: "none",
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="font-pixel text-[10px] px-3 py-2 bg-emerald-400 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-bold"
                              >
                                CONNECT WALLET
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="font-pixel text-[10px] px-3 py-2 bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                              >
                                WRONG NETWORK
                              </button>
                            );
                          }

                          return (
                            <div className="flex gap-2">
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="hidden sm:flex items-center gap-1 font-pixel text-[10px] px-3 py-2 bg-slate-100 border-2 border-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                              >
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 12,
                                      height: 12,
                                      borderRadius: 999,
                                      overflow: "hidden",
                                      marginRight: 4,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? "Chain icon"}
                                        src={chain.iconUrl}
                                        style={{ width: 12, height: 12 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain.name}
                              </button>

                              <button
                                onClick={openAccountModal}
                                type="button"
                                className="font-pixel text-[10px] px-3 py-2 bg-slate-100 border-2 border-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                              >
                                {account.displayName}
                                {account.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ""}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
                
                <button
                    className="lg:hidden flex items-center justify-center p-2 text-slate-700 hover:text-primary transition-colors"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined text-3xl">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-[70px] left-0 w-full bg-white border-b-[3px] border-primary flex flex-col items-center py-6 gap-6 shadow-xl lg:hidden z-40">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMobileMenu}
                                className={`text-lg font-bold uppercase tracking-wide transition-colors no-underline ${isActive ? "text-primary" : "text-slate-700 hover:text-primary"}`}
                            >
                                {link.label === "LIVE" ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                        {link.label}
                                    </span>
                                ) : link.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
