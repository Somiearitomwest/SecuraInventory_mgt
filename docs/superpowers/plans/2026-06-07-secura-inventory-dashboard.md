# Secura Inventory Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Supabase-backed Next.js TypeScript admin dashboard for Secura stock monitoring, low-stock alerts, and supplier email draft generation.

**Architecture:** Use the Next.js App Router with a client dashboard component for browser-only Supabase configuration, localStorage settings, clipboard access, and `mailto:` generation. Keep inventory/message rules in a pure TypeScript module covered by Node tests. Keep Supabase queries in a typed helper module.

**Tech Stack:** Next.js, React, TypeScript, Supabase JS, lucide-react, Node built-in test runner.

---

## File Structure

- `app/layout.tsx`: Root metadata and global CSS import.
- `app/page.tsx`: Dashboard route entry.
- `app/components/DashboardApp.tsx`: Client admin shell, data loading, dashboard rendering, settings, and supplier modal.
- `app/lib/config.ts`: Environment/localStorage config helpers.
- `app/lib/inventory.ts`: Pure inventory and supplier-message rules.
- `app/lib/supabase.ts`: Typed Supabase client/query helpers.
- `app/globals.css`: Secura admin design system and responsive layout.
- `tests/inventory.test.ts`: Node tests for pure inventory/message behavior.
- `supabase/migrations/20260607000000_add_inventory_fields.sql`: Minimal product inventory columns.
- `README.md`: Setup, migration, env, run, and test instructions.

## Tasks

### Task 1: Typed Inventory Rules

- [x] Move pure inventory and supplier message rules into `app/lib/inventory.ts`.
- [x] Update tests to import the TypeScript module.
- [x] Verify red failure before the TypeScript module exists.
- [x] Implement the TypeScript module.
- [x] Verify the tests pass.

### Task 2: Next.js Project Foundation

- [x] Add `package.json`, `tsconfig.json`, `next-env.d.ts`, and `next.config.mjs`.
- [x] Add App Router entry files in `app/layout.tsx` and `app/page.tsx`.
- [x] Add Next public environment variable documentation.

### Task 3: Supabase And Config Modules

- [x] Add `app/lib/config.ts` for env/localStorage config.
- [x] Add `app/lib/supabase.ts` for typed Supabase queries.
- [x] Keep the minimal products migration.

### Task 4: React Dashboard UI

- [x] Build the persistent white sidebar navigation.
- [x] Build dashboard metrics, low-stock panel, product inventory table, and recent pre-orders preview.
- [x] Build placeholder pages for Products, Pre-orders, and Customers.
- [x] Build Settings for browser-local Supabase/default supplier email values.

### Task 5: Supplier Message Workflow

- [x] Add product-scoped mail icon buttons to low-stock rows.
- [x] Build supplier modal with requested quantity, supplier email, generated message, Copy, and Send Email.
- [x] Use product supplier email override before default supplier email.
- [x] Disable Send Email when no recipient exists.

### Task 6: Verification

- [x] Run Node tests for inventory/message rules.
- [x] Run parser checks for TypeScript library modules available without installed dependencies.
- [ ] Run `npm install`.
- [ ] Run `npm run build`.
- [ ] Run `npm run dev` and verify the Next app in the browser.

The final three checks require a package manager. This workspace currently has Node on `PATH` but no `npm`, `pnpm`, `yarn`, `corepack`, `tsc`, or `next`.
