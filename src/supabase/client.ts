"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envConfig, hasSupabaseConfig } from "./config";

const globalForSupabase = globalThis as typeof globalThis & {
  __securaSupabase?: SupabaseClient;
};

function sessionCookie(token: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `sb-access-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function createSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (typeof window !== "undefined" && globalForSupabase.__securaSupabase) {
    return globalForSupabase.__securaSupabase;
  }

  const client = createClient(envConfig.supabaseUrl, envConfig.supabasePublishableKey);

  client.auth.onAuthStateChange((event, session) => {
    if (typeof window === "undefined") {
      return;
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      sessionCookie(session?.access_token || "", 86400);
    } else if (event === "SIGNED_OUT") {
      sessionCookie("", 0);
    }
  });

  if (typeof window !== "undefined") {
    globalForSupabase.__securaSupabase = client;
  }

  return client;
}
