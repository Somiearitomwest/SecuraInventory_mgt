import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envConfig, hasSupabaseConfig } from "./config";

export type Product = {
  id: string;
  created_at: string | null;
  name: string;
  amount: number | string | null;
  product_image: string | null;
  features: unknown;
  stock_quantity: number | string | null;
  low_stock_threshold: number | string | null;
  supplier_email: string | null;
};

export type RecentPreOrder = {
  id: string;
  created_at: string | null;
  product_id: string | null;
  customer_id: string | null;
  quantity: number | string | null;
  total_amount: number | string | null;
  products?: {
    name: string | null;
    product_image: string | null;
  } | null;
  customers?: {
    name: string | null;
    email: string | null;
  } | null;
};

type SupabaseRecentPreOrderRow = Omit<RecentPreOrder, "products" | "customers"> & {
  products?:
    | {
        name: string | null;
        product_image: string | null;
      }
    | Array<{
        name: string | null;
        product_image: string | null;
      }>
    | null;
  customers?:
    | {
        name: string | null;
        email: string | null;
      }
    | Array<{
        name: string | null;
        email: string | null;
      }>
    | null;
};

function firstRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] || null;
  }

  return relation || null;
}

function normalizeRecentPreOrder(row: SupabaseRecentPreOrderRow): RecentPreOrder {
  return {
    ...row,
    products: firstRelation(row.products),
    customers: firstRelation(row.customers),
  };
}

export function createSecuraSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(envConfig.supabaseUrl, envConfig.supabaseAnonKey);
}

export async function fetchProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, created_at, name, amount, product_image, features, stock_quantity, low_stock_threshold, supplier_email",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Product[];
}

export async function fetchRecentPreOrders(
  supabase: SupabaseClient,
  limit = 8,
): Promise<RecentPreOrder[]> {
  const joinedResult = await supabase
    .from("pre_orders")
    .select(
      `
      id,
      created_at,
      product_id,
      customer_id,
      quantity,
      total_amount,
      products ( name, product_image ),
      customers ( name, email )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!joinedResult.error) {
    return ((joinedResult.data || []) as SupabaseRecentPreOrderRow[]).map(normalizeRecentPreOrder);
  }

  const fallbackResult = await supabase
    .from("pre_orders")
    .select("id, created_at, product_id, customer_id, quantity, total_amount")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (fallbackResult.error) {
    throw fallbackResult.error;
  }

  return (fallbackResult.data || []) as RecentPreOrder[];
}
