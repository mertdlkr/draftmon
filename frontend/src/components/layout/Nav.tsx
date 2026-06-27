"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState } from "react";

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
                <img src="/logo.png" alt="MonaDraft Logo" className="h-8 md:h-10 w-auto" />
                <div className="flex items-center gap-2">
                    <span className="font-pixel text-sm md:text-base tracking-tight text-primary">MonaDraft</span>
                    <span className="hidden md:flex px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded text-[10px] font-code font-bold uppercase tracking-wider items-center whitespace-nowrap">
                        Built For Agents
                    </span>
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

            {/* Mobile Menu Toggle */}
            <button
                className="lg:hidden flex items-center justify-center p-2 text-slate-700 hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                <span className="material-symbols-outlined text-3xl">
                    {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
            </button>

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
