"use client";
import { ExportButton } from "./ui";
import { useToast } from "./toast";
import { useConfig } from "@/lib/config-store";
import { useTerritory } from "@/lib/territory-store";
import { fetchTerritoryStats } from "@/lib/server-data";
import { downloadExcel, territorySheets } from "@/lib/export-excel";

export function TerritoryExport() {
  const territory = useTerritory();
  const { cfg } = useConfig();
  const { push } = useToast();
  async function exportTerritory() {
    try {
      const [catalog, stats] = await Promise.allSettled([
        territory.ensureTerritory(),
        fetchTerritoryStats(),
      ]);
      const source =
        catalog.status === "fulfilled"
          ? catalog.value
          : {
              departments: territory.DEPARTMENTS,
              municipalities: territory.MUNICIPALITIES,
            };
      const counts = stats.status === "fulfilled" ? stats.value : null;
      const warnings: string[] = [];
      if (catalog.status === "rejected")
        warnings.push(
          "No se pudo verificar el catálogo completo. Las hojas Departamentos, Municipios y pueblos y sus estadísticas pueden estar incompletas; se exportó la copia disponible.",
        );
      if (!counts)
        warnings.push(
          "No se pudieron obtener las estadísticas: se exportaron solo los catálogos. No se incluyen las hojas Registrados por departamento y Registrados por municipio.",
        );
      const departmentIds = new Set(source.departments.map((d) => d.id));
      const municipalityIds = new Set(source.municipalities.map((m) => m.id));
      if (counts && (counts.by_dept.some((r) => !departmentIds.has(r.id)) || counts.by_muni.some((r) => !municipalityIds.has(r.id))))
        warnings.push(
          "Las hojas de registrados pueden estar incompletas: hay códigos en las estadísticas que no están en el catálogo. Actualiza y vuelve a exportar.",
        );
      await downloadExcel(
        "territorio",
        territorySheets(source, counts, cfg.deptOff),
        warnings.join("\n"),
      );
      push(
        warnings.length
          ? "Excel descargado con aviso. Consulta la hoja Aviso de exportación."
          : "Excel de territorio descargado: cuatro hojas completas, incluidos los territorios sin registrados.",
        warnings.length ? "info" : "success",
      );
    } catch {
      push("No se pudo descargar el Excel de territorio. Reintenta.", "error");
    }
  }
  return (
    <ExportButton
      onExport={exportTerritory}
      hint="Catálogo completo y registrados"
    />
  );
}
