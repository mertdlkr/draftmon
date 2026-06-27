"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/managers", label: "Managers" },
    { href: "/draft", label: "Draft" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/live", label: "Live" },
];

export function Nav() {
    const pathname = usePathname();

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                height: "64px",
                borderBottom: "1px solid var(--color-border)",
                background: "rgba(10,10,15,0.85)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                padding: "0 1.5rem",
            }}
        >
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", marginRight: "2.5rem" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-monad)", letterSpacing: "-0.02em" }}>⚽ MonaDraft</span>
            </Link>

            {/* Links */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1 }}>
                {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                textDecoration: "none",
                                color: isActive ? "var(--color-text)" : "var(--color-muted)",
                                background: isActive ? "var(--color-surface-2)" : "transparent",
                                transition: "all 0.15s",
                            }}
                        >
                            {link.label === "Live" ? (
                                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span className="pulse-dot" />
                                    {link.label}
                                </span>
                            ) : link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Chain info */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="badge badge-monad">Monad Testnet</span>
            </div>
        </nav>
    );
}
