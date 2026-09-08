"use client";
import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Bird,
  Handshake,
  MapPin,
  ArrowRight,
  CalendarDays,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, PageHeader, ExportButton } from "@/components/ui";
import { Donut, HBarList, TrendChart } from "@/components/dashboard-charts";
import { FiltersBar } from "@/components/filters-bar";
import { useConfig } from "@/lib/config-store";
import { applyFilters, emptyFilters, summarize, type Filters } from "@/lib/filters";
import { deptName, muniName, assocName } from "@/lib/mock-data";
import { downloadExcel, personRows } from "@/lib/export-excel";
import { useToast } from "@/components/toast";
import { fmtNum, fmtPct } from "@/lib/format";

export default function DashboardHome() {
  const { allPeople, activeRoles, ready } = useConfig();
  const { push } = useToast();
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);

  const filtered = React.useMemo(() => applyFilters(allPeople, filters), [allPeople, filters]);
  const sum = React.useMemo(
    () => summarize(filtered, activeRoles.map((r) => r.label)),
    [filtered, activeRoles]
  );
  const recent = filtered.slice(0, 6);

  function exportAll() {
    downloadExcel("resumen_registros", [
      { name: "Registros filtrados", rows: personRows(filtered) },
      {
        name: "Por departamento",
        rows: sum.byDept.map((d) => ({ Departamento: d.name, Registros: d.value })),
      },
      {
        name: "Por rol",
        rows: sum.byRole.map((r) => ({ Rol: r.label, Registros: r.value, Porcentaje: `${r.pct}%` })),
      },
    ]);
    push(`Excel descargado con ${fmtNum(filtered.length)} registros`);
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-xl bg-[#F1EFEA]" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[#F1EFEA]" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total registrados", value: sum.total, sub: "En la selección actual", icon: Users, hero: true },
    { label: "Galleros", value: sum.galleros, sub: `${fmtPct(sum.galleros, sum.total)} del total`, icon: Bird, hero: false },
    { label: "Asociados", value: sum.asociados, sub: `${fmtPct(sum.asociados, sum.total)} con asociación`, icon: Handshake, hero: false },
    { label: "Municipios", value: sum.municipios, sub: "Con presencia", icon: MapPin, hero: false },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<LayoutDashboard size={20} />}
        title="Resumen del gremio"
        subtitle="Lo que está pasando con los registros, en vivo según tus filtros."
        actions={<ExportButton onExport={exportAll} />}
      />

      <FiltersBar filters={filters} onChange={setFilters} roleOptions={activeRoles.map((r) => r.label)} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          if (k.hero) {
            return (
              <div key={k.label} className={`animate-fade-up stagger-${i + 1} group relative overflow-hidden rounded-xl bg-[#BE123C] p-4 text-white shadow-[0_10px_28px_rgba(190,18,60,0.35)] transition-all duration-200 hover:-translate-y-1`}>
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                <div className="relative flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">{k.label}</p>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 transition-transform duration-200 group-hover:scale-110">
                    <Icon size={15} />
                  </span>
                </div>
                <p className="tnum font-display relative mt-1.5 text-[28px] font-bold leading-none">{fmtNum(k.value)}</p>
                <p className="relative mt-1.5 flex items-center gap-1 text-[11px] text-white/75">
                  <Sparkles size={11} />
                  {k.sub}
                </p>
              </div>
            );
          }
          return (
            <Card key={k.label} className={`animate-fade-up stagger-${i + 1} group border-t-2 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(190,18,60,0.1)] ${i === 1 ? "border-t-[#BE123C]" : i === 2 ? "border-t-[#E11D48]" : "border-t-[#D9A441]"}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A8A29E]">{k.label}</p>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#F3D9E0] bg-[#FFF1F2] text-[#BE123C] transition-transform duration-200 group-hover:scale-110">
                  <Icon size={15} />
                </span>
              </div>
              <p className="tnum font-display mt-1.5 text-[26px] font-bold leading-none text-[#1C1917]">{fmtNum(k.value)}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#78716C]">
                <Sparkles size={11} className="text-[#E11D48]" />
                {k.sub}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="animate-fade-up stagger-2 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
          <TrendingUp size={15} className="text-[#BE123C]" />
          Evolución de registros
          <span className="ml-auto rounded-full border border-[#EDE9E1] bg-[#FAFAF8] px-2.5 py-1 text-[11px] font-medium text-[#78716C]">Últimas 12 semanas</span>
        </h3>
        <div className="mt-3">
          <TrendChart data={sum.trend} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="animate-fade-up stagger-3 p-4 lg:col-span-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <MapPin size={15} className="text-[#BE123C]" />
            Top departamentos
          </h3>
          <div className="mt-3">
            <HBarList items={sum.byDept} />
          </div>
          <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <MapPin size={15} className="text-[#BE123C]" />
            Top municipios
          </h3>
          <div className="mt-3">
            <HBarList items={sum.byMuni.slice(0, 5)} />
          </div>
        </Card>
        <Card className="animate-fade-up stagger-4 flex flex-col p-4 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <Users size={15} className="text-[#BE123C]" />
            Distribución por rol
          </h3>
          <div className="flex flex-1 flex-col justify-center py-2">
            <Donut items={sum.byRole} />
          </div>
        </Card>
      </div>

      <Card className="animate-fade-up stagger-4 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <CalendarDays size={15} className="text-[#BE123C]" />
            Registros recientes
          </h3>
          <Link href="/dashboard/registrados" className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-[#BE123C] transition-transform hover:translate-x-0.5">
            Ver todos
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="border-y border-[#F1EFEA] bg-[#FAFAF8] text-left text-[11px] uppercase tracking-wider text-[#A8A29E]">
                <th className="px-4 py-2.5 font-semibold">Nombre</th>
                <th className="px-3 py-2.5 font-semibold">Departamento</th>
                <th className="px-3 py-2.5 font-semibold">Municipio</th>
                <th className="px-3 py-2.5 font-semibold">Rol</th>
                <th className="px-3 py-2.5 font-semibold">Asociación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F2]">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#A8A29E]">Sin registros con esos filtros</td>
                </tr>
              ) : (
                recent.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#FFF7F9]">
                    <td className="px-4 py-2.5 font-medium text-[#1C1917]">{p.fullName}</td>
                    <td className="px-3 py-2.5 text-[#44403C]">{deptName(p.departmentId)}</td>
                    <td className="px-3 py-2.5 text-[#44403C]">{muniName(p.municipalityId)}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#F3D9E0] bg-[#FFF1F2] px-2 py-0.5 text-[11px] font-semibold text-[#BE123C]">
                        <Bird size={10} />
                        {p.roles[0]}
                      </span>
                    </td>
                    <td className="max-w-[170px] truncate px-3 py-2.5 text-[#78716C]">{assocName(p.associationId)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
