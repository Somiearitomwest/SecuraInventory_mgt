# Secura Inventory Dashboard Design

Date: 2026-06-07

## Goal

Build a basic Supabase-backed admin dashboard for Secura Digital Systems to monitor smart-lock inventory, surface low-stock products, and help admins generate supplier restock emails.

This first version should stay intentionally small. It should extend the current customer-facing preorder data model only where needed for stock operations, while leaving room for fuller supplier and procurement workflows later.

## Current Context

The repository is a new project with only a README. The connected Supabase database already has these tables:

- `customers`
- `products`
- `pre_orders`

The existing `products` table is the catalog source and should become the first-version source of truth for inventory count and reorder threshold.

Secura's customer website presents the company as a smart-lock brand focused on convenience, biometric/keypad access, phone control, real-time access visibility, and advanced security. The dashboard should borrow the brand system from the customer site without feeling like a landing page.

## Chosen Approach

Use a lean operations dashboard.

The admin home screen should prioritize low-stock visibility and product-level reorder actions. It should include supporting business context from pre-orders and products, but avoid building a full supplier management system in version one.

## Navigation And Layout

The app should use a persistent left sidebar with Secura branding and navigation items:

- Dashboard
- Products
- Pre-orders
- Customers
- Settings

For version one, Dashboard is the primary implemented view. Other navigation entries should remain visible in the sidebar and route to simple placeholder pages that preserve the app shell, show the page title, and state that the section is planned for a later iteration.

The main Dashboard view should include:

- Top summary metrics:
  - total products
  - low-stock products
  - total pre-orders
  - estimated pre-order value
- Low-stock panel:
  - primary operational panel
  - lists products where `stock_quantity <= low_stock_threshold`
  - each low-stock product includes product image/name, current stock, threshold, suggested reorder quantity, and a supplier message icon button
- Product inventory section:
  - table or dense grid of products
  - includes image, name, amount, stock quantity, threshold, and status
- Recent pre-orders preview:
  - shows latest demand context from existing `pre_orders`, joined with `products` and `customers` where available

## Visual Direction

Use the provided Secura design extract as the base:

- Typography: Poppins, with clear hierarchy and no negative letter spacing
- Surfaces: white cards on a light `#f7f8f8` app background
- Navigation: deep Secura blue for the sidebar and active states
- Primary actions: bright blue `#007bff`
- Borders: subtle `#e1e1e1`
- Cards: compact, professional, max 8px radius for admin UI unless existing components require otherwise
- Icons: lucide-style line icons for dashboard navigation, stock alerts, copy, mail, products, customers, and pre-orders

The UI should feel like a practical admin console rather than a marketing page. It should be scannable, moderately dense, and calm.

## Minimal Schema Additions

Add these columns to `products`:

```sql
alter table products
  add column if not exists stock_quantity numeric default 0,
  add column if not exists low_stock_threshold numeric default 0,
  add column if not exists supplier_email text;
```

Use an app-level default supplier email for the first version:

- `default_supplier_email`

Source this from a public app configuration value, preferably an environment variable such as `NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL` if the implementation uses Next.js. It is not a secret because the value is used to open a client-side email draft, but it should still be configurable without code edits.

## Low-Stock Logic

A product is low stock when:

```text
stock_quantity <= low_stock_threshold
```

If either value is null during migration or legacy data loading, treat it as `0` in the UI and encourage the admin to set real values.

Recommended reorder quantity:

```text
max(low_stock_threshold * 2 - stock_quantity, 1)
```

The admin can adjust this quantity before generating or sending the supplier message.

## Supplier Message Action

The supplier message icon appears on each product inside the Low-stock panel.

Clicking the icon opens a modal or drawer scoped to that product. The modal/drawer should include:

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
2. Otherwise use `default_supplier_email`.
3. If neither exists, show an empty supplier email field and disable Send Email until the admin enters an email.

The Copy button copies the generated message body to the clipboard.

The Send Email button uses a `mailto:` link. It opens the admin's default mail client with:

- recipient: resolved supplier email
- subject: `Restock request: <product name>`
- body: generated restock message

The app should not send real email in version one.

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

The generated content should update when the admin changes the requested quantity or supplier email.

## Data Flow

On Dashboard load:

1. Fetch products from Supabase.
2. Fetch recent pre-orders from Supabase.
3. Compute summary metrics client-side for version one.
4. Filter low-stock products using the product inventory fields.
5. Render the low-stock panel and product inventory section.

When supplier message icon is clicked:

1. Open modal/drawer with selected product.
2. Resolve supplier email using product override, then app default.
3. Compute suggested reorder quantity.
4. Generate message preview.
5. Allow copy or mailto action.

## Error And Empty States

Dashboard loading:

- Show skeleton rows/cards that match final layout dimensions.

Supabase query failure:

- Show a compact error panel with a retry action.
- Avoid hiding the sidebar/navigation.

No products:

- Show an empty inventory state explaining that products will appear once catalog data exists.

No low-stock products:

- Show a success/healthy inventory state in the low-stock panel.

No supplier email:

- Allow Copy.
- Disable Send Email until an email is entered.
- Explain the missing email in a short inline note.

Clipboard failure:

- Show a fallback instruction to manually select and copy the message.

## Testing And Verification Expectations

The implementation should verify:

- products at, below, and above threshold are classified correctly
- suggested reorder quantity is computed correctly
- product-specific supplier email overrides default supplier email
- Send Email is disabled when no email is available
- generated `mailto:` subject and body are URL-safe
- empty and error states render cleanly
- layout works on desktop and mobile widths

If the app includes automated tests, these should cover low-stock computation, email resolution, reorder quantity computation, and mailto generation.

## Implementation Milestones

### Milestone 1: Project Foundation

- Choose and scaffold the frontend app stack.
- Configure Supabase client access.
- Add environment configuration for Supabase and `NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL` or equivalent.
- Establish the Secura visual foundation: typography, colors, layout shell, sidebar, and reusable card/button/table/modal primitives.

### Milestone 2: Database Inventory Fields

- Add `stock_quantity`, `low_stock_threshold`, and `supplier_email` to `products`.
- Confirm existing `products`, `customers`, and `pre_orders` queries still work after the migration.
- Seed or manually set sample stock values for local/dashboard verification.

### Milestone 3: Dashboard Data And Metrics

- Fetch products and recent pre-orders from Supabase.
- Compute total products, low-stock products, total pre-orders, and estimated pre-order value.
- Implement low-stock classification using `stock_quantity <= low_stock_threshold`.
- Add loading, empty, and query-error states.

### Milestone 4: Admin Dashboard UI

- Build the app shell with persistent sidebar navigation.
- Build summary metric cards.
- Build the low-stock panel as the primary work area.
- Build the product inventory section.
- Build the recent pre-orders preview.
- Add placeholder pages for Products, Pre-orders, Customers, and Settings.

### Milestone 5: Supplier Message Workflow

- Add the supplier message icon button to each low-stock product.
- Build the product-scoped modal or drawer.
- Resolve supplier email from product override, then default supplier email.
- Generate the supplier message from product details and requested quantity.
- Implement Copy and Send Email actions.
- Ensure Send Email opens a URL-safe `mailto:` draft and stays disabled when no recipient email is available.

### Milestone 6: Verification And Polish

- Verify stock threshold edge cases.
- Verify supplier email fallback behavior.
- Verify copy and mailto behavior.
- Check responsive layout on desktop and mobile widths.
- Confirm Secura visual styling is consistent with the design extract while remaining admin-focused.
- Fix any visible overlap, truncation, or awkward empty/error states before handoff.

## Future Recommendations

After the basic dashboard works, consider adding:

- `suppliers` table
- `supplier_orders` and `supplier_order_items` tables
- restock request status tracking
- automated email sending through an email provider
- audit trail for inventory updates
- product-level stock movement history
- role-based admin access
- dashboard pages for Products, Customers, and Pre-orders with edit/filter/export workflows

These should not block version one.
