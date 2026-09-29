// DIVIPOLA Colombia — catálogo territorial canónico (departamentos + municipios + centros poblados).
// Datos en ./divipola.json (generado DANE vía datos.gov.co xaxy-8nri dic-2024 + gdxc-w37w).
// Alcance: 33 departamentos + 1122 entidades territoriales
// (1103 municipios + isla San Andrés 88001 + 18 ANCAP de Amazonas/Guainía/Vaupés)
// + 7057 centros poblados (pueblos, código divipola de 8 dígitos) como opciones
// de residencia: cuentan como "municipio" en el formulario por decisión de producto.
// Incluye Nuevo Belén de Bajirá (27493, Chocó) y Vaupés (97, ausente antes).
// Nombres históricos de la UI se conservaron por código; el resto en Title Case ES.
// DB: tablas public.departments/municipalities, seed con supabase/seed-divipola.mjs.
// ARCHIVO GENERADO — no editar a mano (regenerar con supabase/gen-divipola.mjs,
// validar 33/1122/7057 y `yarn build`).

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

// Centros poblados (pueblos) — códigos divipola de 8 dígitos. Se cuentan como
// opciones de "municipio" en el formulario por decisión de producto.
export type CentroPoblado = { id: string; divipola: string; departmentId: string; municipalityId: string; name: string };
export const CENTROS_POBLADOS: CentroPoblado[] = ((data as { centrosPoblados?: { code: string; departmentCode: string; municipalityCode: string; name: string }[] }).centrosPoblados ?? []).map((c) => ({
  id: c.code,
  divipola: c.code,
  departmentId: c.departmentCode,
  municipalityId: c.municipalityCode,
  name: c.name,
}));

// Índices O(1): los listados por filial usan `.find` por fila si no se indexa.
const DEPT_BY_ID = new Map(DEPARTMENTS.map((d) => [d.id, d.name]));
const MUNI_BY_ID = new Map([...MUNICIPALITIES, ...CENTROS_POBLADOS].map((m) => [m.id, m]));

export function deptName(id: string) {
  return DEPT_BY_ID.get(id) ?? "—";
}

export function muniName(id: string) {
  return MUNI_BY_ID.get(id)?.name ?? "—";
}

export function getMunicipalitiesByDept(departmentId: string) {
  return MUNICIPALITIES.filter((m) => m.departmentId === departmentId);
}

export function getCentrosPobladosByDept(departmentId: string) {
  return CENTROS_POBLADOS.filter((c) => c.departmentId === departmentId);
}
