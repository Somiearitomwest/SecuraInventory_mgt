import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envConfig, hasSupabaseConfig } from "./config";

export function createSecuraSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(envConfig.supabaseUrl, envConfig.supabaseAnonKey);
}
