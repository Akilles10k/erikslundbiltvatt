"use client";

import { FormEvent, useState } from "react";

type AdminLoginProps = {
  onSuccess: () => void;
};

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "Kunde inte logga in.");
        return;
      }
      onSuccess();
    } catch {
      setError("Kunde inte nå servern.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <p className="admin-login-eyebrow">Glansig Bilvård</p>
        <h1 className="admin-login-title">Admin</h1>
        <p className="admin-login-text">
          Ange lösenord för att se och hantera bokningar.
        </p>
        <label className="admin-field">
          <span>Lösenord</span>
          <div className="admin-password-row">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="admin-ghost-btn"
              onClick={() => setShow((v) => !v)}
            >
              {show ? "Dölj" : "Visa"}
            </button>
          </div>
        </label>
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="admin-primary-btn"
          disabled={submitting || !password}
        >
          {submitting ? "Loggar in…" : "Logga in"}
        </button>
      </form>
    </div>
  );
}
