"use client";

import { useCallback, useEffect, useState } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import "./admin.css";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/session");
      const data = await response.json();
      setAuthed(Boolean(data.ok));
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  if (authed === null) {
    return (
      <main className="admin-boot">
        <p>Laddar…</p>
      </main>
    );
  }

  return (
    <main className="admin-root">
      {authed ? (
        <AdminDashboard onLogout={() => void logout()} />
      ) : (
        <AdminLogin onSuccess={() => setAuthed(true)} />
      )}
    </main>
  );
}
