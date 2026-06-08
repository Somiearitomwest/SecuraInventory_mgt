import { FiMail } from "react-icons/fi";
import {
  getSuggestedReorderQuantity,
  toNumber,
} from "@/lib/inventory";
import type { Product } from "@/lib/supabase";
import { ProductImage } from "@/components/shared/ProductImage";

export function LowStockPanel({
  products,
  onSupplierMessage,
}: {
  products: Product[];
  onSupplierMessage: (product: Product) => void;
}) {
  return (
    <section className="card">
      <div className="panel-header">
        <div>
          <h2>Low-stock alerts</h2>
          <p className="muted small">Supplier message actions are tied to each product below.</p>
        </div>
        <span className={`status-pill ${products.length ? "status-low" : "status-healthy"}`}>
          {products.length ? `${products.length} needs action` : "Healthy"}
        </span>
      </div>
      {products.length ? (
        <div className="low-stock-list">
          {products.map((product) => (
            <article className="low-stock-item" key={product.id}>
              <ProductImage product={product} />
              <div>
                <h3>{product.name}</h3>
                <div className="stock-line">
                  Stock {toNumber(product.stock_quantity)} / threshold{" "}
                  {toNumber(product.low_stock_threshold)} · reorder{" "}
                  {getSuggestedReorderQuantity(product)}
                </div>
              </div>
              <button
                className="button button-secondary button-icon"
                onClick={() => onSupplierMessage(product)}
                title="Generate supplier email"
                type="button"
              >
                <FiMail size={18} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">No products are at or below their low-stock threshold.</div>
      )}
    </section>
  );
}
