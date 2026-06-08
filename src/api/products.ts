import type { SupabaseClient } from "@supabase/supabase-js";

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
