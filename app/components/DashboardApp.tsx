"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType, FormEvent } from "react";
import {
  FiBox,
  FiCopy,
  FiFileText,
  FiGrid,
  FiMail,
  FiRefreshCw,
  FiSettings,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { getBrowserConfig, hasSupabaseConfig, saveBrowserConfig, type AppConfig } from "../lib/config";
import {
  buildMailtoHref,
  buildSupplierMessage,
  computeDashboardMetrics,
  getLowStockProducts,
  getProductStockStatus,
  getSuggestedReorderQuantity,
  resolveSupplierEmail,
  toNumber,
} from "../lib/inventory";
import {
  createSecuraSupabaseClient,
  fetchProducts,
  fetchRecentPreOrders,
  type Product,
  type RecentPreOrder,
} from "../lib/supabase";

type PageId = "dashboard" | "products" | "pre-orders" | "customers" | "settings";

const navItems: Array<{
  id: PageId;
  label: string;
  icon: ComponentType<{ size?: number }>;
}> = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "products", label: "Products", icon: FiBox },
  { id: "pre-orders", label: "Pre-orders", icon: FiFileText },
  { id: "customers", label: "Customers", icon: FiUsers },
  { id: "settings", label: "Settings", icon: FiSettings },
];

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ProductImage({ product }: { product: Product }) {
  if (product.product_image) {
    return <img className="product-thumb" src={product.product_image} alt={product.name} />;
  }

  return (
    <div className="product-thumb product-fallback" aria-hidden="true">
      {(product.name || "S").slice(0, 1)}
    </div>
  );
}

export default function DashboardApp() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [preOrders, setPreOrders] = useState<RecentPreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<AppConfig>({
    supabaseUrl: "",
    supabaseAnonKey: "",
    defaultSupplierEmail: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [supplierEmail, setSupplierEmail] = useState("");
  const [toast, setToast] = useState("");

  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);
  const metrics = useMemo(
    () => computeDashboardMetrics({ products, preOrders }),
    [preOrders, products],
  );

  async function loadDashboardData(nextConfig = getBrowserConfig()) {
    setConfig(nextConfig);
    setError("");

    if (!hasSupabaseConfig(nextConfig)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSecuraSupabaseClient(nextConfig);

      if (!supabase) {
        setProducts([]);
        setPreOrders([]);
        setIsLoading(false);
        return;
      }

      const [nextProducts, nextPreOrders] = await Promise.all([
        fetchProducts(supabase),
        fetchRecentPreOrders(supabase),
      ]);

      setProducts(nextProducts);
      setPreOrders(nextPreOrders);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown Supabase error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboardData();
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openSupplierModal(product: Product) {
    setSelectedProduct(product);
    setRequestedQuantity(getSuggestedReorderQuantity(product));
    setSupplierEmail(resolveSupplierEmail(product, config.defaultSupplierEmail));
  }

  async function copySupplierMessage() {
    if (!selectedProduct) {
      return;
    }

    const message = buildSupplierMessage({
      productName: selectedProduct.name,
      requestedQuantity,
      stockQuantity: selectedProduct.stock_quantity,
      lowStockThreshold: selectedProduct.low_stock_threshold,
    });

    try {
      await navigator.clipboard.writeText(message);
      showToast("Supplier message copied");
    } catch {
      showToast("Copy failed. Select the message text manually.");
    }
  }

  function saveSettings(formData: FormData) {
    const nextConfig = {
      supabaseUrl: String(formData.get("supabaseUrl") || "").trim(),
      supabaseAnonKey: String(formData.get("supabaseAnonKey") || "").trim(),
      defaultSupplierEmail: String(formData.get("defaultSupplierEmail") || "").trim(),
    };

    saveBrowserConfig(nextConfig);
    setConfig(nextConfig);
    setActivePage("dashboard");
    showToast("Settings saved");
    void loadDashboardData(nextConfig);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <span className="brand-title">Secura</span>
            <span className="brand-subtitle">Inventory Admin</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`nav-button ${activePage === item.id ? "is-active" : ""}`}
                key={item.id}
                onClick={() => setActivePage(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          Smart lock stock visibility for Secura Digital Systems.
        </div>
      </aside>

      <main className="main">
        {activePage === "dashboard" && (
          <DashboardPage
            config={config}
            error={error}
            isLoading={isLoading}
            lowStockProducts={lowStockProducts}
            metrics={metrics}
            onOpenSettings={() => setActivePage("settings")}
            onRefresh={() => void loadDashboardData()}
            onSupplierMessage={openSupplierModal}
            preOrders={preOrders}
            products={products}
          />
        )}
        {activePage === "settings" && (
          <SettingsPage config={config} onSave={saveSettings} />
        )}
        {activePage !== "dashboard" && activePage !== "settings" && (
          <PlaceholderPage label={navItems.find((item) => item.id === activePage)?.label || "Section"} />
        )}
      </main>

      {selectedProduct && (
        <SupplierModal
          product={selectedProduct}
          requestedQuantity={requestedQuantity}
          supplierEmail={supplierEmail}
          onClose={() => setSelectedProduct(null)}
          onCopy={() => void copySupplierMessage()}
          onQuantityChange={setRequestedQuantity}
          onSupplierEmailChange={setSupplierEmail}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Secura Digital Systems</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

function DashboardPage({
  config,
  error,
  isLoading,
  lowStockProducts,
  metrics,
  onOpenSettings,
  onRefresh,
  onSupplierMessage,
  preOrders,
  products,
}: {
  config: AppConfig;
  error: string;
  isLoading: boolean;
  lowStockProducts: Product[];
  metrics: ReturnType<typeof computeDashboardMetrics>;
  onOpenSettings: () => void;
  onRefresh: () => void;
  onSupplierMessage: (product: Product) => void;
  preOrders: RecentPreOrder[];
  products: Product[];
}) {
  if (!hasSupabaseConfig(config)) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Connect Supabase to begin monitoring inventory." />
        <section className="card settings-card">
          <h2>Supabase connection required</h2>
          <p className="muted">
            Add your Supabase project URL and anon key in Settings. The dashboard will then
            load products, pre-orders, and low-stock alerts.
          </p>
          <button className="button button-primary" onClick={onOpenSettings} type="button">
            Open Settings
          </button>
        </section>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Loading Secura inventory data." />
        <section className="grid metrics-grid">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </section>
        <section className="grid content-grid">
          <div className="skeleton" />
          <div className="skeleton" />
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Inventory data could not be loaded." />
        <section className="error-state">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <button className="button button-primary" onClick={onRefresh} type="button">
            <FiRefreshCw size={18} /> Retry
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Monitor smart-lock stock levels and act on low inventory."
        action={
          <button className="button button-ghost" onClick={onRefresh} type="button">
            <FiRefreshCw size={18} /> Refresh
          </button>
        }
      />
      <MetricsGrid metrics={metrics} />
      <section className="grid content-grid">
        <div className="grid">
          <LowStockPanel products={lowStockProducts} onSupplierMessage={onSupplierMessage} />
          <ProductsTable products={products} />
        </div>
        <RecentPreOrders preOrders={preOrders} />
      </section>
    </>
  );
}

function MetricsGrid({ metrics }: { metrics: ReturnType<typeof computeDashboardMetrics> }) {
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

function LowStockPanel({
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

function ProductsTable({ products }: { products: Product[] }) {
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

function RecentPreOrders({ preOrders }: { preOrders: RecentPreOrder[] }) {
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

function SettingsPage({
  config,
  onSave,
}: {
  config: AppConfig;
  onSave: (formData: FormData) => void;
}) {
  return (
    <>
      <PageHeader title="Settings" subtitle="Store browser-local connection settings for this admin dashboard." />
      <section className="card settings-card">
        <form
          className="form-grid"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSave(new FormData(event.currentTarget));
          }}
        >
          <div className="field">
            <label htmlFor="supabaseUrl">Supabase URL</label>
            <input
              id="supabaseUrl"
              name="supabaseUrl"
              placeholder="https://project-ref.supabase.co"
              type="url"
              defaultValue={config.supabaseUrl}
            />
          </div>
          <div className="field">
            <label htmlFor="supabaseAnonKey">Supabase anon key</label>
            <input
              id="supabaseAnonKey"
              name="supabaseAnonKey"
              placeholder="eyJ..."
              defaultValue={config.supabaseAnonKey}
            />
          </div>
          <div className="field">
            <label htmlFor="defaultSupplierEmail">Default supplier email</label>
            <input
              id="defaultSupplierEmail"
              name="defaultSupplierEmail"
              placeholder="orders@supplier.example"
              type="email"
              defaultValue={config.defaultSupplierEmail}
            />
          </div>
          <div>
            <button className="button button-primary" type="submit">
              Save settings
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function PlaceholderPage({ label }: { label: string }) {
  return (
    <>
      <PageHeader title={label} subtitle={`${label} management is planned for a later iteration.`} />
      <section className="card">
        <div className="empty-state">
          <h2>{label} coming later</h2>
          <p>This first version keeps the work focused on stock alerts and supplier restock email drafts.</p>
        </div>
      </section>
    </>
  );
}

function SupplierModal({
  product,
  requestedQuantity,
  supplierEmail,
  onClose,
  onCopy,
  onQuantityChange,
  onSupplierEmailChange,
}: {
  product: Product;
  requestedQuantity: number;
  supplierEmail: string;
  onClose: () => void;
  onCopy: () => void;
  onQuantityChange: (quantity: number) => void;
  onSupplierEmailChange: (email: string) => void;
}) {
  const stockQuantity = toNumber(product.stock_quantity);
  const lowStockThreshold = toNumber(product.low_stock_threshold);
  const message = buildSupplierMessage({
    productName: product.name,
    requestedQuantity,
    stockQuantity,
    lowStockThreshold,
  });
  const mailtoHref = supplierEmail
    ? buildMailtoHref({
        recipient: supplierEmail,
        subject: `Restock request: ${product.name}`,
        body: message,
      })
    : "";

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="supplier-title"
        aria-modal="true"
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Supplier message</p>
            <h2 id="supplier-title">{product.name}</h2>
            <p className="muted small">
              Stock {stockQuantity} / threshold {lowStockThreshold}
            </p>
          </div>
          <button className="button button-ghost button-icon" onClick={onClose} title="Close" type="button">
            <FiX size={18} />
          </button>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="requestedQuantity">Requested quantity</label>
            <input
              id="requestedQuantity"
              min="1"
              onChange={(event) => onQuantityChange(Math.max(toNumber(event.target.value, 1), 1))}
              type="number"
              value={requestedQuantity}
            />
          </div>
          <div className="field">
            <label htmlFor="supplierEmail">Supplier email</label>
            <input
              id="supplierEmail"
              onChange={(event) => onSupplierEmailChange(event.target.value.trim())}
              placeholder="orders@supplier.example"
              type="email"
              value={supplierEmail}
            />
            {!supplierEmail && <p className="muted small">Add a supplier email to enable Send Email.</p>}
          </div>
          <div className="field">
            <label htmlFor="messagePreview">Generated message</label>
            <textarea id="messagePreview" readOnly value={message} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="button button-ghost" onClick={onCopy} type="button">
            <FiCopy size={18} /> Copy
          </button>
          <a className={`button button-primary ${supplierEmail ? "" : "button-disabled"}`} href={mailtoHref}>
            <FiMail size={18} /> Send Email
          </a>
        </div>
      </section>
    </div>
  );
}
