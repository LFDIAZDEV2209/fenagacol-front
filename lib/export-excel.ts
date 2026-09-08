// Exportación REAL a Excel con diseño corporativo (ExcelJS):
// header rosa con texto blanco, bandas alternadas, bordes sutiles,
// autofiltros, fila congelada y pestañas rosa. Respeta filtros: el caller
// pasa las filas ya filtradas.
import type { Person } from "./mock-data";
import { deptName, muniName } from "./mock-data";
import { resolveAssocName, type AssocOpt } from "./config-store";
import { dateStamp, fmtDate } from "./format";

export type Sheet = { name: string; rows: Record<string, string | number>[] };

const ROSE = "FF732427";
const ROSE_DARK = "FF481418";
const ROSE_PALE = "FFF8EDEF";
const INK = "FF1C1917";
const WHITE = "FFFFFFFF";
const LINE = "FFD9D2C2";
const THIN = { style: "thin" as const, color: { argb: LINE } };

export async function downloadExcel(baseName: string, sheets: Sheet[]) {
  // Carga diferida: exceljs (~800KB) solo se descarga cuando el usuario exporta,
  // no penaliza el bundle inicial del admin.
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Tu Carné Gremial · Fenagacol";
  wb.created = new Date();

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

export function personRows(people: Person[], assocs: AssocOpt[] = []) {
  return people.map((p) => ({
    Nombre: p.fullName,
    Identidad: p.identity,
    Teléfono: p.phone,
    Correo: p.email ?? "",
    Departamento: deptName(p.departmentId),
    Municipio: muniName(p.municipalityId),
    Roles: p.roles.join(", "),
    Asociación: resolveAssocName(p.associationId, assocs),
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
