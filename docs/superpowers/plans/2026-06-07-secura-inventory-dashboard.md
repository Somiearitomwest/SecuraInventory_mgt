# Secura Inventory Dashboard Implementation Plan

> **For agentic workers:** Use this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Supabase-backed Next.js TypeScript admin dashboard for Secura stock monitoring, pre-order context, and product-row supplier email draft generation.

**Architecture:** Use the Next.js App Router with `src/app/page.tsx` as a thin static shell. Keep dashboard state in `DashboardHome`, split UI into reusable components, keep pure inventory/message rules in `src/lib/inventory.ts`, keep Supabase config/client creation in `src/supabase`, and keep table reads in `src/api`.

**Tech Stack:** Next.js, React, TypeScript, Supabase JS, react-icons, Node built-in test runner.

---

## File Structure

- `src/app/layout.tsx`: Root metadata and global CSS import.
- `src/app/page.tsx`: Static dashboard shell with sidebar and dashboard home.
- `src/components/layout/Sidebar.tsx`: Reusable Secura sidebar.
- `src/components/dashboard/DashboardHome.tsx`: Client dashboard state, data loading, and supplier modal flow.
- `src/components/dashboard/MetricsGrid.tsx`: Top dashboard metrics.
- `src/components/dashboard/ProductsTable.tsx`: Product inventory table with row action menu.
- `src/components/dashboard/RecentPreOrders.tsx`: Recent pre-orders preview.
- `src/components/dashboard/SupplierModal.tsx`: Supplier message modal.
- `src/components/shared/*`: Shared page header and product image components.
- `src/supabase/config.ts`: Public env config helpers.
- `src/supabase/client.ts`: Supabase client creation only.
- `src/api/products.ts`: Product query and type.
- `src/api/pre-orders.ts`: Recent pre-order query and type.
- `src/lib/inventory.ts`: Pure inventory, metrics, supplier-message, and mailto rules.
- `src/app/globals.css`: Secura admin design system and responsive layout.
- `src/tests/*.test.ts`: Node tests for dashboard rules and structural boundaries.
- `src/supabase/migrations/20260607000000_add_inventory_fields.sql`: Minimal product inventory columns.
- `README.md`: Setup, migration, env, run, and test instructions.

## Tasks

### Task 1: Typed Inventory Rules

- [x] Move pure inventory and supplier message rules into `src/lib/inventory.ts`.
- [x] Implement low-stock status and suggested reorder quantity helpers.
- [x] Implement supplier email resolution, message generation, and mailto helpers.
- [x] Add total revenue metric as `0` until a reliable revenue source exists.
- [x] Verify the tests pass.

### Task 2: Next.js Project Foundation

- [x] Add `package.json`, `tsconfig.json`, `next-env.d.ts`, and Next config.
- [x] Add App Router entry files in `src/app/layout.tsx` and `src/app/page.tsx`.
- [x] Move app, Supabase, and tests under `src`.
- [x] Keep `src/app/page.tsx` as the static shell and decouple dashboard code into components.
- [x] Use Inter as the dashboard font.
- [x] Use the logo from `public/images`.

### Task 3: Supabase And Config Boundary

- [x] Use env-only Supabase config.
- [x] Use `NEXT_PUBLIC_SUPABASE_URL`.
- [x] Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [x] Use `NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL` as the supplier fallback.
- [x] Remove in-app Settings/localStorage config.
- [x] Keep `src/supabase` limited to config and client creation.
- [x] Move Supabase table reads into `src/api`.
- [x] Keep the minimal products migration.

### Task 4: React Dashboard UI

- [x] Build the persistent white sidebar navigation.
- [x] Build dashboard metrics: Total products, Total revenue, Total pre-orders, and Pre-order value.
- [x] Build the product inventory table as the primary stock view.
- [x] Build recent pre-orders preview.
- [x] Remove the standalone Low-stock alerts component.
- [x] Keep low-stock status inside product inventory rows.

### Task 5: Product Row Supplier Actions

- [x] Add a menu icon to each product inventory row.
- [x] Add Contact supplier as a popover menu option.
- [x] Open the supplier modal from the product row action.
- [x] Resolve product supplier email before default supplier email.
- [x] Disable Send Email when no recipient exists.
- [x] Keep Copy available for generated messages.

### Task 6: Verification

- [x] Run Node tests for inventory/message rules and structural boundaries.
- [x] Run TypeScript checks.
- [ ] Run production build successfully.
- [ ] Run the Next app and verify in the browser.

Build verification is currently blocked locally by a Next SWC macOS code-signing issue before app compilation.
