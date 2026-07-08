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

export type ProductCreateInput = {
  name: string;
  amount: number;
  product_image: string;
  stock_quantity: number;
  low_stock_threshold: number;
  supplier_email: string;
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

