import type {
  AdminOrderDetail,
  OrdersListResponse,
  UpdateFulfillmentInput,
  UpdateFulfillmentResponse,
} from "@/types/orders";

export type FetchOrdersInput = {
  fulfillmentStatus?: string;
  q?: string;
  status?: string;
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Order request failed");
  }
  return payload as T;
}

export async function fetchOrders(input: FetchOrdersInput = {}): Promise<OrdersListResponse> {
  const params = new URLSearchParams();
  if (input.status) params.set("status", input.status);
  if (input.fulfillmentStatus) params.set("fulfillmentStatus", input.fulfillmentStatus);
  if (input.q) params.set("q", input.q);

  const query = params.toString();
  const response = await fetch(`/api/orders${query ? `?${query}` : ""}`);
  return readJsonResponse<OrdersListResponse>(response);
}

export async function fetchOrder(orderId: string): Promise<AdminOrderDetail> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
  const payload = await readJsonResponse<{ order: AdminOrderDetail }>(response);
  return payload.order;
}

export async function updateOrderFulfillment(
  orderId: string,
  input: UpdateFulfillmentInput,
): Promise<UpdateFulfillmentResponse> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/fulfillment`, {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "PATCH",
  });
  return readJsonResponse<UpdateFulfillmentResponse>(response);
}
