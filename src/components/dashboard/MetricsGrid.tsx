import type { IconType } from "react-icons";
import {
  FiBox,
  FiDollarSign,
  FiFileText,
  FiMoreVertical,
  FiTrendingUp,
} from "react-icons/fi";
import { formatCurrency } from "./formatters";

type DashboardMetrics = {
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  totalPreOrders: number;
  estimatedPreOrderValue: number;
};

export function MetricsGrid({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  const cards: Array<{
    icon: IconType;
    label: string;
    note: string;
    trend: string;
    value: number | string;
  }> = [
    {
      icon: FiBox,
      label: "Total products",
      note: "Catalog items in Supabase",
      trend: "Live",
      value: metrics.totalProducts,
    },
    {
      icon: FiDollarSign,
      label: "Total revenue",
      note: "Reliable source pending",
      trend: "Pending",
      value: formatCurrency(metrics.totalRevenue),
    },
    {
      icon: FiFileText,
      label: "Total pre-orders",
      note: "Customer demand records",
      trend: "Live",
      value: metrics.totalPreOrders,
    },
    {
      icon: FiTrendingUp,
      label: "Pre-order value",
      note: "Estimated order value",
      trend: "Estimate",
      value: formatCurrency(metrics.estimatedPreOrderValue),
    },
  ];

  return (
    <section className="grid metrics-grid">
      {cards.map(({ icon: Icon, label, note, trend, value }) => (
        <article className="metric-card" key={label}>
          <div className="metric-card-top">
            <span className="metric-icon">
              <Icon size={22} />
            </span>
            <button aria-label={`${label} options`} className="metric-menu" type="button">
              <FiMoreVertical size={20} />
            </button>
          </div>
          <div>
            <div className="metric-label">{label}</div>
            <div className="metric-card-bottom">
              <div className="metric-value">{value}</div>
              <span className={`metric-trend ${trend === "Pending" ? "metric-trend-neutral" : ""}`}>
                {trend}
              </span>
            </div>
            <div className="metric-note">{note}</div>
          </div>
        </article>
      ))}
    </section>
  );
}
