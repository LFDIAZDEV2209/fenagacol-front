"use client";
import * as React from "react";
import type { Person } from "./mock-data";
import { deptName, muniName } from "./mock-data";
import { useTerritory } from "./territory-store";
import type { Filters, Summary } from "./filters";

const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Debounce para el buscador: no disparar request por cada tecla.
export function useDebouncedValue<T>(value: T, ms = 350): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function toQuery(f: Filters, extra: Record<string, string | number> = {}) {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.from) sp.set("from", f.from);
  if (f.to) sp.set("to", f.to);
  if (f.departmentId) sp.set("departmentId", f.departmentId);
  if (f.municipalityId) sp.set("municipalityId", f.municipalityId);
  if (f.role) sp.set("role", f.role);
  if (f.associationId) sp.set("associationId", f.associationId);
  for (const [k, v] of Object.entries(extra)) sp.set(k, String(v));
  return sp.toString();
}

type RpcSummary = {
  total: number;
  galleros: number;
  asociados: number;
  municipios: number;
  by_dept: { id: string; value: number }[];
  by_muni: { id: string; value: number }[];
  by_role: { label: string; value: number }[];
  by_assoc: { id: string | null; value: number }[];
  weekly: { week: string; value: number }[];
};

function mondayOf(d: Date) {
  const c = new Date(d);
  c.setDate(c.getDate() - ((c.getDay() + 6) % 7));
  c.setHours(12, 0, 0, 0);
  return c;
}

function fillTrend(weekly: { week: string; value: number }[]): Summary["trend"] {
  const map = new Map(weekly.map((w) => [w.week, w.value]));
  const base = mondayOf(new Date());
  const out: Summary["trend"] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i * 7);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ key, label: `${d.getDate()} ${MES[d.getMonth()]}`, value: map.get(key) ?? 0 });
  }
  return out;
}

export function toSummary(rpc: RpcSummary, names = { deptName, muniName }): Summary {
  const { total } = rpc;
  return {
    total,
    galleros: rpc.galleros,
    asociados: rpc.asociados,
    municipios: rpc.municipios,
    pctGalleros: total ? Math.round((rpc.galleros / total) * 100) : 0,
    pctAsociados: total ? Math.round((rpc.asociados / total) * 100) : 0,
    byDept: (rpc.by_dept ?? []).map((d) => ({ name: names.deptName(d.id), value: d.value })),
    byMuni: (rpc.by_muni ?? []).map((m) => ({ name: names.muniName(m.id), value: m.value })),
    byRole: (rpc.by_role ?? []).map((r) => ({
      label: r.label,
      value: r.value,
      pct: total ? Math.round((r.value / total) * 100) : 0,
    })),
    byAssoc: (rpc.by_assoc ?? []).map((a) => ({ id: a.id, value: a.value })),
    trend: fillTrend(rpc.weekly ?? []),
  };
}

async function getJSON<T>(url: string, signal: AbortSignal): Promise<T> {
  const r = await fetch(url, { signal });
  const d = (await r.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
  if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`);
  return d as T;
}

// Tabla paginada en servidor. Cambiar filtros/página aborta el request anterior.
export function usePeopleQuery(opts: {
  filters: Filters;
  page: number;
  pageSize: number;
  sortKey: "name" | "identity" | "phone" | "dept" | "muni" | "assoc" | "date";
  sortDir: "asc" | "desc";
}) {
  const { filters, page, pageSize, sortKey, sortDir } = opts;
  const [data, setData] = React.useState<Person[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [nonce, setNonce] = React.useState(0);

  // Arranque diferido post-commit (evita renders en cascada); el abort
  // cancela el request anterior cuando cambian filtros/página.
  React.useEffect(() => {
    const ctrl = new AbortController();
    const id = window.setTimeout(() => {
      setLoading(true);
      setError("");
      getJSON<{ people: Person[]; total: number }>(
        `/api/admin/directory?${toQuery(filters, { page, pageSize, sort: sortKey, dir: sortDir })}`,
        ctrl.signal
      )
        .then((d) => {
          setData(d.people ?? []);
          setTotal(d.total ?? 0);
        })
        .catch((e) => {
          if ((e as Error).name !== "AbortError") setError(e instanceof Error ? e.message : "Error de red.");
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      ctrl.abort();
      window.clearTimeout(id);
    };
  }, [filters, page, pageSize, sortKey, sortDir, nonce]);

  return { data, total, loading, error, reload: () => setNonce((n) => n + 1) };
}

// Agregados en servidor (KPIs + gráficas). Sin límite de filas.
export function useSummaryQuery(filters: Filters) {
  const names = useTerritory();
  const [raw, setSummary] = React.useState<RpcSummary | null>(null);
  const summary = React.useMemo(() => raw ? toSummary(raw, names) : null, [raw, names]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    const ctrl = new AbortController();
    const id = window.setTimeout(() => {
      setLoading(true);
      setError("");
      getJSON<RpcSummary>(`/api/admin/summary?${toQuery(filters)}`, ctrl.signal)
        .then((d) => setSummary(d))
        .catch((e) => {
          if ((e as Error).name !== "AbortError") setError(e instanceof Error ? e.message : "Error de red.");
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      ctrl.abort();
      window.clearTimeout(id);
    };
  }, [filters, nonce]);

  return { summary, loading, error, reload: () => setNonce((n) => n + 1) };
}

// Todas las filas filtradas para Excel. El servidor pagina por Max Rows
// (≤1000 por consulta) y este caller parte el total en chunks de 5000
// filas: una respuesta única de ~16 mil registros rebasa el payload
// máximo de 4,5 MB de una función serverless en Vercel.
export type ExportResult = { rows: Person[]; total: number; truncated: boolean };
export async function fetchExportRows(filters: Filters): Promise<ExportResult> {
  const base = `/api/admin/export?${toQuery(filters)}`;
  const signal = new AbortController().signal;
  const first = await getJSON<ExportResult>(
    `${base}&start=0&rows=5000`,
    signal
  );
  const total = first.total;
  const rows = first.rows ?? [];
  while (rows.length < total && rows.length < 20000) {
    const next = await getJSON<ExportResult>(
      `${base}&start=${rows.length}&rows=5000`,
      signal
    );
    if (!next.rows?.length) break;
    rows.push(...next.rows);
  }
  return { rows, total, truncated: total > rows.length };
}

export type TerritoryRow = { id: string; divipola: string; name: string; departmentId?: string; municipalityCount: number };
export function useTerritoryQuery(kind: "departments" | "municipalities", opts: {
  q: string; departmentId: string; sort: "code" | "name"; dir: "asc" | "desc"; page: number; pageSize: number;
}) {
  const query = new URLSearchParams({ ...opts, page: String(opts.page), pageSize: String(opts.pageSize) }).toString();
  const [nonce, setNonce] = React.useState(0);
  const key = `${kind}?${query}&reload=${nonce}`;
  const [state, setState] = React.useState<{ key: string; rows: TerritoryRow[]; total: number; error: string }>({ key: "", rows: [], total: 0, error: "" });
  React.useEffect(() => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      getJSON<{ rows: TerritoryRow[]; total: number }>(`/api/admin/${key}`, ctrl.signal)
        .then((d) => { if (!ctrl.signal.aborted) setState({ key, rows: d.rows, total: d.total, error: "" }); })
        .catch((e) => { if (!ctrl.signal.aborted) setState({ key, rows: [], total: 0, error: e instanceof Error ? e.message : "No se pudo cargar." }); });
    }, 350);
    return () => { window.clearTimeout(timer); ctrl.abort(); };
  }, [key]);
  return { ...state, loading: state.key !== key, reload: () => setNonce((n) => n + 1) };
}
