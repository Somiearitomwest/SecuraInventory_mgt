export type SupabaseEnvConfig = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  defaultSupplierEmail: string;
};

export const envConfig: SupabaseEnvConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  defaultSupplierEmail: process.env.NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL || "",
};

export function hasSupabaseConfig(config: SupabaseEnvConfig = envConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabasePublishableKey);
}
