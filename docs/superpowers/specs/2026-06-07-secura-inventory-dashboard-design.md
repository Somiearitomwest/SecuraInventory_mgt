# Secura Inventory Dashboard Design

Date: 2026-06-07
Updated: 2026-06-08

## Goal

Build a focused Supabase-backed admin dashboard for Secura Digital Systems to monitor smart-lock inventory, review pre-order demand, and generate supplier restock email drafts from product rows.

This first version stays intentionally small. It extends the existing `products` table only with the inventory fields required for stock visibility and supplier contact actions, while leaving recommendation, procurement, and supplier-order workflows for later.

## Current Context

The app is a Next.js TypeScript dashboard using the App Router under `src/app`. The dashboard page owns the static app shell, while reusable components live under `src/components`.

The connected Supabase database currently includes:

- `customers`
- `products`
- `pre_orders`

Only these three tables are used in this version. Supabase runtime setup is environment-only. The browser reads:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL`

There is no in-app Supabase Settings page and no browser `localStorage` configuration flow.

## Architecture

Use a lean client-side dashboard for this version:

- `src/app/page.tsx` renders the static shell with the sidebar and dashboard home.
- `src/components/dashboard/DashboardHome.tsx` owns dashboard state, loading, error handling, and the supplier modal flow.
- `src/components/dashboard/*` contains reusable dashboard sections.
- `src/supabase/config.ts` owns public environment config.
- `src/supabase/client.ts` only creates the Supabase client.
- `src/api/products.ts` and `src/api/pre-orders.ts` own table-specific Supabase queries and data types.
- `src/lib/inventory.ts` owns pure inventory, supplier-message, metric, and mailto helpers.

## Navigation And Layout

The app uses a persistent white left sidebar with Secura branding and navigation items:

- Dashboard
- Products
- Pre-orders
- Customers

For version one, Dashboard is the implemented view. Settings is intentionally removed because Supabase setup is env-only.

The Dashboard view includes:

- Top summary metrics:
  - total products
  - total revenue, fixed at `0` until a reliable revenue source exists
  - total pre-orders
  - pre-order value, estimated from `pre_orders.total_amount`
- Product inventory table:
  - image
  - name
  - amount
  - stock quantity
  - low-stock threshold
  - stock status
  - row actions menu
- Recent pre-orders preview:
  - latest demand context from `pre_orders`, joined with `products` and `customers` where available

There is no separate Low-stock alerts component. Low-stock status remains visible inside the product inventory table.

## Visual Direction

Use the provided Secura design extract as the base, adjusted for an admin dashboard:

- Typography: Inter
- Surfaces: white cards on a light `#f7f8f8` app background
- Navigation: white sidebar with subtle borders and blue active states
- Primary actions: bright blue `#007bff`
- Borders: subtle `#e1e1e1`
- Cards: compact, professional, max 8px radius
- Icons: `react-icons` line icons for navigation, refresh, menu, copy, and mail actions

The UI should feel like a practical admin console: scannable, moderately dense, and calm.

## Minimal Schema Additions

Add these columns to `products`:

```sql
alter table products
  add column if not exists stock_quantity numeric default 0,
  add column if not exists low_stock_threshold numeric default 0,
  add column if not exists supplier_email text;
```

Use `NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL` as the app-level fallback supplier email. It is public because it is used only to generate a client-side email draft.

## Inventory Logic

A product is low stock when:

```text
stock_quantity <= low_stock_threshold
```

If either value is null during migration or legacy data loading, treat it as `0` in the UI.

Recommended reorder quantity:

```text
max(low_stock_threshold * 2 - stock_quantity, 1)
```

The admin can adjust this quantity before copying or sending the supplier message.

## Supplier Message Action

The supplier action lives inside the Product inventory table.

Each product row includes a menu icon. Opening the menu shows product-scoped actions, including:

- Contact supplier

Selecting Contact supplier opens the supplier message modal for that product. The modal includes:

- product name
- current stock
- low-stock threshold
- requested reorder quantity input
- supplier email field
- generated message preview
- Copy button
- Send Email button

Supplier email resolution:

1. Use `products.supplier_email` if present.
2. Otherwise use `NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL`.
3. If neither exists, show an empty supplier email field and disable Send Email until the admin enters an email.

The app does not send real email in version one. Send Email uses a `mailto:` link.

## Message Template

Use a concise professional template:

```text
Hello,

Please prepare a restock order for <requested_quantity> units of <product_name>.

Current stock: <stock_quantity>
Low-stock threshold: <low_stock_threshold>

Regards,
Secura Digital Systems
```

## Data Flow

On Dashboard load:

1. Check env-backed Supabase config.
2. Create the Supabase client from `src/supabase/client.ts`.
3. Fetch products through `src/api/products.ts`.
4. Fetch recent pre-orders through `src/api/pre-orders.ts`.
5. Compute summary metrics client-side.
6. Render metrics, product inventory, and recent pre-orders.

When Contact supplier is selected from a product row:

1. Open the supplier modal with the selected product.
2. Resolve supplier email using product override, then env default.
3. Compute suggested reorder quantity.
4. Generate message preview.
5. Allow copy or mailto action.

## Error And Empty States

Missing Supabase env vars:

- Show a clear setup state explaining that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are required.
- Do not offer an in-app settings path.

Dashboard loading:

- Show skeleton cards/sections that match final layout dimensions.

Supabase query failure:

- Show a compact error panel with Retry.
- Keep the sidebar/navigation visible.

No products:

- Show an empty inventory state explaining that products will appear once catalog data exists.

No supplier email:

- Allow Copy.
- Disable Send Email until an email is entered.
- Explain the missing email in a short inline note.

Clipboard failure:

- Show a fallback instruction to manually select and copy the message.

## Testing And Verification Expectations

Automated tests should cover:

- products at, below, and above threshold are classified correctly
- suggested reorder quantity is computed correctly
- product supplier email overrides default supplier email
- generated `mailto:` subject and body are URL-safe
- dashboard metrics expose total revenue as `0` until a reliable source exists
- Supabase table reads stay isolated in `src/api`
- the dashboard uses product-table supplier actions instead of a Low-stock alerts component

Manual verification should cover:

- menu icon appears on product rows
- Contact supplier opens the modal for the correct product
- Copy and Send Email behave as expected
- layout works on desktop and mobile widths

## Implementation Milestones

### Milestone 1: Project Foundation

- Use Next.js App Router with TypeScript.
- Place route files under `src/app`.
- Use Inter and the Secura visual foundation.
- Use `react-icons` for dashboard icons.
- Keep the page file as a thin static shell and compose reusable components.

### Milestone 2: Supabase Boundary

- Configure Supabase only through public env vars.
- Keep `src/supabase` limited to config and client creation.
- Keep table reads in `src/api`.
- Avoid browser Settings/localStorage setup.

### Milestone 3: Database Inventory Fields

- Add `stock_quantity`, `low_stock_threshold`, and `supplier_email` to `products`.
- Confirm existing `products`, `customers`, and `pre_orders` queries still work.
- Seed or manually set sample stock values for dashboard verification.

### Milestone 4: Dashboard Metrics And Data

- Fetch products and recent pre-orders from Supabase.
- Compute total products, total revenue fixed at `0`, total pre-orders, and pre-order value.
- Keep low-stock classification available for product status.
- Add loading, empty, missing-env, and query-error states.

### Milestone 5: Product Inventory Actions

- Build the product inventory table as the primary stock view.
- Add a row menu icon to each product.
- Add Contact supplier as a menu option.
- Open the supplier modal from the row action.

### Milestone 6: Supplier Message Workflow

- Resolve supplier email from product override, then env default.
- Generate the supplier message from product details and requested quantity.
- Implement Copy and Send Email actions.
- Keep Send Email disabled when no recipient email is available.

### Milestone 7: Verification And Polish

- Run Node tests.
- Run TypeScript checks.
- Attempt Next build and document any local environment blockers.
- Check responsive layout and action-menu positioning.
- Fix visible overlap, truncation, or awkward empty/error states before handoff.

## Future Recommendations

After the basic dashboard works, consider adding:

- Supabase Auth and role-based admin access
- `suppliers` table
- `supplier_orders` and `supplier_order_items` tables
- restock request status tracking
- automated email sending through an email provider
- audit trail for inventory updates
- product-level stock movement history
- dashboard pages for Products, Customers, and Pre-orders with edit/filter/export workflows
- a reliable revenue source for the Total revenue metric

These should not block version one.
