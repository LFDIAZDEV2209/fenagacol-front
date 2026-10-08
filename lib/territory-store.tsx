"use client";
import * as React from "react";
import {
  DEPARTMENTS,
  MUNICIPALITIES,
  CENTROS_POBLADOS,
  type Department,
  type Municipality,
} from "./divipola";

type Catalog = { departments: Department[]; municipalities: Municipality[] };
type Territory = ReturnType<typeof createResolvers> & {
  refreshTerritory: () => Promise<void>;
  territoryError: string;
};
const FALLBACK: Catalog = {
  departments: DEPARTMENTS,
  municipalities: [...MUNICIPALITIES, ...CENTROS_POBLADOS],
};
const KEY = "fenagacol_territory_v1";

export function createResolvers(catalog: Catalog) {
  const departments = new Map(catalog.departments.map((d) => [d.id, d.name]));
  const municipalities = new Map(
    catalog.municipalities.map((m) => [m.id, m.name]),
  );
  return {
    DEPARTMENTS: catalog.departments,
    MUNICIPALITIES: catalog.municipalities,
    deptName: (id: string) => departments.get(id) ?? "—",
    muniName: (id: string) => municipalities.get(id) ?? "—",
    getMunicipalitiesByDept: (id: string) =>
      catalog.municipalities.filter(
        (m) => m.departmentId === id && m.id.length === 5,
      ),
    getCentrosPobladosByDept: (id: string) =>
      catalog.municipalities.filter(
        (m) => m.departmentId === id && m.id.length === 8,
      ),
  };
}

const C = React.createContext<Territory | null>(null);
export function useTerritory() {
  const value = React.useContext(C);
  if (!value) throw new Error("useTerritory fuera de ConfigProvider");
  return value;
}

async function loadCatalog<T>(
  kind: string,
  signal?: AbortSignal,
): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`/api/territory?kind=${kind}&page=${page}`, {
      signal,
      cache: "no-store",
    });
    if (!r.ok)
      throw new Error(
        "No se pudo actualizar el catálogo. Comprueba la conexión.",
      );
    const data = (await r.json()) as { rows: T[]; total: number };
    rows.push(...data.rows);
    if (rows.length >= data.total || data.rows.length === 0) return rows;
  }
}

export function TerritoryProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = React.useState<Catalog>(FALLBACK);
  const [territoryError, setError] = React.useState("");
  const generation = React.useRef(0);
  const refresh = React.useCallback(async (signal?: AbortSignal) => {
    const current = ++generation.current;
    try {
      const [departments, municipalities] = await Promise.all([
        loadCatalog<Department>("departments", signal),
        loadCatalog<Municipality>("municipalities", signal),
      ]);
      if (signal?.aborted || current !== generation.current) return;
      const next = { departments, municipalities };
      setCatalog(next);
      setError("");
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* La caché es opcional. */
      }
    } catch (error) {
      if (signal?.aborted || current !== generation.current) return;
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el catálogo.";
      setError(message);
      throw error;
    }
  }, []);
  React.useEffect(() => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(KEY) ?? "null",
        ) as Catalog | null;
        if (
          saved &&
          Array.isArray(saved.departments) &&
          Array.isArray(saved.municipalities)
        )
          setCatalog(saved);
      } catch {
        /* Sin caché válida se usa DIVIPOLA. */
      }
      void refresh(ctrl.signal).catch(() => undefined);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [refresh]);
  const value = React.useMemo(
    () => ({
      ...createResolvers(catalog),
      refreshTerritory: () => refresh(),
      territoryError,
    }),
    [catalog, refresh, territoryError],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
