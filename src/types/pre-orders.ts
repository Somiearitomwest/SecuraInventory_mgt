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

export type SupabaseRecentPreOrderRow = Omit<RecentPreOrder, "products" | "customers"> & {
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
