"use client";

import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { InputField } from "@/components/shared/InputField";
import type { ProductCreateInput } from "@/types/products";

const initialForm: ProductCreateInput = {
  amount: 0,
  low_stock_threshold: 0,
  name: "",
  product_image: "",
  stock_quantity: 0,
  supplier_email: "",
};

export function AddProductModal({
  isSaving,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: ProductCreateInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductCreateInput>(initialForm);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  function updateField<TField extends keyof ProductCreateInput>(
    field: TField,
    value: ProductCreateInput[TField],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="add-product-title"
        aria-modal="true"
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">New product</p>
            <h2 id="add-product-title">Add product</h2>
            <p className="muted small">Create a smart-lock catalog item for inventory tracking.</p>
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
              <FiPlus size={18} /> {isSaving ? "Adding..." : "Add product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
