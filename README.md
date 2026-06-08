# Secura Inventory Management

Admin dashboard for Secura Digital Systems inventory monitoring, low-stock alerts, and supplier restock email drafts.

## What Is Included

- Next.js App Router dashboard written in TypeScript
- Supabase reads for `products` and recent `pre_orders`
- Low-stock alerts using `products.stock_quantity <= products.low_stock_threshold`
- Supplier message modal tied to each low-stock product
- Copy-to-clipboard and `mailto:` Send Email actions
- Minimal migration for inventory fields on `products`
- Node built-in tests for inventory and supplier message logic

## Supabase Migration

Run the SQL in:

```text
src/supabase/migrations/20260607000000_add_inventory_fields.sql
```

It adds:

```sql
stock_quantity numeric default 0
low_stock_threshold numeric default 0
supplier_email text
```

## Configure The Dashboard

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL=orders@supplier.example
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for loading dashboard data. `NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL` is optional; `supplier_email` on a product overrides it when generating a restock email.

## Run Locally

Install dependencies, then start Next.js:

```bash
pnpm install
pnpm dev
```

The app runs on `http://localhost:3000` by default.

## Test

```bash
pnpm test
```
