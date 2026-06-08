import { PageHeader } from "@/components/shared/PageHeader";

export function DashboardLoadingState() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Loading Secura inventory data." />
      <section className="grid metrics-grid">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </section>
      <section className="grid content-grid">
        <div className="skeleton" />
        <div className="skeleton" />
      </section>
    </>
  );
}
