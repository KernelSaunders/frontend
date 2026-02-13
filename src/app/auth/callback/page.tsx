"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function finishAuth() {
      const query = new URLSearchParams(window.location.search);
      const code = query.get("code");
      const queryError = query.get("error_description") || query.get("error");

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const hashError = hash.get("error_description") || hash.get("error");

      if (queryError || hashError) {
        setError(queryError || hashError || "Authentication error");
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        // Logging function
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[Auth] JWT:", session?.access_token);
        router.replace("/");
        return;
      }

      if (accessToken && refreshToken) {
        const { error: setErrorResult } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setErrorResult) {
          setError(setErrorResult.message);
          return;
        }
        console.log("[Auth] JWT:", accessToken);
        router.replace("/");
        return;
      }

      setError("Missing auth code or token.");
    }

    finishAuth();
  }, [router]);

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Signing you in...</h1>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <p className="text-gray-600">Completing authentication.</p>
      )}
    </main>
  );
}
