"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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
    <div className="flex items-center gap-3 text-sm text-gray-700">
      {email ? (
        <>
          <span>Signed in as {email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="border rounded px-3 py-1 hover:bg-gray-100"
          >
            Sign out
          </button>
        </>
      ) : (
        <Link href="/login" className="border rounded px-3 py-1 hover:bg-gray-100">
          Sign in
        </Link>
      )}
    </div>
  );
}
