import { NextResponse, type NextRequest } from "next/server";
import { proxySecuraWeb, requireAdminApiAccess } from "@/lib/admin-orders-server";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdminApiAccess(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { orderId } = await context.params;
  const body = await request.text();
  const response = await proxySecuraWeb(`/api/internal/orders/${encodeURIComponent(orderId)}/fulfillment`, {
    body,
    headers: { "content-type": request.headers.get("content-type") || "application/json" },
    method: "PATCH",
  });
  const payload = await response.json().catch(() => ({}));

  return NextResponse.json(payload, { status: response.status });
}
