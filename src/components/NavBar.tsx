"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthStatus } from "./AuthStatus";
import { Button } from "./Button";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/lib/api";

export function NavBar() {
    const [isVerifier, setIsVerifier] = useState(false);

    useEffect(() => {
        async function checkRole() {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) { setIsVerifier(false); return; }
            try {
                const { role } = await getUserRole(token);
                setIsVerifier(role === "verifier");
            } catch {
                setIsVerifier(false);
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
                {isVerifier && <Link href="/dashboard" className="text-white text-lg hover:text-emerald-200">Dashboard</Link>}
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
