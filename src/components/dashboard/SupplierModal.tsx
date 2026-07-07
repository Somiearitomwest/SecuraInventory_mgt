import { FiCopy, FiMail, FiX } from "react-icons/fi";
import {
  buildMailtoHref,
  buildSupplierMessage,
  toNumber,
} from "@/lib/inventory";
import type { Product } from "@/types/products";

export function SupplierModal({
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
