"use client";
import * as React from "react";
import { BarChart3, MapPin, Building2, Users, FileSpreadsheet } from "lucide-react";
import { Card, PageHeader, ExportButton } from "@/components/ui";
import { Donut, HBarList, TrendChart } from "@/components/dashboard-charts";
import { FiltersBar } from "@/components/filters-bar";
import { useConfig } from "@/lib/config-store";
import { applyFilters, emptyFilters, summarize, type Filters } from "@/lib/filters";
import { assocName } from "@/lib/mock-data";
import { downloadExcel, personRows } from "@/lib/export-excel";
import { useToast } from "@/components/toast";
import { fmtNum } from "@/lib/format";

export default function ReportesPage() {
  const { allPeople, activeRoles, activeAssocs, ready } = useConfig();
  const { push } = useToast();
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);

  const filtered = React.useMemo(() => applyFilters(allPeople, filters), [allPeople, filters]);
  const sum = React.useMemo(
    () => summarize(filtered, activeRoles.map((r) => r.label)),
    [filtered, activeRoles]
  );

  function exportReport() {
    downloadExcel("reporte_registros", [
      { name: "Registros", rows: personRows(filtered) },
      { name: "Por departamento", rows: sum.byDept.map((d) => ({ Departamento: d.name, Registros: d.value })) },
      { name: "Por municipio", rows: sum.byMuni.map((m) => ({ Municipio: m.name, Registros: m.value })) },
      { name: "Por rol", rows: sum.byRole.map((r) => ({ Rol: r.label, Registros: r.value, Porcentaje: `${r.pct}%` })) },
    ]);
    push(`Reporte descargado con ${fmtNum(filtered.length)} registros`);
  }

  const assocCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of filtered) {
      const name = assocName(p.associationId);
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<BarChart3 size={20} />}
        title="Reportes"
        subtitle="Filtra por territorio, fecha, rol y asociación. Todo lo que ves se exporta."
        actions={<ExportButton onExport={exportReport} />}
      />

      <FiltersBar filters={filters} onChange={setFilters} roleOptions={activeRoles.map((r) => r.label)} />

      {!ready ? (
        <div className="h-40 animate-pulse rounded-xl bg-[#F1EFEA]" />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="animate-fade-up stagger-1 p-5 text-center lg:col-span-1">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E]">
                <Users size={12} />
                Total del reporte
              </p>
              <p className="tnum font-display mt-1.5 text-[40px] font-bold leading-none text-[#BE123C]">{fmtNum(sum.total)}</p>
              <div className="mx-auto mt-3 grid max-w-[260px] grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#FAFAF8] p-2">
                  <p className="tnum text-[15px] font-bold text-[#1C1917]">{sum.pctGalleros}%</p>
                  <p className="text-[10px] text-[#78716C]">Galleros</p>
                </div>
                <div className="rounded-lg bg-[#FAFAF8] p-2">
                  <p className="tnum text-[15px] font-bold text-[#1C1917]">{sum.pctAsociados}%</p>
                  <p className="text-[10px] text-[#78716C]">Asociados</p>
                </div>
                <div className="rounded-lg bg-[#FAFAF8] p-2">
                  <p className="tnum text-[15px] font-bold text-[#1C1917]">{sum.municipios}</p>
                  <p className="text-[10px] text-[#78716C]">Mpios.</p>
                </div>
              </div>
            </Card>
            <Card className="animate-fade-up stagger-2 p-4 lg:col-span-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                <MapPin size={14} className="text-[#BE123C]" />
                Evolución (12 semanas)
              </h3>
              <div className="mt-2">
                <TrendChart data={sum.trend} />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="animate-fade-up stagger-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                <MapPin size={14} className="text-[#BE123C]" />
                Por departamento y municipio
              </h3>
              <div className="mt-3">
                <HBarList items={sum.byDept} />
              </div>
              <div className="mt-4 space-y-1.5 border-t border-[#F1EFEA] pt-3">
                {sum.byMuni.slice(0, 6).map((m) => (
                  <div key={m.name} className="flex justify-between text-[13px]">
                    <span className="text-[#44403C]">{m.name}</span>
                    <span className="tnum font-semibold text-[#1C1917]">{fmtNum(m.value)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="space-y-4">
              <Card className="animate-fade-up stagger-3 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                  <Users size={14} className="text-[#BE123C]" />
                  Por rol
                </h3>
                <div className="mt-3">
                  <Donut items={sum.byRole} />
                </div>
              </Card>
              <Card className="animate-fade-up stagger-4 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                  <Building2 size={14} className="text-[#BE123C]" />
                  Por asociación
                </h3>
                <div className="mt-3">
                  <HBarList items={assocCounts} />
                </div>
                {activeAssocs.length === 0 && (
                  <p className="mt-2 text-xs text-[#A8A29E]">No hay asociaciones activas en configuración.</p>
                )}
              </Card>
            </div>
          </div>

          <Card className="animate-fade-up stagger-4 border-dashed border-[#F3D9E0] bg-[#FFF7F9] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#BE123C] shadow-sm">
                <FileSpreadsheet size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#1C1917]">Descarga el Excel del reporte</h3>
                <p className="text-[13px] text-[#78716C]">4 hojas: registros, departamentos, municipios y roles — con los filtros aplicados.</p>
              </div>
              <ExportButton onExport={exportReport} label="Exportar reporte" className="h-10 border border-[#F3D9E0]" />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
