import type { Product } from "@/api/products";

export function ProductImage({ product }: { product: Product }) {
  if (product.product_image) {
    return <img className="product-thumb" src={product.product_image} alt={product.name} />;
  }

  return (
    <div className="product-thumb product-fallback" aria-hidden="true">
      {(product.name || "S").slice(0, 1)}
    </div>
  );
}
