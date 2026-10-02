import { NextResponse, type NextRequest } from "next/server";
import { proxySecuraWeb, requireAdminApiAccess } from "@/lib/admin-orders-server";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiAccess(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = request.nextUrl.searchParams.toString();
  const response = await proxySecuraWeb(`/api/internal/orders${params ? `?${params}` : ""}`);
  const payload = await response.json().catch(() => ({}));

  return NextResponse.json(payload, { status: response.status });
}
