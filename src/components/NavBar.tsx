"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthStatus } from "./AuthStatus";
import { Button } from "./Button";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/lib/api";
import { hasMaintainerAccess, hasVerifierAccess } from "@/lib/roles";

export function NavBar() {
    const [role, setRole] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        async function checkRole() {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) { setRole(null); return; }
            try {
                const { role } = await getUserRole(token);
                setRole(role);
            } catch {
                setRole(null);
            }
        }

        checkRole();

        const { data: subscription } = supabase.auth.onAuthStateChange(() => {
            checkRole();
        });

        return () => { subscription.subscription.unsubscribe(); };
    }, []);

    const navLinks = [
        { href: "/missions", label: "Missions", show: true },
        { href: "/dashboard", label: "Verifiers", show: hasVerifierAccess(role) },
        { href: "/maintainers", label: "Maintainers", show: hasMaintainerAccess(role) },
    ].filter((link) => link.show);

    return (
        <nav className="bg-emerald-600 px-4 sm:px-6">
            <div className="flex min-h-16 items-center gap-4">
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="inline-flex min-h-16 items-center text-white text-lg font-semibold tracking-[0.06em] hover:text-emerald-100"
                    >
                        Sourcr
                    </Link>
                    <div className="hidden md:flex md:items-center md:gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="inline-flex min-h-16 items-center text-white text-lg hover:text-emerald-200">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="ml-auto hidden md:flex md:items-center md:gap-4">
                    <Link href="/report">
                        <Button variant="secondary">Report Issue</Button>
                    </Link>
                    <AuthStatus />
                </div>

                <button
                    type="button"
                    aria-expanded={isMenuOpen}
                    aria-controls="mobile-navigation"
                    aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/60 bg-emerald-500/20 text-white transition hover:bg-emerald-500/30 md:hidden"
                >
                    <span className="sr-only">Menu</span>
                    <span className="flex w-5 flex-col gap-1.5">
                        <span className={`block h-0.5 w-full rounded bg-current transition ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
                        <span className={`block h-0.5 w-full rounded bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 w-full rounded bg-current transition ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                    </span>
                </button>
            </div>

            {isMenuOpen && (
                <div id="mobile-navigation" className="border-t border-emerald-500/60 py-4 md:hidden">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="rounded-xl px-3 py-3 text-base font-medium text-white transition hover:bg-emerald-500/25"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/report" className="pt-2" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="secondary" className="w-full justify-center">
                                Report Issue
                            </Button>
                        </Link>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-700/20 p-3">
                            <AuthStatus
                                className="w-full flex-col items-start gap-3"
                                emailClassName="max-w-full break-all text-emerald-50"
                                buttonClassName="w-full justify-center"
                            />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
