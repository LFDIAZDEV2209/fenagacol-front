// Tipos de filtros + shape del resumen.
// Datos: el directorio paginado y los agregados viven en el servidor
// (/api/admin/directory, /api/admin/summary). applyFilters queda como
// utilidad local (p. ej. conteos offline en configuración).
import type { Person } from "./mock-data";

export type Filters = {
  q: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  departmentId: string;
  municipalityId: string;
  role: string;
  associationId: string;
};

export const emptyFilters: Filters = {
  q: "",
  from: "",
  to: "",
  departmentId: "",
  municipalityId: "",
  role: "",
  associationId: "",
};

export function activeFilterCount(f: Filters) {
  return [f.q, f.from, f.to, f.departmentId, f.municipalityId, f.role, f.associationId].filter(Boolean).length;
}

export function applyFilters(people: Person[], f: Filters): Person[] {
  return people.filter((p) => {
    if (f.q && !`${p.fullName} ${p.identity} ${p.phone}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.from && p.createdAt < f.from) return false;
    if (f.to && p.createdAt > f.to) return false;
    if (f.departmentId && p.departmentId !== f.departmentId) return false;
    if (f.municipalityId && p.municipalityId !== f.municipalityId) return false;
    if (f.role && !p.roles.includes(f.role)) return false;
    if (f.associationId && p.associationId !== f.associationId) return false;
    return true;
  });
}

export type Summary = {
  total: number;
  galleros: number;
  asociados: number;
  municipios: number;
  pctGalleros: number;
  pctAsociados: number;
  byDept: { name: string; value: number }[];
  byMuni: { name: string; value: number }[];
  byRole: { label: string; value: number; pct: number }[];
  byAssoc: { id: string; value: number }[];
  trend: { label: string; value: number; key: string }[];
};


