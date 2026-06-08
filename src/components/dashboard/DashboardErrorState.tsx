import { FiRefreshCw } from "react-icons/fi";
import { PageHeader } from "@/components/shared/PageHeader";

export function DashboardErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Inventory data could not be loaded." />
      <section className="error-state">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button className="button button-primary" onClick={() => void onRetry()} type="button">
          <FiRefreshCw size={18} /> Retry
        </button>
      </section>
    </>
  );
}
