export const fulfillmentStatuses = [
  "pending",
  "payment_confirmed",
  "preparing",
  "dispatch_scheduled",
  "dispatched",
  "delivered",
] as const;

export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];

export const fulfillmentStatusLabels: Record<FulfillmentStatus, string> = {
  pending: "Pending",
  payment_confirmed: "Payment confirmed",
  preparing: "Preparing",
  dispatch_scheduled: "Dispatch scheduled",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export type AdminOrderListItem = {
  id: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  deliveryZoneLabel: string | null;
  status: string;
  fulfillmentStatus: FulfillmentStatus;
  totalAmount: number;
};

export type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrderDetail = AdminOrderListItem & {
  deliveryAddress: string;
  deliveryFee: number;
  installationFee: number;
  installationRequested: boolean;
  subtotal: number;
  paymentReference: string | null;
  fulfillmentUpdatedAt: string | null;
  trackingProvider: string | null;
  trackingReference: string | null;
  trackingUrl: string | null;
  items: AdminOrderItem[];
};

export type OrdersListResponse = {
  orders: AdminOrderListItem[];
  total: number;
};

export type OrderDetailResponse = {
  order: AdminOrderDetail;
};

export type UpdateFulfillmentInput = {
  fulfillmentStatus: FulfillmentStatus;
  trackingProvider?: string | null;
  trackingReference?: string | null;
  trackingUrl?: string | null;
};

export type UpdateFulfillmentResponse = {
  emailSent: boolean;
  fulfillmentStatus: FulfillmentStatus;
  orderId: string;
  updated: boolean;
};
