import { useAuth } from "@/components/auth/AuthProvider";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <header className="page-header">
      <div>
        {/* <p className="eyebrow">Secura Digital Systems</p> */}
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {action}
        {user && (
          <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: "12px", borderLeft: "1px solid var(--border)", paddingLeft: "20px" }}>
            <div
              className="user-avatar"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "14px"
              }}
              title={user.email}
            >
              {user.email?.[0].toUpperCase() || "U"}
            </div>
            <button className="button button-ghost" onClick={() => void logout()} type="button" style={{ padding: "8px 12px", minHeight: "auto" }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

