export type StockStatus = "low" | "healthy";

export type ProductStockLike = {
  stock_quantity?: number | string | null;
  low_stock_threshold?: number | string | null;
  supplier_email?: string | null;
};

export type PreOrderValueLike = {
  total_amount?: number | string | null;
};

export function toNumber(value: unknown, fallback = 0): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

export function getProductStockStatus(product: ProductStockLike): StockStatus {
  const stockQuantity = toNumber(product?.stock_quantity);
  const lowStockThreshold = toNumber(product?.low_stock_threshold);

  return stockQuantity <= lowStockThreshold ? "low" : "healthy";
}

export function isLowStockProduct(product: ProductStockLike): boolean {
  return getProductStockStatus(product) === "low";
}

export function getLowStockProducts<TProduct extends ProductStockLike>(products: TProduct[]): TProduct[] {
  return products.filter(isLowStockProduct);
}

export function getSuggestedReorderQuantity(product: ProductStockLike): number {
  const stockQuantity = toNumber(product?.stock_quantity);
  const lowStockThreshold = toNumber(product?.low_stock_threshold);

  return Math.max(lowStockThreshold * 2 - stockQuantity, 1);
}

export function resolveSupplierEmail(
  product: Pick<ProductStockLike, "supplier_email">,
  defaultSupplierEmail = "",
): string {
  const productSupplierEmail = String(product?.supplier_email || "").trim();
  const fallbackEmail = String(defaultSupplierEmail || "").trim();

  return productSupplierEmail || fallbackEmail;
}

export function buildSupplierMessage({
  productName,
  requestedQuantity,
  stockQuantity,
  lowStockThreshold,
}: {
  productName: string;
  requestedQuantity: number | string | null;
  stockQuantity: number | string | null;
  lowStockThreshold: number | string | null;
}): string {
  return [
    "Hello,",
    "",
    `Please prepare a restock order for ${toNumber(requestedQuantity, 1)} units of ${productName}.`,
    "",
    `Current stock: ${toNumber(stockQuantity)}`,
    `Low-stock threshold: ${toNumber(lowStockThreshold)}`,
    "",
    "Regards,",
    "Secura Digital Systems",
  ].join("\n");
}

export function buildMailtoHref({
  recipient,
  subject,
  body,
}: {
  recipient: string;
  subject: string;
  body: string;
}): string {
  const encodedRecipient = encodeURIComponent(String(recipient || "").trim());
  const encodedSubject = encodeURIComponent(String(subject || ""));
  const encodedBody = encodeURIComponent(String(body || ""));

  return `mailto:${encodedRecipient}?subject=${encodedSubject}&body=${encodedBody}`;
}

export function computeDashboardMetrics({
  products,
  preOrders,
}: {
  products: ProductStockLike[];
  preOrders: PreOrderValueLike[];
}): {
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  totalPreOrders: number;
  estimatedPreOrderValue: number;
} {
  return {
    totalProducts: products.length,
    lowStockProducts: getLowStockProducts(products).length,
    totalRevenue: 0,
    totalPreOrders: preOrders.length,
    estimatedPreOrderValue: preOrders.reduce((total, preOrder) => {
      return total + toNumber(preOrder.total_amount);
    }, 0),
  };
}
