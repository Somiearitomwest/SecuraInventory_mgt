export type AppConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  defaultSupplierEmail: string;
};

export const envConfig: AppConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  defaultSupplierEmail: process.env.NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL || "",
};

export function hasSupabaseConfig(config: AppConfig = envConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}
