"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "HOME" },
    { href: "/tournaments", label: "TOURNAMENTS" },
    { href: "/live", label: "LIVE" },
    { href: "/managers", label: "MANAGERS" },
    { href: "/draft", label: "DRAFT" },
];

export function Nav() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 h-[70px] bg-white border-b-[3px] border-[#13ec5b] px-6 md:px-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 no-underline">
                <img src="/logo.png" alt="MonaDraft Logo" className="h-8 md:h-10 w-auto" />
                <span className="font-pixel text-sm md:text-base tracking-tight text-[#13ec5b]">MonaDraft</span>
            </Link>

            {/* Links */}
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


        </nav>
    );
}
