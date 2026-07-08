"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { FiLock, FiMail, FiAlertTriangle } from "react-icons/fi";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid login credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.card}>
        <div className={styles.header}>
          <img
            className={styles.logo}
            src="/images/logo.jpeg"
            alt="Secura logo"
          />
          <h2>Secura Systems</h2>
          <p>Inventory Dashboard login console</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div className={styles.error} role="alert">
              <FiAlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="loginEmail">Email Address</label>
            <div style={{ position: "relative" }}>
              <FiMail
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              />
              <input
                id="loginEmail"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@secura.com"
                required
                style={{ paddingLeft: "42px" }}
                type="email"
                value={email}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="loginPassword">Password</label>
            <div style={{ position: "relative" }}>
              <FiLock
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              />
              <input
                id="loginPassword"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingLeft: "42px" }}
                type="password"
                value={password}
              />
            </div>
          </div>

          <button
            className="button button-primary"
            disabled={isSubmitting}
            style={{ width: "100%", marginTop: "12px", minHeight: "48px" }}
            type="submit"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </main>
    </div>
  );
}

