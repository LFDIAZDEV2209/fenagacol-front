// DIVIPOLA Colombia — catálogo territorial canónico (departamentos + municipios).
// Datos en ./divipola.json (generado DANE vía datos.gov.co gdxc-w37w, corte dic-2025).
// Alcance: 33 departamentos + 1104 municipios (1103 tipo Municipio + Isla San Andrés 88001).
// Excluye 18 Áreas No Municipalizadas (sin gobierno municipal; fuera del registro).
// Incluye Nuevo Belén de Bajirá (27493, Chocó) y Vaupés (97, ausente antes).
// Nombres históricos de la UI se conservaron por código; el resto en Title Case ES.
// DB: tablas public.departments/municipalities, seed con supabase/seed-divipola.mjs.
// ARCHIVO GENERADO — no editar a mano (regenerar JSON+TS juntos, validar 33/1104 y `yarn build`).

import data from "./divipola.json";

export type Department = { id: string; divipola: string; name: string };
export type Municipality = { id: string; divipola: string; departmentId: string; name: string };

export const DEPARTMENTS: Department[] = (data.departments as { code: string; name: string }[]).map((d) => ({
  id: d.code,
  divipola: d.code,
  name: d.name,
}));

export const MUNICIPALITIES: Municipality[] = (data.municipalities as { code: string; departmentCode: string; name: string }[]).map((m) => ({
  id: m.code,
  divipola: m.code,
  departmentId: m.departmentCode,
  name: m.name,
}));

// Índices O(1): los listados por filial usan `.find` por fila si no se indexa.
const DEPT_BY_ID = new Map(DEPARTMENTS.map((d) => [d.id, d.name]));
const MUNI_BY_ID = new Map(MUNICIPALITIES.map((m) => [m.id, m]));

export function deptName(id: string) {
  return DEPT_BY_ID.get(id) ?? "—";
}

export function muniName(id: string) {
  return MUNI_BY_ID.get(id)?.name ?? "—";
}

export function getMunicipalitiesByDept(departmentId: string) {
  return MUNICIPALITIES.filter((m) => m.departmentId === departmentId);
}
