"use client";

import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { fetchRecentPreOrders, type RecentPreOrder } from "@/api/pre-orders";
import { fetchProducts, type Product } from "@/api/products";
import {
  buildSupplierMessage,
  computeDashboardMetrics,
  getLowStockProducts,
  getSuggestedReorderQuantity,
  resolveSupplierEmail,
} from "@/lib/inventory";
import { createSecuraSupabaseClient } from "@/supabase/client";
import { envConfig, hasSupabaseConfig } from "@/supabase/config";
import { PageHeader } from "@/components/shared/PageHeader";
import { LowStockPanel } from "./LowStockPanel";
import { MetricsGrid } from "./MetricsGrid";
import { ProductsTable } from "./ProductsTable";
import { RecentPreOrders } from "./RecentPreOrders";
import { SupplierModal } from "./SupplierModal";

export function DashboardHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [preOrders, setPreOrders] = useState<RecentPreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [supplierEmail, setSupplierEmail] = useState("");
  const [toast, setToast] = useState("");

  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);
  const metrics = useMemo(
    () => computeDashboardMetrics({ products, preOrders }),
    [preOrders, products],
  );

  async function loadDashboardData() {
    setError("");

    if (!hasSupabaseConfig()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSecuraSupabaseClient();

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
    setSupplierEmail(resolveSupplierEmail(product, envConfig.defaultSupplierEmail));
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

  if (!hasSupabaseConfig()) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Supabase environment setup is required." />
        <section className="card settings-card">
          <h2>Supabase env vars required</h2>
          <p className="muted">
            Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>, then restart
            the Next.js dev server to load products, pre-orders, and low-stock alerts.
          </p>
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
          <button className="button button-primary" onClick={() => void loadDashboardData()} type="button">
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
          <button className="button button-ghost" onClick={() => void loadDashboardData()} type="button">
            <FiRefreshCw size={18} /> Refresh
          </button>
        }
      />
      <MetricsGrid metrics={metrics} />
      <section className="grid content-grid">
        <div className="grid">
          <LowStockPanel products={lowStockProducts} onSupplierMessage={openSupplierModal} />
          <ProductsTable products={products} />
        </div>
        <RecentPreOrders preOrders={preOrders} />
      </section>

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
    </>
  );
}
