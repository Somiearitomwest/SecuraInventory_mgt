import type { ComponentType } from "react";
import { FiBox, FiFileText, FiGrid, FiUsers } from "react-icons/fi";

type NavItemId = "dashboard" | "products" | "pre-orders" | "customers";

const navItems: Array<{
  id: NavItemId;
  label: string;
  icon: ComponentType<{ size?: number }>;
}> = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "products", label: "Products", icon: FiBox },
  { id: "pre-orders", label: "Pre-orders", icon: FiFileText },
  { id: "customers", label: "Customers", icon: FiUsers },
];

export function Sidebar({ activeItem }: { activeItem: NavItemId }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <img className="brand-logo" src="/images/logo.jpeg" alt="Secura Digital Systems" />
        </div>
        <div>
          <span className="brand-title">Secura</span>
          <span className="brand-subtitle">Inventory Admin</span>
        </div>
      </div>
      <nav className="nav-list" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`nav-button ${activeItem === item.id ? "is-active" : ""}`}
              key={item.id}
              type="button"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        Smart lock stock visibility for Secura Digital Systems.
      </div>
    </aside>
  );
}
