import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("products route owns a shell with the products sidebar item active", () => {
  const pageSource = readFileSync("src/app/products/page.tsx", "utf8");
  const sidebarSource = readFileSync("src/components/layout/Sidebar.tsx", "utf8");

  assert.match(pageSource, /<Sidebar activeItem="products" \/>/);
  assert.match(pageSource, /<ProductPage \/>/);
  assert.match(sidebarSource, /href: "\/products"/);
  assert.match(sidebarSource, /<Link/);
});

test("product page reuses the product table and exposes add product modal", () => {
  const productPageSource = readFileSync("src/components/products/ProductPage.tsx", "utf8");

  assert.equal(existsSync("src/components/products/AddProductModal.tsx"), true);
  assert.match(productPageSource, /<ProductsTable/);
  assert.match(productPageSource, /Add product/);
  assert.match(productPageSource, /<AddProductModal/);
});

test("product creation uses api request logic and shared types", () => {
  const apiSource = readFileSync("src/api/products.ts", "utf8");
  const typesSource = readFileSync("src/types/products.ts", "utf8");

  assert.match(apiSource, /createProduct/);
  assert.match(apiSource, /\.from\("products"\)/);
  assert.match(typesSource, /ProductCreateInput/);
});

test("product editing and deletion uses api request logic, hook methods, and shared types", () => {
  const apiSource = readFileSync("src/api/products.ts", "utf8");
  const typesSource = readFileSync("src/types/products.ts", "utf8");
  const hookSource = readFileSync("src/hooks/useProducts.ts", "utf8");

  assert.match(apiSource, /updateProduct/);
  assert.match(apiSource, /deleteProduct/);
  assert.match(typesSource, /ProductUpdateInput/);
  assert.match(hookSource, /updateProduct/);
  assert.match(hookSource, /deleteProduct/);
});

