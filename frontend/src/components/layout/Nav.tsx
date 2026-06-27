"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState } from "react";

const NAV_LINKS = [
    { href: "/", label: "HOME" },
    { href: "/tournaments", label: "TOURNAMENTS" },
    { href: "/live", label: "LIVE" },
    { href: "/managers", label: "MANAGERS" },
    { href: "/draft", label: "DRAFT" },
];

export function Nav() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close menu when route changes
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="sticky top-0 z-50 h-[70px] bg-white border-b-[3px] border-[#13ec5b] px-6 md:px-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 no-underline" onClick={closeMobileMenu}>
                <img src="/logo.png" alt="MonaDraft Logo" className="h-8 md:h-10 w-auto" />
                <span className="font-pixel text-sm md:text-base tracking-tight text-[#13ec5b]">MonaDraft</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
                {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-bold uppercase tracking-wide transition-colors no-underline ${isActive ? "text-[#13ec5b]" : "text-slate-700 hover:text-[#13ec5b]"}`}
                        >
                            {link.label === "LIVE" ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#13ec5b] rounded-full animate-pulse" />
                                    {link.label}
                                </span>
                            ) : link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="lg:hidden flex items-center justify-center p-2 text-slate-700 hover:text-[#13ec5b] transition-colors"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                <span className="material-symbols-outlined text-3xl">
                    {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-[70px] left-0 w-full bg-white border-b-[3px] border-[#13ec5b] flex flex-col items-center py-6 gap-6 shadow-xl lg:hidden z-40">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMobileMenu}
                                className={`text-lg font-bold uppercase tracking-wide transition-colors no-underline ${isActive ? "text-[#13ec5b]" : "text-slate-700 hover:text-[#13ec5b]"}`}
                            >
                                {link.label === "LIVE" ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-[#13ec5b] rounded-full animate-pulse" />
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
