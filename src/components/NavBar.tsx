"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthStatus } from "./AuthStatus";
import { Button } from "./Button";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/lib/api";

export function NavBar() {
    const [role, setRole] = useState<string | null>(null);

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


    return (
        <nav className="bg-emerald-600 h-16 flex items-center px-6">
            <div className="flex gap-6">
                <Link href="/" className="text-white text-lg hover:text-emerald-200">Home</Link>
                <Link href="/missions" className="text-white text-lg hover:text-emerald-200">Missions</Link>
                {(role === "verifier" || role === "maintainer") && <Link href="/dashboard" className="text-white text-lg hover:text-emerald-200">Dashboard</Link>}
                {role === "maintainer" && <Link href="/maintainers" className="text-white text-lg hover:text-emerald-200">Maintainers</Link>}
            </div>
            <div className="flex gap-4 ml-auto items-center">
                <Link href="/report">
                    <Button variant="secondary">Report Issue</Button>
                </Link>
                <AuthStatus />
            </div>
        </nav>
    )
}
