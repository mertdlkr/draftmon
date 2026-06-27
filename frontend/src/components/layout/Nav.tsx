"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "HOME" },
    { href: "/managers", label: "MANAGERS" },
    { href: "/draft", label: "DRAFT" },
    { href: "/tournaments", label: "TOURNAMENTS" },
    { href: "/live", label: "LIVE" },
];

export function Nav() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 h-[70px] bg-white border-b-[4px] border-[#16a34a] px-4 md:px-10 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 no-underline">
                <div className="w-10 h-10 bg-[#16a34a] flex items-center justify-center pixel-border retro-shadow-sm">
                    <span className="material-symbols-outlined text-white text-2xl">sports_soccer</span>
                </div>
                <span className="font-pixel text-[#16a34a] text-sm md:text-lg">MonaDraft</span>
            </Link>

            {/* Links */}
            <div className="hidden lg:flex items-center gap-8 font-pixel text-[10px]">
                {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`transition-colors no-underline ${isActive ? "text-[#16a34a]" : "text-slate-700 hover:text-[#16a34a]"}`}
                        >
                            {link.label === "LIVE" ? (
                                <span className="flex items-center gap-2">
                                    {link.label}
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                </span>
                            ) : link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Chain badge */}
            <div>
                <button className="bg-[#16a34a] text-white font-pixel text-[10px] px-4 py-2 pixel-border retro-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer">
                    MONAD TESTNET
                </button>
            </div>
        </nav>
    );
}
