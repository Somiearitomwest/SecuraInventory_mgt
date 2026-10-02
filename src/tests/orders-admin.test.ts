import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("orders navigation and pages are present", () => {
  const sidebarSource = readFileSync("src/components/layout/Sidebar.tsx", "utf8");
  const ordersPageSource = readFileSync("src/app/orders/page.tsx", "utf8");
  const orderDetailPageSource = readFileSync("src/app/orders/[orderId]/page.tsx", "utf8");

  assert.match(sidebarSource, /id: "orders"/);
  assert.match(sidebarSource, /href: "\/orders"/);
  assert.match(ordersPageSource, /<OrdersPage \/>/);
  assert.match(orderDetailPageSource, /<OrderDetailPage orderId={orderId} \/>/);
});

test("inventory BFF protects and proxies order routes", () => {
  const helperSource = readFileSync("src/lib/admin-orders-server.ts", "utf8");
  const listRouteSource = readFileSync("src/app/api/orders/route.ts", "utf8");
  const detailRouteSource = readFileSync("src/app/api/orders/[orderId]/route.ts", "utf8");
  const fulfillmentRouteSource = readFileSync("src/app/api/orders/[orderId]/fulfillment/route.ts", "utf8");

  assert.match(helperSource, /SECURA_WEB_BASE_URL/);
  assert.match(helperSource, /SECURA_INTERNAL_API_TOKEN/);
  assert.match(helperSource, /x-secura-internal-token/);
  assert.match(helperSource, /auth\.getUser\(token\)/);
  assert.match(listRouteSource, /requireAdminApiAccess/);
  assert.match(detailRouteSource, /requireAdminApiAccess/);
  assert.match(fulfillmentRouteSource, /method: "PATCH"/);
});

test("orders UI keeps fulfillment writes on the BFF path", () => {
  const apiSource = readFileSync("src/api/orders.ts", "utf8");
  const detailSource = readFileSync("src/components/orders/OrderDetailPage.tsx", "utf8");

  assert.equal(existsSync("src/types/orders.ts"), true);
  assert.match(apiSource, /\/api\/orders/);
  assert.match(apiSource, /\/fulfillment/);
  assert.match(detailSource, /trackingProvider/);
  assert.match(detailSource, /window\.confirm/);
  assert.match(detailSource, /fulfillmentStatuses/);
});
