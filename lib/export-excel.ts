// Exportación REAL a Excel con SheetJS. Respeta filtros: el caller pasa las filas ya filtradas.
import * as XLSX from "xlsx";
import type { Person } from "./mock-data";
import { deptName, muniName, assocName } from "./mock-data";
import { dateStamp, fmtDate } from "./format";

export type Sheet = { name: string; rows: Record<string, string | number>[] };

export function downloadExcel(baseName: string, sheets: Sheet[]) {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.json_to_sheet(s.rows);
    // Ancho de columnas según contenido
    const keys = s.rows.length ? Object.keys(s.rows[0]) : [];
    ws["!cols"] = keys.map((k) => ({
      wch: Math.min(48, Math.max(k.length + 2, ...s.rows.map((r) => String(r[k] ?? "").length + 2))),
    }));
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }
  XLSX.writeFile(wb, `${baseName}_${dateStamp()}.xlsx`);
}

export function personRows(people: Person[]) {
  return people.map((p) => ({
    Nombre: p.fullName,
    Identidad: p.identity,
    Teléfono: p.phone,
    Correo: p.email ?? "",
    Departamento: deptName(p.departmentId),
    Municipio: muniName(p.municipalityId),
    Roles: p.roles.join(", "),
    Asociación: assocName(p.associationId),
    Fecha: fmtDate(p.createdAt),
  }));
}

export function assocRows(assocs: { name: string; departmentId: string; municipalityId: string; members: number }[]) {
  return assocs.map((a) => ({
    Asociación: a.name,
    Departamento: deptName(a.departmentId),
    Municipio: muniName(a.municipalityId),
    Miembros: a.members,
  }));
}
