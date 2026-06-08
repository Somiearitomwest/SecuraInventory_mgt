export type SupabaseEnvConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  defaultSupplierEmail: string;
};

export const envConfig: SupabaseEnvConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  defaultSupplierEmail: process.env.NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL || "",
};

export function hasSupabaseConfig(config: SupabaseEnvConfig = envConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}
