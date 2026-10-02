import { Sidebar } from "@/components/layout/Sidebar";
import { OrderDetailPage } from "@/components/orders/OrderDetailPage";

type OrdersDetailRouteProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrdersDetailRoute({ params }: OrdersDetailRouteProps) {
  const { orderId } = await params;

  return (
    <div className="app-shell">
      <Sidebar activeItem="orders" />
      <main className="main">
        <OrderDetailPage orderId={orderId} />
      </main>
    </div>
  );
}
