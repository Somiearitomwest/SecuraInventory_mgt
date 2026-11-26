import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envConfig } from "@/supabase/config";
import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/types/products";

const productSelect =
  "id, created_at, name, amount, previous_amount, product_image, features, stock_quantity, low_stock_threshold, supplier_email";

async function adminWriteClient(
  supabase: SupabaseClient,
): Promise<SupabaseClient> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  let session = data.session;
  if (session && session.user.app_metadata?.role !== "admin") {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session ?? session;
  }

  if (!session) {
    throw new Error(
      "Your dashboard session expired. Sign in again, then retry.",
    );
  }

  if (session.user.app_metadata?.role !== "admin") {
    throw new Error(
      "This account cannot update products. Sign in with an admin account.",
    );
  }

  const accessToken = session.access_token;
  return createClient(envConfig.supabaseUrl, envConfig.supabasePublishableKey, {
    accessToken: async () => accessToken,
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function throwIfWriteFailed(error: { code?: string; message?: string } | null) {
  if (!error) {
    return;
  }

  if (error.code === "PGRST116") {
    throw new Error(
      "Product was not updated. Sign in with an admin account and try again.",
    );
  }

  throw error;
}

export async function fetchProducts(
  supabase: SupabaseClient,
): Promise<Product[]> {
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
  const writer = await adminWriteClient(supabase);
  const { data, error } = await writer
    .from("products")
    .insert({
      amount: input.amount,
      previous_amount: input.previous_amount,
      features: null,
      low_stock_threshold: input.low_stock_threshold,
      name: input.name.trim(),
      product_image: input.product_image.trim(),
      stock_quantity: input.stock_quantity,
      supplier_email: input.supplier_email.trim() || null,
    })
    .select(productSelect)
    .single();

  throwIfWriteFailed(error);
  return data as Product;
}

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  input: ProductUpdateInput,
): Promise<Product> {
  if (!id) {
    throw new Error("Missing product id.");
  }

  const updateData = Object.fromEntries(
    Object.entries({
      amount: input.amount,
      previous_amount: input.previous_amount,
      low_stock_threshold: input.low_stock_threshold,
      stock_quantity: input.stock_quantity,
      name: input.name?.trim(),
      product_image: input.product_image?.trim(),
      supplier_email:
        input.supplier_email === undefined
          ? undefined
          : input.supplier_email.trim() || null,
    }).filter(([, v]) => v !== undefined),
  );

  const writer = await adminWriteClient(supabase);
  const { data, error } = await writer
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select(productSelect)
    .single();

  throwIfWriteFailed(error);
  return data as Product;
}

export async function deleteProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const writer = await adminWriteClient(supabase);
  const { error } = await writer.from("products").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
