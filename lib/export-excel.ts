// Exportación REAL a Excel con diseño corporativo (ExcelJS):
// header rosa con texto blanco, bandas alternadas, bordes sutiles,
// autofiltros, fila congelada y pestañas rosa. Respeta filtros: el caller
// pasa las filas ya filtradas.
import type { Person } from "./mock-data";
import { deptName, muniName } from "./mock-data";
import { resolveAssocName, type AssocOpt } from "./config-store";
import { dateStamp, fmtDate } from "./format";
import type { TerritoryCatalog } from "./territory-store";
import type { TerritoryStats } from "./server-data";

export type Sheet = { name: string; rows: Record<string, string | number>[] };

const ROSE = "FF732427";
const ROSE_DARK = "FF481418";
const ROSE_PALE = "FFF8EDEF";
const INK = "FF1C1917";
const WHITE = "FFFFFFFF";
const LINE = "FFD9D2C2";
const THIN = { style: "thin" as const, color: { argb: LINE } };

export function exportNotice(result: { rows: unknown[]; total: number; truncated: boolean }) {
  return result.truncated
    ? `Se exportaron ${result.rows.length.toLocaleString("es-CO")} de ${result.total.toLocaleString("es-CO")} registros. El tope es 20.000; filtra para descargar los restantes.`
    : "";
}

export async function downloadExcel(baseName: string, sheets: Sheet[], notice = "") {
  // Carga diferida: exceljs (~800KB) solo se descarga cuando el usuario exporta,
  // no penaliza el bundle inicial del admin.
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Tu Carné Gremial · Fenagacol";
  wb.created = new Date();
  if (notice) {
    const aviso = wb.addWorksheet("Aviso de exportación");
    aviso.getColumn(1).width = 100;
    aviso.addRow([notice]).alignment = { wrapText: true };
    aviso.getRow(1).height = 48;
  }

  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31), {
      properties: { tabColor: { argb: ROSE } },
    });
    if (!s.rows.length) {
      ws.addRow(["Sin datos con los filtros aplicados"]);
      ws.getRow(1).font = { italic: true, color: { argb: INK }, size: 11 };
      continue;
    }

    const keys = Object.keys(s.rows[0]);
    ws.columns = keys.map((k) => ({
      header: k,
      key: k,
      width: Math.min(42, Math.max(k.length + 6, ...s.rows.map((r) => String(r[k] ?? "").length + 4))),
    }));
    ws.addRows(s.rows);

    // Header rosa
    const header = ws.getRow(1);
    header.height = 24;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: WHITE }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ROSE } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = { top: THIN, left: THIN, bottom: THIN, right: THIN };
    });

    // Bandas alternadas + bordes
    ws.eachRow((row, i) => {
      if (i === 1) return;
      const band = i % 2 === 0;
      row.eachCell((cell, col) => {
        cell.font = { size: 11, color: { argb: INK }, bold: col === 1 };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = { top: THIN, left: THIN, bottom: THIN, right: THIN };
        if (band) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ROSE_PALE } };
      });
    });

    // Filtros + congelar encabezado
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: keys.length } };
    ws.views = [{ state: "frozen", ySplit: 1 }];

    // Pie con fecha de generación
    const foot = ws.addRow([`Generado por Tu Carné Gremial · ${fmtDate(dateStamp())}`]);
    foot.getCell(1).font = { italic: true, size: 9, color: { argb: ROSE_DARK } };
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${baseName}_${dateStamp()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

type Names = { deptName: (id: string) => string; muniName: (id: string) => string };
export function personRows(people: Person[], assocs: AssocOpt[] = [], names: Names = { deptName, muniName }) {
  return people.map((p) => ({
    Nombre: p.fullName,
    Identidad: p.identity,
    Teléfono: p.phone,
    Correo: p.email ?? "",
    Departamento: names.deptName(p.departmentId),
    Municipio: names.muniName(p.municipalityId),
    Roles: p.roles.join(", "),
    Asociación: resolveAssocName(p.associationId, assocs),
    "Otra asociación": p.otherAssocName ?? "",
    "Contacto otra asociación": p.otherAssocContact ?? "",
    "Galleros Unidos de Colombia": p.gallerosUnidos ? "Sí" : "No",
    Fecha: fmtDate(p.createdAt),
  }));
}

export function assocRows(assocs: { name: string; departmentId: string; municipalityId: string; members: number }[], names: Names = { deptName, muniName }) {
  return assocs.map((a) => ({
    Asociación: a.name,
    Departamento: names.deptName(a.departmentId),
    Municipio: names.muniName(a.municipalityId),
    Miembros: a.members,
  }));
}

export function territorySheets(catalog: TerritoryCatalog, stats: TerritoryStats | null, hidden: string[] = []): Sheet[] {
  const departments = new Map(catalog.departments.map((d) => [d.id, d.name]));
  const byDept = new Map(stats?.by_dept.map((d) => [d.id, d.value]) ?? []);
  const byMuni = new Map(stats?.by_muni.map((m) => [m.id, m.value]) ?? []);
  const counts = new Map<string, number>();
  for (const m of catalog.municipalities) counts.set(m.departmentId, (counts.get(m.departmentId) ?? 0) + 1);
  const departmentRows = [...catalog.departments].sort((a, b) => a.id.localeCompare(b.id)).map((d) => ({
    Código: d.id, Nombre: d.name, "Visible en formulario": hidden.includes(d.id) ? "No" : "Sí",
    "Municipios y pueblos": counts.get(d.id) ?? 0,
    ...(stats ? { Registrados: byDept.get(d.id) ?? 0 } : {}),
  }));
  const municipalityRows = [...catalog.municipalities].sort((a, b) => a.id.localeCompare(b.id)).map((m) => ({
    Código: m.id, Nombre: m.name, Departamento: departments.get(m.departmentId) ?? m.departmentId,
    Tipo: m.id.length === 8 ? "Pueblo" : "Municipio",
    ...(stats ? { Registrados: byMuni.get(m.id) ?? 0 } : {}),
  }));
  const sheets: Sheet[] = [];
  if (stats) {
    sheets.push({ name: "Registrados por departamento", rows: departmentRows.map((d) => ({
      Departamento: d.Nombre, Código: d.Código, "Municipios y pueblos": d["Municipios y pueblos"], Registrados: d.Registrados ?? 0,
    })).sort((a, b) => b.Registrados - a.Registrados || a.Departamento.localeCompare(b.Departamento, "es")) });
    sheets.push({ name: "Registrados por municipio", rows: municipalityRows.map((m) => ({
      Municipio: m.Nombre, Código: m.Código, Departamento: m.Departamento, Tipo: m.Tipo, Registrados: m.Registrados ?? 0,
    })).sort((a, b) => b.Registrados - a.Registrados || a.Municipio.localeCompare(b.Municipio, "es") || a.Código.localeCompare(b.Código)) });
  }
  return [...sheets, { name: "Departamentos", rows: departmentRows }, { name: "Municipios y pueblos", rows: municipalityRows }];
}
