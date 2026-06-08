import { PageHeader } from "@/components/shared/PageHeader";

export function DashboardSetupState() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Supabase environment setup is required." />
      <section className="card settings-card">
        <h2>Supabase env vars required</h2>
        <p className="muted">
          Setup Supabase credentials to load products, pre-orders, and inventory actions.
        </p>
      </section>
    </>
  );
}
