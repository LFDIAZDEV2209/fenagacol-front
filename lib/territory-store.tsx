"use client";
import * as React from "react";
import {
  DEPARTMENTS,
  MUNICIPALITIES,
  CENTROS_POBLADOS,
  type Department,
  type Municipality,
} from "./divipola";

export type TerritoryCatalog = {
  departments: Department[];
  municipalities: Municipality[];
};
type Catalog = TerritoryCatalog;
type Territory = ReturnType<typeof createResolvers> & {
  refreshTerritory: () => Promise<void>;
  territoryError: string;
  catalogReady: boolean;
  ensureTerritory: () => Promise<Catalog>;
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
  const byDepartment = new Map<string, Municipality[]>();
  const pueblosByDepartment = new Map<string, Municipality[]>();
  for (const m of catalog.municipalities) {
    const map = m.id.length === 8 ? pueblosByDepartment : byDepartment;
    const group = map.get(m.departmentId) ?? [];
    group.push(m);
    map.set(m.departmentId, group);
  }
  return {
    DEPARTMENTS: catalog.departments,
    MUNICIPALITIES: catalog.municipalities,
    deptName: (id: string) => departments.get(id) ?? "—",
    muniName: (id: string) => municipalities.get(id) ?? "—",
    getMunicipalitiesByDept: (id: string) => byDepartment.get(id) ?? [],
    getCentrosPobladosByDept: (id: string) => pueblosByDepartment.get(id) ?? [],
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
    if (rows.length >= data.total) return rows;
    if (data.rows.length === 0)
      throw new Error(
        `El catálogo de ${kind === "departments" ? "departamentos" : "municipios y pueblos"} llegó incompleto. Reintenta.`,
      );
  }
}

export function TerritoryProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = React.useState<Catalog>(FALLBACK);
  const [territoryError, setError] = React.useState("");
  const [catalogReady, setReady] = React.useState(false);
  const current = React.useRef<Catalog>(FALLBACK);
  const verified = React.useRef({ departments: false, municipalities: false });
  const jobs = React.useRef<{
    departments?: Promise<Department[]>;
    municipalities?: Promise<Municipality[]>;
  }>({});
  const commit = React.useCallback((patch: Partial<Catalog>) => {
    const next = { ...current.current, ...patch };
    current.current = next;
    setCatalog(next);
    const complete =
      verified.current.departments && verified.current.municipalities;
    setReady(complete);
    if (complete) {
      setError("");
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* La caché es opcional. */
      }
    }
  }, []);
  const readDepartments = React.useCallback(
    (signal?: AbortSignal) => {
      if (jobs.current.departments) return jobs.current.departments;
      const job = loadCatalog<Department>("departments", signal)
        .then((departments) => {
          if (signal?.aborted)
            throw new DOMException("Cancelado", "AbortError");
          verified.current.departments = true;
          commit({ departments });
          return departments;
        })
        .finally(() => {
          if (jobs.current.departments === job)
            jobs.current.departments = undefined;
        });
      jobs.current.departments = job;
      return job;
    },
    [commit],
  );
  const readMunicipalities = React.useCallback(
    (signal?: AbortSignal) => {
      if (jobs.current.municipalities) return jobs.current.municipalities;
      const job = loadCatalog<Municipality>("municipalities", signal)
        .then((municipalities) => {
          if (signal?.aborted)
            throw new DOMException("Cancelado", "AbortError");
          verified.current.municipalities = true;
          commit({ municipalities });
          return municipalities;
        })
        .finally(() => {
          if (jobs.current.municipalities === job)
            jobs.current.municipalities = undefined;
        });
      jobs.current.municipalities = job;
      return job;
    },
    [commit],
  );
  const refresh = React.useCallback(async () => {
    verified.current = { departments: false, municipalities: false };
    setReady(false);
    try {
      const [departments, municipalities] = await Promise.all([
        readDepartments(),
        readMunicipalities(),
      ]);
      return { departments, municipalities };
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el catálogo.",
      );
      throw error;
    }
  }, [readDepartments, readMunicipalities]);
  React.useEffect(() => {
    const ctrl = new AbortController();
    let idle: number | undefined;
    let delayed: number | undefined;
    const fail = (error: unknown) => {
      if (!ctrl.signal.aborted)
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el catálogo.",
        );
    };
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(KEY) ?? "null",
        ) as Catalog | null;
        if (
          saved &&
          Array.isArray(saved.departments) &&
          Array.isArray(saved.municipalities)
        ) {
          current.current = saved;
          setCatalog(saved);
        }
      } catch {
        /* Sin caché válida se usa DIVIPOLA. */
      }
      // La petición pequeña va primero; los municipios esperan al tiempo libre.
      void readDepartments(ctrl.signal)
        .catch(fail)
        .finally(() => {
          if (ctrl.signal.aborted) return;
          delayed = window.setTimeout(() => {
            const load = () => {
              if (!ctrl.signal.aborted && !verified.current.municipalities)
                void readMunicipalities(ctrl.signal).catch(fail);
            };
            if ("requestIdleCallback" in window)
              idle = window.requestIdleCallback(load, { timeout: 1500 });
            else load();
          }, 1500);
        });
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(delayed);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      ctrl.abort();
    };
  }, [readDepartments, readMunicipalities]);
  const value = React.useMemo(
    () => ({
      ...createResolvers(catalog),
      refreshTerritory: async () => {
        await refresh();
      },
      ensureTerritory: async () =>
        verified.current.departments && verified.current.municipalities
          ? current.current
          : refresh(),
      catalogReady,
      territoryError,
    }),
    [catalog, refresh, territoryError, catalogReady],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
