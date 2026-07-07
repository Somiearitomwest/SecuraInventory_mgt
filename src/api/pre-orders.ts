import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecentPreOrder, SupabaseRecentPreOrderRow } from "@/types/pre-orders";

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
