"use client";

import { useState } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { SupplierModal } from "@/components/dashboard/SupplierModal";
import { DashboardErrorState } from "@/components/dashboard/DashboardErrorState";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";
import { DashboardSetupState } from "@/components/dashboard/DashboardSetupState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useProducts } from "@/hooks/useProducts";
import {
  buildSupplierMessage,
  getSuggestedReorderQuantity,
  resolveSupplierEmail,
} from "@/lib/inventory";
import { envConfig } from "@/supabase/config";
import type { ProductCreateInput, Product, ProductUpdateInput } from "@/types/products";
import { AddProductModal } from "./AddProductModal";
import { EditProductModal } from "./EditProductModal";

export function ProductPage() {
  const {
    addProduct,
    deleteProduct,
    error,
    hasSupabaseCredentials,
    isLoading,
    products,
    reloadProducts,
    updateProduct,
  } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [supplierEmail, setSupplierEmail] = useState("");
  const [toast, setToast] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
      showToast("Product deleted");
    } catch (deleteError) {
      showToast(deleteError instanceof Error ? deleteError.message : "Unable to delete product");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleEditProduct(input: ProductUpdateInput) {
    if (!productToEdit) return;
    setIsSaving(true);
    try {
      await updateProduct(productToEdit.id, input);
      setProductToEdit(null);
      showToast("Product updated");
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : "Unable to update product");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuickAdjustStock(product: Product, newStock: number) {
    try {
      await updateProduct(product.id, { stock_quantity: newStock });
      showToast(`${product.name} stock updated to ${newStock}`);
    } catch (adjustError) {
      showToast(adjustError instanceof Error ? adjustError.message : "Unable to adjust stock");
    }
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

  async function handleAddProduct(input: ProductCreateInput) {
    setIsSaving(true);

    try {
      await addProduct(input);
      setIsAddModalOpen(false);
      showToast("Product added");
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : "Unable to add product");
    } finally {
      setIsSaving(false);
    }
  }

  if (!hasSupabaseCredentials) {
    return <DashboardSetupState />;
  }

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return <DashboardErrorState error={error} onRetry={reloadProducts} />;
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage smart-lock catalog, stock thresholds, and supplier contact actions."
        action={
          <div className="header-actions">
            <button className="button button-ghost" onClick={() => void reloadProducts()} type="button">
              <FiRefreshCw size={18} /> Refresh
            </button>
            <button className="button button-primary" onClick={() => setIsAddModalOpen(true)} type="button">
              <FiPlus size={18} /> Add product
            </button>
          </div>
        }
      />
      <ProductsTable
        products={products}
        onSupplierMessage={openSupplierModal}
        onEditProduct={setProductToEdit}
        onDeleteProduct={setProductToDelete}
        onQuickAdjustStock={handleQuickAdjustStock}
      />

      {isAddModalOpen && (
        <AddProductModal
          isSaving={isSaving}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddProduct}
        />
      )}

      {productToEdit && (
        <EditProductModal
          product={productToEdit}
          isSaving={isSaving}
          onClose={() => setProductToEdit(null)}
          onSubmit={handleEditProduct}
        />
      )}

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

      {productToDelete && (
        <div className="modal-backdrop" onMouseDown={() => setProductToDelete(null)}>
          <section
            aria-labelledby="delete-product-title"
            aria-modal="true"
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            style={{ maxWidth: "480px" }}
          >
            <div className="panel-header">
              <div>
                <p className="eyebrow text-danger">Delete product</p>
                <h2 id="delete-product-title">Are you sure?</h2>
                <p className="muted small" style={{ marginTop: "8px" }}>
                  This will permanently delete <strong>{productToDelete.name}</strong> from the catalog. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: "24px" }}>
              <button
                className="button button-ghost"
                onClick={() => setProductToDelete(null)}
                type="button"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
