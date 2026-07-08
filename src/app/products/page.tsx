import { Sidebar } from "@/components/layout/Sidebar";
import { ProductPage } from "@/components/products/ProductPage";

export default function ProductsRoute() {
  return (
    <div className="app-shell">
      <Sidebar activeItem="products" />
      <main className="main">
        <ProductPage />
      </main>
    </div>
  );
}
