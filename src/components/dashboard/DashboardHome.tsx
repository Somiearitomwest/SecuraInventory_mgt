"use client";

import { useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import type { Product } from "@/api/products";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  buildSupplierMessage,
  computeDashboardMetrics,
  getSuggestedReorderQuantity,
  resolveSupplierEmail,
} from "@/lib/inventory";
import { envConfig } from "@/supabase/config";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardErrorState } from "./DashboardErrorState";
import { DashboardLoadingState } from "./DashboardLoadingState";
import { DashboardSetupState } from "./DashboardSetupState";
import { MetricsGrid } from "./MetricsGrid";
import { ProductsTable } from "./ProductsTable";
import { RecentPreOrders } from "./RecentPreOrders";
import { SupplierModal } from "./SupplierModal";

export function DashboardHome() {
  const {
    error,
    hasSupabaseCredentials,
    isLoading,
    preOrders,
    products,
    reloadDashboardData,
  } = useDashboardData();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [supplierEmail, setSupplierEmail] = useState("");
  const [toast, setToast] = useState("");

  const metrics = useMemo(
    () => computeDashboardMetrics({ products, preOrders }),
    [preOrders, products],
  );

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

  if (!hasSupabaseCredentials) {
    return <DashboardSetupState />;
  }

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return <DashboardErrorState error={error} onRetry={reloadDashboardData} />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Monitor smart-lock stock levels and supplier restock actions."
        action={
          <button
            className="button button-ghost"
            onClick={() => void reloadDashboardData()}
            type="button"
          >
            <FiRefreshCw size={18} /> Refresh
          </button>
        }
      />
      <MetricsGrid metrics={metrics} />
      <section className="grid content-grid">
        <ProductsTable
          products={products}
          onSupplierMessage={openSupplierModal}
        />
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
