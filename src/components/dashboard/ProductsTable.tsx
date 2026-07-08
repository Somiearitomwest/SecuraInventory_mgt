"use client";

import { useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiFilter,
  FiMail,
  FiMoreVertical,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import {
  getProductStockStatus,
  toNumber,
} from "@/lib/inventory";
import type { Product } from "@/types/products";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency } from "./formatters";

export function ProductsTable({
  products,
  onSupplierMessage,
  onEditProduct,
  onDeleteProduct,
  onQuickAdjustStock,
}: {
  products: Product[];
  onSupplierMessage: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onQuickAdjustStock?: (product: Product, newStock: number) => Promise<void>;
}) {
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "amount" | "stock" | "threshold" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "healthy">("all");

  function handleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const visibleProducts = useMemo(() => {
    let result = products;

    if (statusFilter !== "all") {
      result = result.filter((product) => {
        const status = getProductStockStatus(product);
        return status === statusFilter;
      });
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) => {
        const status = getProductStockStatus(product);

        return [product.name, String(product.amount || ""), status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      });
    }

    const sorted = [...result].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (sortKey) {
        case "name":
          valA = (a.name || "").toLowerCase();
          valB = (b.name || "").toLowerCase();
          break;
        case "amount":
          valA = toNumber(a.amount);
          valB = toNumber(b.amount);
          break;
        case "stock":
          valA = toNumber(a.stock_quantity);
          valB = toNumber(b.stock_quantity);
          break;
        case "threshold":
          valA = toNumber(a.low_stock_threshold);
          valB = toNumber(b.low_stock_threshold);
          break;
        case "status":
          valA = getProductStockStatus(a);
          valB = getProductStockStatus(b);
          break;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [products, searchTerm, statusFilter, sortKey, sortDirection]);

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
          <div className="inventory-sort" style={{ padding: "0 10px 0 18px", position: "relative", gap: "8px" }}>
            <FiFilter size={20} />
            <select
              id="statusFilterSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text)",
                fontSize: "15px",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
                height: "100%",
                paddingRight: "8px",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              <option value="all">All stock</option>
              <option value="low">Low stock</option>
              <option value="healthy">Healthy</option>
            </select>
            <FiChevronDown size={14} style={{ pointerEvents: "none" }} />
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>
                <span className="fake-checkbox" />
              </th>
              <th onClick={() => handleSort("name")} style={{ cursor: "pointer", userSelect: "none" }}>
                <span className="sortable-heading">
                  Product
                  <FiChevronUp size={14} style={{ opacity: sortKey === "name" && sortDirection === "asc" ? 1 : 0.3 }} />
                  <FiChevronDown size={14} style={{ opacity: sortKey === "name" && sortDirection === "desc" ? 1 : 0.3 }} />
                </span>
              </th>
              <th onClick={() => handleSort("amount")} style={{ cursor: "pointer", userSelect: "none" }}>
                <span className="sortable-heading">
                  Amount
                  <FiChevronUp size={14} style={{ opacity: sortKey === "amount" && sortDirection === "asc" ? 1 : 0.3 }} />
                  <FiChevronDown size={14} style={{ opacity: sortKey === "amount" && sortDirection === "desc" ? 1 : 0.3 }} />
                </span>
              </th>
              <th onClick={() => handleSort("stock")} style={{ cursor: "pointer", userSelect: "none" }}>
                <span className="sortable-heading">
                  Stock
                  <FiChevronUp size={14} style={{ opacity: sortKey === "stock" && sortDirection === "asc" ? 1 : 0.3 }} />
                  <FiChevronDown size={14} style={{ opacity: sortKey === "stock" && sortDirection === "desc" ? 1 : 0.3 }} />
                </span>
              </th>
              <th onClick={() => handleSort("threshold")} style={{ cursor: "pointer", userSelect: "none" }}>
                <span className="sortable-heading">
                  Threshold
                  <FiChevronUp size={14} style={{ opacity: sortKey === "threshold" && sortDirection === "asc" ? 1 : 0.3 }} />
                  <FiChevronDown size={14} style={{ opacity: sortKey === "threshold" && sortDirection === "desc" ? 1 : 0.3 }} />
                </span>
              </th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer", userSelect: "none" }}>
                <span className="sortable-heading">
                  Status
                  <FiChevronUp size={14} style={{ opacity: sortKey === "status" && sortDirection === "asc" ? 1 : 0.3 }} />
                  <FiChevronDown size={14} style={{ opacity: sortKey === "status" && sortDirection === "desc" ? 1 : 0.3 }} />
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
                  <td>
                    {onQuickAdjustStock ? (
                      <div className="quick-stock-adjust" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          className="button button-ghost button-icon"
                          onClick={() => {
                            const current = toNumber(product.stock_quantity);
                            void onQuickAdjustStock(product, Math.max(0, current - 1));
                          }}
                          style={{ height: "24px", width: "24px", padding: 0, minHeight: "auto", fontSize: "14px" }}
                          title="Decrease stock"
                          type="button"
                        >
                          -
                        </button>
                        <span style={{ minWidth: "20px", textAlign: "center", fontWeight: "600" }}>
                          {toNumber(product.stock_quantity)}
                        </span>
                        <button
                          className="button button-ghost button-icon"
                          onClick={() => {
                            const current = toNumber(product.stock_quantity);
                            void onQuickAdjustStock(product, current + 1);
                          }}
                          style={{ height: "24px", width: "24px", padding: 0, minHeight: "auto", fontSize: "14px" }}
                          title="Increase stock"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      toNumber(product.stock_quantity)
                    )}
                  </td>
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
                          {onEditProduct && (
                            <button
                              onClick={() => {
                                setOpenMenuProductId(null);
                                onEditProduct(product);
                              }}
                              role="menuitem"
                              type="button"
                            >
                              <FiEdit2 size={16} /> Edit details
                            </button>
                          )}
                          {onDeleteProduct && (
                            <button
                              onClick={() => {
                                setOpenMenuProductId(null);
                                onDeleteProduct(product);
                              }}
                              role="menuitem"
                              type="button"
                              className="text-danger"
                            >
                              <FiTrash2 size={16} /> Delete product
                            </button>
                          )}
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
