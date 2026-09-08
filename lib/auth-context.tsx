"use client";
import * as React from "react";

type User = { email: string; name: string };
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const C = React.createContext<Ctx | null>(null);

export function useAuth() {
  const ctx = React.useContext(C);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d && d.email ? { email: d.email, name: d.name ?? "Administrador" } : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return (d.error as string) ?? "No se pudo ingresar.";
    setUser({ email: d.email, name: "Administrador" });
    return null;
  }, []);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  }, []);

  return <C.Provider value={{ user, loading, login, logout }}>{children}</C.Provider>;
}
