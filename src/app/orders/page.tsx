import { Sidebar } from "@/components/layout/Sidebar";
import { OrdersPage } from "@/components/orders/OrdersPage";

export default function OrdersRoute() {
  return (
    <div className="app-shell">
      <Sidebar activeItem="orders" />
      <main className="main">
        <OrdersPage />
      </main>
    </div>
  );
}
