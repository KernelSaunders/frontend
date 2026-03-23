"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "./Button";

export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.session?.user.email ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex items-center gap-3 text-sm text-emerald-50">
      {email ? (
        <>
          <span>{email}</span>
          <Button variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </>
      ) : (
        <Link href="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      )}
    </div>
  );
}
