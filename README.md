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
supabase/migrations/20260607000000_add_inventory_fields.sql
```

It adds:

```sql
stock_quantity numeric default 0
low_stock_threshold numeric default 0
supplier_email text
```

## Configure The Dashboard

Create `.env.local` if you want defaults available on first load:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEFAULT_SUPPLIER_EMAIL=orders@supplier.example
```

You can also open the app, go to **Settings**, and enter:

- Supabase URL
- Supabase anon key
- Default supplier email

Settings values are stored in browser `localStorage` for local admin use. `supplier_email` on a product overrides the default supplier email when generating a restock email.

## Run Locally

Install dependencies, then start Next.js:

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Test

```bash
npm test
```

In this Codex workspace, the shell currently has Node but no package manager on `PATH`, so the pure TypeScript inventory tests can also be run directly with:

```bash
/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/inventory.test.ts
```
