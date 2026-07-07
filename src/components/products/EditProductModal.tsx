"use client";

import { useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { InputField } from "@/components/shared/InputField";
import type { Product, ProductUpdateInput } from "@/types/products";
import { toNumber } from "@/lib/inventory";

export function EditProductModal({
  product,
  isSaving,
  onClose,
  onSubmit,
}: {
  product: Product;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: ProductUpdateInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductUpdateInput>({
    amount: toNumber(product.amount),
    low_stock_threshold: toNumber(product.low_stock_threshold),
    name: product.name || "",
    product_image: product.product_image || "",
    stock_quantity: toNumber(product.stock_quantity),
    supplier_email: product.supplier_email || "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  function updateField<TField extends keyof ProductUpdateInput>(
    field: TField,
    value: ProductUpdateInput[TField],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="edit-product-title"
        aria-modal="true"
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Edit product</p>
            <h2 id="edit-product-title">Edit product details</h2>
            <p className="muted small">Modify smart-lock product details and thresholds.</p>
          </div>
          <button className="button button-ghost button-icon" onClick={onClose} title="Close" type="button">
            <FiX size={18} />
          </button>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField
            id="productName"
            label="Product name"
            onChange={(event) => updateField("name", event.target.value)}
            required
            value={form.name}
          />
          <div className="form-row">
            <InputField
              id="productAmount"
              label="Amount"
              min="0"
              onChange={(event) => updateField("amount", Number(event.target.value))}
              required
              type="number"
              value={form.amount}
            />
            <InputField
              id="productStock"
              label="Stock quantity"
              min="0"
              onChange={(event) => updateField("stock_quantity", Number(event.target.value))}
              required
              type="number"
              value={form.stock_quantity}
            />
          </div>
          <div className="form-row">
            <InputField
              id="productThreshold"
              label="Low-stock threshold"
              min="0"
              onChange={(event) => updateField("low_stock_threshold", Number(event.target.value))}
              required
              type="number"
              value={form.low_stock_threshold}
            />
            <InputField
              id="supplierEmail"
              label="Supplier email"
              onChange={(event) => updateField("supplier_email", event.target.value)}
              type="email"
              value={form.supplier_email}
            />
          </div>
          <InputField
            id="productImage"
            label="Product image URL"
            onChange={(event) => updateField("product_image", event.target.value)}
            placeholder="https://example.com/smart-lock.jpg"
            value={form.product_image}
          />
          <div className="modal-actions">
            <button className="button button-ghost" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button button-primary" disabled={isSaving} type="submit">
              <FiSave size={18} /> {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
