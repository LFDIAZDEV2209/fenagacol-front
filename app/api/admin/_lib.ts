import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/session";

// Helpers compartidos de las APIs admin (no es ruta: el _ la excluye).

export async function requireAdmin(): Promise<string | NextResponse> {
  const store = await cookies();
  const email = await verifySession(store.get(COOKIE_NAME)?.value);
  if (!email) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  return email;
}

export type AdminFilters = {
  q: string;
  from: string;
  to: string;
  departmentId: string;
  municipalityId: string;
  role: string; // label visible
  associationId: string;
  sortKey: "name" | "identity" | "phone" | "dept" | "muni" | "assoc" | "date";
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
};

const clamp = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

// Sanea texto libre para ilike (sin comodines ni inyección de filtros PostgREST).
export function cleanSearch(raw: string | null): string {
  return (raw ?? "").replace(/[%_,\\]/g, "").replace(/[,()]/g, " ").trim().slice(0, 60);
}

export function parseFilters(sp: URLSearchParams): AdminFilters {
  const rawSort = sp.get("sort");
  const sortKey: AdminFilters["sortKey"] =
    rawSort === "name" || rawSort === "identity" || rawSort === "phone" || rawSort === "dept" || rawSort === "muni" || rawSort === "assoc"
      ? rawSort
      : "date";
  const sortDir = sp.get("dir") === "asc" ? "asc" : "desc";
  return {
    q: cleanSearch(sp.get("q")),
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    departmentId: (sp.get("departmentId") ?? "").slice(0, 8),
    municipalityId: (sp.get("municipalityId") ?? "").slice(0, 8),
    role: (sp.get("role") ?? "").slice(0, 60),
    associationId: (sp.get("associationId") ?? "").slice(0, 40),
    sortKey,
    sortDir,
    page: clamp(parseInt(sp.get("page") ?? "1", 10), 1, 100000),
    pageSize: clamp(parseInt(sp.get("pageSize") ?? "10", 10), 1, 100),
  };
}

export function toNextDay(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
