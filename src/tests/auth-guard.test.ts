import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("Next.js Edge Middleware route guard is defined", () => {
  assert.equal(existsSync("src/middleware.ts"), true);
  const middlewareSource = readFileSync("src/middleware.ts", "utf8");
  assert.match(middlewareSource, /export function middleware/);
  assert.match(middlewareSource, /sb-access-token/);
  assert.match(middlewareSource, /login/);
});

test("AuthProvider context provides authentication services", () => {
  assert.equal(existsSync("src/components/auth/AuthProvider.tsx"), true);
  const providerSource = readFileSync("src/components/auth/AuthProvider.tsx", "utf8");
  assert.match(providerSource, /export function AuthProvider/);
  assert.match(providerSource, /export function useAuth/);
  assert.match(providerSource, /signInWithPassword/);
  assert.match(providerSource, /signOut/);
});

test("Layout and page headers integrate auth gates", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  const headerSource = readFileSync("src/components/shared/PageHeader.tsx", "utf8");

  assert.match(layoutSource, /<AuthProvider>/);
  assert.match(headerSource, /useAuth/);
  assert.match(headerSource, /logout/);
});
