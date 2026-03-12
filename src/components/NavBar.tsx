"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthStatus } from "./AuthStatus";
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
        <nav className = "navbar">
            <div className = "navleft">
                <Link href = "/">Home</Link>
                <Link href = "/missions">Missions</Link>
                {isVerifier && <Link href = "/dashboard">Dashboard</Link>}
            </div>
            <div className = "navright">
                <Link href = "/report">Report Issue</Link>
                <AuthStatus />
            </div>
        </nav>
    )
}
