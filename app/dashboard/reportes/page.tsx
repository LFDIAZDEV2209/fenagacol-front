"use client";
import * as React from "react";
import { BarChart3, MapPin, Building2, Users, FileSpreadsheet, AlertTriangle, RotateCw } from "lucide-react";
import { Card, PageHeader, ExportButton } from "@/components/ui";
import { Donut, HBarList, TrendChart } from "@/components/dashboard-charts";
import { FiltersBar } from "@/components/filters-bar";
import { useConfig } from "@/lib/config-store";
import { emptyFilters, type Filters } from "@/lib/filters";
import { downloadExcel, personRows } from "@/lib/export-excel";
import { fetchExportRows, useSummaryQuery } from "@/lib/server-data";
import { useToast } from "@/components/toast";
import { fmtNum } from "@/lib/format";

export default function ReportesPage() {
  const { activeRoles, activeAssocs, ready } = useConfig();
  const { push } = useToast();
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);
  const { summary: s, loading, error, reload } = useSummaryQuery(filters);

  async function exportReport() {
    const rows = await fetchExportRows(filters);
    await downloadExcel("reporte_registros", [
      { name: "Registros", rows: personRows(rows) },
      { name: "Por departamento", rows: (s?.byDept ?? []).map((d) => ({ Departamento: d.name, Registros: d.value })) },
      { name: "Por municipio", rows: (s?.byMuni ?? []).map((m) => ({ Municipio: m.name, Registros: m.value })) },
      { name: "Por rol", rows: (s?.byRole ?? []).map((r) => ({ Rol: r.label, Registros: r.value, Porcentaje: `${r.pct}%` })) },
    ]);
    push(`Reporte descargado con ${fmtNum(rows.length)} registros`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<BarChart3 size={20} />}
        title="Reportes"
        subtitle="Filtra por territorio, fecha, rol y asociación. Todo lo que ves se exporta."
        actions={<ExportButton onExport={exportReport} />}
      />

      <FiltersBar filters={filters} onChange={setFilters} roleOptions={activeRoles.map((r) => r.label)} />

      {!ready || (loading && !s) ? (
        <div className="h-40 animate-pulse rounded-xl bg-[#F1EFEA]" />
      ) : error && !s ? (
        <Card className="flex flex-col items-center px-4 py-14 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-500">
            <AlertTriangle size={20} />
          </span>
          <p className="mt-2.5 text-sm font-semibold text-[#1C1917]">No se pudo cargar el reporte</p>
          <p className="mt-1 text-[13px] text-[#78716C]">{error}</p>
          <button onClick={reload} className="mt-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#732427] px-4 text-[13px] font-semibold text-white">
            <RotateCw size={14} />
            Reintentar
          </button>
        </Card>
      ) : s && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="animate-fade-up stagger-2 p-5 text-center lg:col-span-1">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E]">
                <Users size={12} />
                Total del reporte
              </p>
              <p className="tnum font-display mt-1.5 text-[40px] font-bold leading-none text-[#732427]">{fmtNum(s.total)}</p>
              <div className="mx-auto mt-3 grid max-w-[260px] grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#FAFAF8] p-2">
                  <p className="tnum text-[15px] font-bold text-[#1C1917]">{s.pctGalleros}%</p>
                  <p className="text-[10px] text-[#78716C]">Galleros</p>
                </div>
                <div className="rounded-lg bg-[#FAFAF8] p-2">
                  <p className="tnum text-[15px] font-bold text-[#1C1917]">{s.pctAsociados}%</p>
                  <p className="text-[10px] text-[#78716C]">Asociados</p>
                </div>
                <div className="rounded-lg bg-[#FAFAF8] p-2">
                  <p className="tnum text-[15px] font-bold text-[#1C1917]">{s.municipios}</p>
                  <p className="text-[10px] text-[#78716C]">Mpios.</p>
                </div>
              </div>
            </Card>
            <Card className="animate-fade-up stagger-3 p-4 lg:col-span-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                <MapPin size={14} className="text-[#732427]" />
                Evolución (12 semanas)
              </h3>
              <div className="mt-2">
                <TrendChart data={s.trend} />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="animate-fade-up stagger-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                <MapPin size={14} className="text-[#732427]" />
                Por departamento y municipio
              </h3>
              <div className="mt-3">
                <HBarList items={s.byDept} />
              </div>
              <div className="mt-4 space-y-1.5 border-t border-[#F1EFEA] pt-3">
                {s.byMuni.slice(0, 6).map((m) => (
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
                  <Users size={14} className="text-[#732427]" />
                  Por rol
                </h3>
                <div className="mt-3">
                  <Donut items={s.byRole} />
                </div>
              </Card>
              <Card className="animate-fade-up stagger-4 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                  <Building2 size={14} className="text-[#732427]" />
                  Por asociación
                </h3>
                <div className="mt-3">
                  <HBarList
                    items={s.byAssoc.map((a) => ({
                      name: activeAssocs.find((x) => x.id === a.id)?.name ?? a.id,
                      value: a.value,
                    }))}
                  />
                </div>
              </Card>
            </div>
          </div>

          <Card className="animate-fade-up stagger-4 border-dashed border-[#E8CDD4] bg-[#FAF4F5] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#732427] shadow-sm">
                <FileSpreadsheet size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#1C1917]">Descarga el Excel del reporte</h3>
                <p className="text-[13px] text-[#78716C]">4 hojas: registros, departamentos, municipios y roles — con los filtros aplicados.</p>
              </div>
              <ExportButton onExport={exportReport} label="Exportar reporte" className="h-10 border border-[#E8CDD4]" />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
