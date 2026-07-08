import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, ProductCreateInput, ProductUpdateInput } from "@/types/products";

const productSelect =
  "id, created_at, name, amount, product_image, features, stock_quantity, low_stock_threshold, supplier_email";

export async function fetchProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Product[];
}

export async function createProduct(
  supabase: SupabaseClient,
  input: ProductCreateInput,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      amount: input.amount,
      features: null,
      low_stock_threshold: input.low_stock_threshold,
      name: input.name.trim(),
      product_image: input.product_image.trim(),
      stock_quantity: input.stock_quantity,
      supplier_email: input.supplier_email.trim() || null,
    })
    .select(productSelect)
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  input: ProductUpdateInput,
): Promise<Product> {
  const updateData: Record<string, any> = {};
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.low_stock_threshold !== undefined) updateData.low_stock_threshold = input.low_stock_threshold;
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.product_image !== undefined) updateData.product_image = input.product_image.trim();
  if (input.stock_quantity !== undefined) updateData.stock_quantity = input.stock_quantity;
  if (input.supplier_email !== undefined) {
    updateData.supplier_email = input.supplier_email.trim() || null;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select(productSelect)
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function deleteProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

