import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envConfig, hasSupabaseConfig } from "./config";

let clientInstance: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (clientInstance) {
    return clientInstance;
  }

  clientInstance = createClient(envConfig.supabaseUrl, envConfig.supabasePublishableKey);

  clientInstance.auth.onAuthStateChange((event, session) => {
    if (typeof window === "undefined") {
      return;
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const token = session?.access_token || "";
      document.cookie = `sb-access-token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;
    } else if (event === "SIGNED_OUT") {
      document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax; Secure`;
    }
  });

  return clientInstance;
}

