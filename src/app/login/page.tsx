"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Sign in</h1>
      <p className="text-gray-500 mb-6">Use your Google account to continue.</p>
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? "Redirecting..." : "Sign in with Google"}
      </Button>
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </main>
  );
}
