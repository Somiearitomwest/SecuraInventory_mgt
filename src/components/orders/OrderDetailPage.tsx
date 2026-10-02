"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiRefreshCw, FiSave } from "react-icons/fi";
import { fetchOrder, updateOrderFulfillment } from "@/api/orders";
import { formatCurrency, formatDate } from "@/components/dashboard/formatters";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  fulfillmentStatuses,
  fulfillmentStatusLabels,
  type AdminOrderDetail,
  type FulfillmentStatus,
} from "@/types/orders";

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>("pending");
  const [trackingProvider, setTrackingProvider] = useState("");
  const [trackingReference, setTrackingReference] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadOrder() {
    setIsLoading(true);
    setError("");
    try {
      const nextOrder = await fetchOrder(orderId);
      setOrder(nextOrder);
      setFulfillmentStatus(nextOrder.fulfillmentStatus);
      setTrackingProvider(nextOrder.trackingProvider || "");
      setTrackingReference(nextOrder.trackingReference || "");
      setTrackingUrl(nextOrder.trackingUrl || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load order");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const isDispatched = fulfillmentStatus === "dispatched";
  const statusChanged = order?.fulfillmentStatus !== fulfillmentStatus;
  const trackingChanged = useMemo(() => {
    if (!order) return false;
    return (
      (order.trackingProvider || "") !== trackingProvider ||
      (order.trackingReference || "") !== trackingReference ||
      (order.trackingUrl || "") !== trackingUrl
    );
  }, [order, trackingProvider, trackingReference, trackingUrl]);

  async function saveFulfillment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    if (fulfillmentStatus === "delivered" && statusChanged && !window.confirm("Mark this order as delivered?")) {
      return;
    }

    setIsSaving(true);
    setNotice("");
    setError("");
    try {
      const result = await updateOrderFulfillment(order.id, {
        fulfillmentStatus,
        trackingProvider: isDispatched ? trackingProvider.trim() || null : null,
        trackingReference: isDispatched ? trackingReference.trim() || null : null,
        trackingUrl: isDispatched ? trackingUrl.trim() || null : null,
      });
      await loadOrder();
      setNotice(result.updated ? "Fulfillment updated" : "No changes to save");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update fulfillment");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={order ? `Order ${order.id.slice(0, 8)}` : "Order detail"}
        subtitle="Review customer, delivery, payment, and fulfillment state."
        action={
          <div className="header-actions">
            <Link className="button button-ghost" href="/orders">
              <FiArrowLeft size={18} /> Back
            </Link>
            <button className="button button-ghost" onClick={() => void loadOrder()} type="button">
              <FiRefreshCw size={18} /> Refresh
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="skeleton" />
      ) : error && !order ? (
        <div className="error-state">{error}</div>
      ) : order ? (
        <div className="order-detail-grid">
          <section className="card">
            <div className="panel-header">
              <div>
                <h2>Customer</h2>
                <p className="muted small">Snapshot captured when the order was placed.</p>
              </div>
            </div>
            <dl className="details-list">
              <div><dt>Name</dt><dd>{order.customerName || "Unknown"}</dd></div>
              <div><dt>Email</dt><dd>{order.customerEmail || "No email"}</dd></div>
              <div><dt>Phone</dt><dd>{order.customerPhone || "No phone"}</dd></div>
              <div><dt>Created</dt><dd>{formatDate(order.createdAt)}</dd></div>
            </dl>
          </section>

          <section className="card">
            <div className="panel-header">
              <div>
                <h2>Delivery</h2>
                <p className="muted small">Read-only payment and delivery pricing.</p>
              </div>
            </div>
            <dl className="details-list">
              <div><dt>Address</dt><dd>{order.deliveryAddress}</dd></div>
              <div><dt>Zone</dt><dd>{order.deliveryZoneLabel || "Not set"}</dd></div>
              <div><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
              <div><dt>Delivery fee</dt><dd>{formatCurrency(order.deliveryFee)}</dd></div>
              <div><dt>Installation fee</dt><dd>{formatCurrency(order.installationFee)}</dd></div>
              <div><dt>Total</dt><dd>{formatCurrency(order.totalAmount)}</dd></div>
            </dl>
          </section>

          <section className="card order-main-card">
            <div className="panel-header">
              <div>
                <h2>Line items</h2>
                <p className="muted small">Products included in this order.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <div className="panel-header">
              <div>
                <h2>Payment</h2>
                <p className="muted small">Payment data is read-only here.</p>
              </div>
            </div>
            <dl className="details-list">
              <div><dt>Status</dt><dd>{order.status}</dd></div>
              <div><dt>Reference</dt><dd>{order.paymentReference || "No reference"}</dd></div>
              <div><dt>Installation</dt><dd>{order.installationRequested ? "Requested" : "Not requested"}</dd></div>
            </dl>
          </section>

          <section className="card order-main-card">
            <div className="panel-header">
              <div>
                <h2>Fulfillment</h2>
                <p className="muted small">
                  Last updated {order.fulfillmentUpdatedAt ? formatDate(order.fulfillmentUpdatedAt) : "not yet"}.
                </p>
              </div>
            </div>

            <form className="form-grid" onSubmit={saveFulfillment}>
              <div className="field">
                <label htmlFor="fulfillmentStatus">Fulfillment status</label>
                <select
                  id="fulfillmentStatus"
                  onChange={(event) => setFulfillmentStatus(event.target.value as FulfillmentStatus)}
                  value={fulfillmentStatus}
                >
                  {fulfillmentStatuses.map((item) => (
                    <option key={item} value={item}>
                      {fulfillmentStatusLabels[item]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="trackingProvider">Courier name</label>
                  <input
                    disabled={!isDispatched}
                    id="trackingProvider"
                    onChange={(event) => setTrackingProvider(event.target.value)}
                    value={isDispatched ? trackingProvider : ""}
                  />
                </div>
                <div className="field">
                  <label htmlFor="trackingReference">Tracking reference</label>
                  <input
                    disabled={!isDispatched}
                    id="trackingReference"
                    onChange={(event) => setTrackingReference(event.target.value)}
                    value={isDispatched ? trackingReference : ""}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="trackingUrl">Tracking URL</label>
                <input
                  disabled={!isDispatched}
                  id="trackingUrl"
                  onChange={(event) => setTrackingUrl(event.target.value)}
                  type="url"
                  value={isDispatched ? trackingUrl : ""}
                />
              </div>

              {error && <div className="error-state">{error}</div>}
              {notice && <div className="success-state">{notice}</div>}

              <div className="modal-actions">
                <button
                  className="button button-primary"
                  disabled={isSaving || (!statusChanged && !trackingChanged)}
                  type="submit"
                >
                  <FiSave size={18} /> {isSaving ? "Saving..." : "Save fulfillment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
