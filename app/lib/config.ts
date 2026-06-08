export type AppConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  defaultSupplierEmail: string;
};

const STORAGE_KEYS = {
  supabaseUrl: "secura.supabaseUrl",
  supabaseAnonKey: "secura.supabaseAnonKey",
  defaultSupplierEmail: "secura.defaultSupplierEmail",
} as const;

export const envConfig: AppConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  defaultSupplierEmail: process.env.NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL || "",
};

function readStorageValue(key: string): string {
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeStorageValue(key: string, value: string): void {
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // localStorage can be unavailable in strict browser contexts.
  }
}

export function getBrowserConfig(): AppConfig {
  return {
    supabaseUrl: readStorageValue(STORAGE_KEYS.supabaseUrl) || envConfig.supabaseUrl,
    supabaseAnonKey: readStorageValue(STORAGE_KEYS.supabaseAnonKey) || envConfig.supabaseAnonKey,
    defaultSupplierEmail:
      readStorageValue(STORAGE_KEYS.defaultSupplierEmail) || envConfig.defaultSupplierEmail,
  };
}

export function saveBrowserConfig(config: AppConfig): void {
  writeStorageValue(STORAGE_KEYS.supabaseUrl, config.supabaseUrl.trim());
  writeStorageValue(STORAGE_KEYS.supabaseAnonKey, config.supabaseAnonKey.trim());
  writeStorageValue(STORAGE_KEYS.defaultSupplierEmail, config.defaultSupplierEmail.trim());
}

export function hasSupabaseConfig(config: AppConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}
