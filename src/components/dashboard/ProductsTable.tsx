import {
  getProductStockStatus,
  toNumber,
} from "@/lib/inventory";
import type { Product } from "@/api/products";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency } from "./formatters";

export function ProductsTable({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <section className="card">
        <div className="panel-header">
          <div>
            <h2>Product inventory</h2>
            <p className="muted small">Catalog stock appears here once products exist.</p>
          </div>
        </div>
        <div className="empty-state">No products found in Supabase.</div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="panel-header">
        <div>
          <h2>Product inventory</h2>
          <p className="muted small">Stock count and threshold by smart-lock product.</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Amount</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const status = getProductStockStatus(product);

              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <ProductImage product={product} />
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>{formatCurrency(product.amount)}</td>
                  <td>{toNumber(product.stock_quantity)}</td>
                  <td>{toNumber(product.low_stock_threshold)}</td>
                  <td>
                    <span className={`status-pill ${status === "low" ? "status-low" : "status-healthy"}`}>
                      {status === "low" ? "Low stock" : "Healthy"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
