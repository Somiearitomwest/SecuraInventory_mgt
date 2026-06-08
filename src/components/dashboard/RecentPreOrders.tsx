import { toNumber } from "@/lib/inventory";
import type { RecentPreOrder } from "@/lib/supabase";
import { formatCurrency, formatDate } from "./formatters";

export function RecentPreOrders({ preOrders }: { preOrders: RecentPreOrder[] }) {
  return (
    <section className="card">
      <div className="panel-header">
        <div>
          <h2>Recent pre-orders</h2>
          <p className="muted small">Current demand context for inventory planning.</p>
        </div>
      </div>
      {preOrders.length ? (
        <div className="preorder-list">
          {preOrders.map((preOrder) => {
            const productName = preOrder.products?.name || "Unknown product";
            const customerName =
              preOrder.customers?.name || preOrder.customers?.email || "Unknown customer";

            return (
              <article className="preorder-item" key={preOrder.id}>
                <div className="product-thumb product-fallback" aria-hidden="true">
                  {productName.slice(0, 1)}
                </div>
                <div>
                  <h3>{productName}</h3>
                  <div className="stock-line">
                    {customerName} · Qty {toNumber(preOrder.quantity)} · {formatDate(preOrder.created_at)}
                  </div>
                </div>
                <strong>{formatCurrency(preOrder.total_amount)}</strong>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">No pre-orders found yet.</div>
      )}
    </section>
  );
}
