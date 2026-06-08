import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { Sidebar } from "@/components/layout/Sidebar";

export default function Home() {
  return (
    <div className="app-shell">
      <Sidebar activeItem="dashboard" />
      <main className="main">
        <DashboardHome />
      </main>
    </div>
  );
}
