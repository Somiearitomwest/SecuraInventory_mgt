import { formatCurrency } from "./formatters";

type DashboardMetrics = {
  totalProducts: number;
  lowStockProducts: number;
  totalPreOrders: number;
  estimatedPreOrderValue: number;
};

export function MetricsGrid({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  const cards = [
    ["Total products", metrics.totalProducts, "Catalog items in Supabase"],
    ["Low-stock products", metrics.lowStockProducts, "At or below threshold"],
    ["Total pre-orders", metrics.totalPreOrders, "Customer demand records"],
    ["Pre-order value", formatCurrency(metrics.estimatedPreOrderValue), "Estimated order value"],
  ];

  return (
    <section className="grid metrics-grid">
      {cards.map(([label, value, note]) => (
        <article className="card metric-card" key={label}>
          <div className="metric-label">{label}</div>
          <div className="metric-value">{value}</div>
          <div className="metric-note">{note}</div>
        </article>
      ))}
    </section>
  );
}
