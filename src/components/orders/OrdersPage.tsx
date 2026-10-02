"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";
import { fetchOrders } from "@/api/orders";
import { formatCurrency, formatDate } from "@/components/dashboard/formatters";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  fulfillmentStatuses,
  fulfillmentStatusLabels,
  type AdminOrderListItem,
} from "@/types/orders";

export function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("confirmed");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setIsLoading(true);
    setError("");
    try {
      const result = await fetchOrders({
        fulfillmentStatus,
        q: appliedSearch,
        status,
      });
      setOrders(result.orders);
      setTotal(result.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, [status, fulfillmentStatus, appliedSearch]);

  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search.trim());
  }

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Review paid orders and update fulfillment without bypassing customer notifications."
        action={
          <button className="button button-ghost" onClick={() => void loadOrders()} type="button">
            <FiRefreshCw size={18} /> Refresh
          </button>
        }
      />

      <section className="inventory-card">
        <div className="inventory-toolbar">
          <div>
            <h2>Fulfillment queue</h2>
            <p className="muted small">{total} matching orders</p>
          </div>
          <div className="inventory-controls">
            <form className="inventory-search" onSubmit={applySearch}>
              <FiSearch size={22} />
              <input
                aria-label="Search orders"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, order ID"
                type="search"
                value={search}
              />
            </form>
            <label className="inventory-sort">
              <FiFilter size={20} />
              <span className="sr-only">Payment status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="confirmed">Paid</option>
                <option value="all">All payment statuses</option>
                <option value="payment_pending">Payment pending</option>
                <option value="quote_required">Quote required</option>
              </select>
            </label>
            <label className="inventory-sort">
              <span className="sr-only">Fulfillment status</span>
              <select
                value={fulfillmentStatus}
                onChange={(event) => setFulfillmentStatus(event.target.value)}
              >
                <option value="">All fulfillment</option>
                {fulfillmentStatuses.map((item) => (
                  <option key={item} value={item}>
                    {fulfillmentStatusLabels[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="table-empty-state">
            <div className="skeleton" />
          </div>
        ) : error ? (
          <div className="table-empty-state">
            <div className="error-state">{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="table-empty-state">
            <div className="empty-state">No orders match the current filters.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Created</th>
                  <th>Customer</th>
                  <th>Delivery</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id.slice(0, 8)}</strong>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="stacked-cell">
                        <strong>{order.customerName || "Unknown customer"}</strong>
                        <span>{order.customerEmail || "No email"}</span>
                        <span>{order.customerPhone || "No phone"}</span>
                      </div>
                    </td>
                    <td>{order.deliveryZoneLabel || "Not set"}</td>
                    <td>{order.status}</td>
                    <td>
                      <span className="status-pill status-neutral">
                        {fulfillmentStatusLabels[order.fulfillmentStatus]}
                      </span>
                    </td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <Link className="button button-ghost" href={`/orders/${order.id}`}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
