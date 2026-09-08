// Filtros + agregaciones del admin. Todo deriva de los registros disponibles
// (mock + registros demo del store). Cuando exista tabla people en Supabase,
// estas agregaciones se reemplazan por queries y la UI no cambia.
import type { Person } from "./mock-data";
import { deptName, muniName } from "./mock-data";

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
  trend: { label: string; value: number; key: string }[];
};

const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function weekKey(d: Date) {
  const c = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (c.getUTCDay() + 6) % 7;
  c.setUTCDate(c.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(c.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((c.getTime() - first.getTime()) / 864e5 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${c.getUTCFullYear()}-W${week}`;
}

// Tendencia semanal últimas 12 semanas hasta `end`
function buildTrend(people: Person[], end: Date): Summary["trend"] {
  const buckets: { key: string; label: string; start: Date }[] = [];
  const cursor = new Date(end);
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7)); // lunes
  for (let i = 11; i >= 0; i--) {
    const s = new Date(cursor);
    s.setDate(s.getDate() - i * 7);
    buckets.push({ key: weekKey(s), label: `${s.getDate()} ${MES[s.getMonth()]}`, start: s });
  }
  const counts = new Map<string, number>();
  for (const p of people) {
    const d = new Date(p.createdAt + "T12:00:00");
    if (Number.isNaN(d.getTime())) continue;
    const k = weekKey(d);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return buckets.map((b) => ({ ...b, value: counts.get(b.key) ?? 0 }));
}

export function summarize(people: Person[], roleOrder: string[], end = new Date()): Summary {
  const total = people.length;
  const galleros = people.filter((p) => p.roles.includes("Gallero")).length;
  const asociados = people.filter((p) => p.associationId).length;
  const muniSet = new Set(people.map((p) => p.municipalityId));

  const deptMap = new Map<string, number>();
  const muniMap = new Map<string, number>();
  const roleMap = new Map<string, number>();
  for (const p of people) {
    const dn = deptName(p.departmentId);
    deptMap.set(dn, (deptMap.get(dn) ?? 0) + 1);
    const mn = muniName(p.municipalityId);
    muniMap.set(mn, (muniMap.get(mn) ?? 0) + 1);
    for (const r of p.roles) roleMap.set(r, (roleMap.get(r) ?? 0) + 1);
  }

  const byDept = [...deptMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  const byMuni = [...muniMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  const labels = roleOrder.length ? roleOrder : [...roleMap.keys()];
  const byRole = labels
    .map((label) => ({ label, value: roleMap.get(label) ?? 0, pct: total ? Math.round(((roleMap.get(label) ?? 0) / total) * 100) : 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  return {
    total,
    galleros,
    asociados,
    municipios: muniSet.size,
    pctGalleros: total ? Math.round((galleros / total) * 100) : 0,
    pctAsociados: total ? Math.round((asociados / total) * 100) : 0,
    byDept,
    byMuni,
    byRole,
    trend: buildTrend(people, end),
  };
}
