"use client";

import { useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiMail,
  FiMoreVertical,
  FiSearch,
} from "react-icons/fi";
import {
  getProductStockStatus,
  toNumber,
} from "@/lib/inventory";
import type { Product } from "@/api/products";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency } from "./formatters";

export function ProductsTable({
  products,
  onSupplierMessage,
}: {
  products: Product[];
  onSupplierMessage: (product: Product) => void;
}) {
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const status = getProductStockStatus(product);

      return [product.name, String(product.amount || ""), status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [products, searchTerm]);

  if (!products.length) {
    return (
      <section className="inventory-card">
        <div className="inventory-toolbar">
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
    <section className="inventory-card">
      <div className="inventory-toolbar">
        <div>
          <h2>Product inventory</h2>
          <p className="muted small">Stock count and threshold by smart-lock product.</p>
        </div>
        <div className="inventory-controls">
          <label className="inventory-search" htmlFor="productSearch">
            <FiSearch size={22} />
            <input
              id="productSearch"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search"
              type="search"
              value={searchTerm}
            />
          </label>
          <button className="inventory-sort" type="button">
            <FiFilter size={20} /> Sort by
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>
                <span className="fake-checkbox" />
              </th>
              <th>
                <span className="sortable-heading">
                  Product <FiChevronUp size={14} />
                  <FiChevronDown size={14} />
                </span>
              </th>
              <th>
                <span className="sortable-heading">
                  Amount <FiChevronUp size={14} />
                  <FiChevronDown size={14} />
                </span>
              </th>
              <th>
                <span className="sortable-heading">
                  Stock <FiChevronUp size={14} />
                  <FiChevronDown size={14} />
                </span>
              </th>
              <th>
                <span className="sortable-heading">
                  Threshold <FiChevronUp size={14} />
                  <FiChevronDown size={14} />
                </span>
              </th>
              <th>
                <span className="sortable-heading">
                  Status <FiChevronUp size={14} />
                  <FiChevronDown size={14} />
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => {
              const status = getProductStockStatus(product);

              return (
                <tr key={product.id}>
                  <td>
                    <span className="fake-checkbox" />
                  </td>
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
                  <td className="actions-cell">
                    <div className="row-actions">
                      <button
                        aria-expanded={openMenuProductId === product.id}
                        aria-label={`Open actions for ${product.name}`}
                        className="button button-ghost button-icon"
                        onClick={() =>
                          setOpenMenuProductId((currentId) =>
                            currentId === product.id ? null : product.id,
                          )
                        }
                        title="Product actions"
                        type="button"
                      >
                        <FiMoreVertical size={18} />
                      </button>
                      {openMenuProductId === product.id && (
                        <div className="action-popover" role="menu">
                          <button
                            onClick={() => {
                              setOpenMenuProductId(null);
                              onSupplierMessage(product);
                            }}
                            role="menuitem"
                            type="button"
                          >
                            <FiMail size={16} /> Contact supplier
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visibleProducts.length && (
          <div className="empty-state table-empty-state">No products match your search.</div>
        )}
      </div>
    </section>
  );
}
