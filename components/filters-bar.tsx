"use client";
import * as React from "react";
import { Filter, Eraser } from "lucide-react";
import { Card, Combobox } from "./ui";
import { DEPARTMENTS, getMunicipalitiesByDept } from "@/lib/mock-data";
import { useConfig } from "@/lib/config-store";
import { activeFilterCount, type Filters } from "@/lib/filters";

// Barra de filtros reutilizable: afecta KPIs + gráficas + tablas a la vez.
export function FiltersBar({
  filters,
  onChange,
  showSearch = false,
  roleOptions,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  showSearch?: boolean;
  roleOptions: string[];
}) {
  const { cfg, activeAssocs } = useConfig();
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const deptos = DEPARTMENTS.filter((d) => !cfg.deptOff.includes(d.id));
  const munis = filters.departmentId ? getMunicipalitiesByDept(filters.departmentId) : [];
  const count = activeFilterCount({ ...filters, q: showSearch ? filters.q : "" });

  const inputCls =
    "h-10 w-full rounded-lg border border-[#E7E2D9] bg-white px-3 text-[13px] text-[#1C1917] outline-none transition-colors focus:border-[#BE123C] focus:ring-4 focus:ring-[#BE123C]/10 cursor-pointer";

  return (
    <Card className="animate-fade-up stagger-1 p-3.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E]">
          <Filter size={13} />
          Filtros
          {count > 0 && (
            <span className="rounded-full bg-[#BE123C] px-2 py-0.5 text-[10px] font-bold text-white">{count}</span>
          )}
        </p>
        {count > 0 && (
          <button
            onClick={() => onChange({ q: "", from: "", to: "", departmentId: "", municipalityId: "", role: "", associationId: "" })}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E7E2D9] bg-white px-3 py-1.5 text-xs font-semibold text-[#44403C] transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
          >
            <Eraser size={13} />
            Limpiar ({count})
          </button>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-6">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1C1917]">Desde</span>
          <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => set({ from: e.target.value })} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1C1917]">Hasta</span>
          <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => set({ to: e.target.value })} className={inputCls} />
        </label>
        <div className="[&>div>button]:h-10 [&>div>button]:text-[13px]">
          <Combobox
            label="Departamento"
            placeholder="Todos"
            options={[{ value: "", label: "Todos" }, ...deptos.map((d) => ({ value: d.id, label: d.name }))]}
            value={filters.departmentId}
            onChange={(v) => set({ departmentId: v, municipalityId: "" })}
          />
        </div>
        <div className="[&>div>button]:h-10 [&>div>button]:text-[13px]">
          <Combobox
            label="Municipio"
            placeholder={filters.departmentId ? "Todos" : "Elige depto."}
            options={[{ value: "", label: "Todos" }, ...munis.map((m) => ({ value: m.id, label: m.name }))]}
            value={filters.municipalityId}
            onChange={(v) => set({ municipalityId: v })}
            disabled={!filters.departmentId}
          />
        </div>
        <div className="[&>div>button]:h-10 [&>div>button]:text-[13px]">
          <Combobox
            label="Rol"
            placeholder="Todos"
            options={[{ value: "", label: "Todos" }, ...roleOptions.map((r) => ({ value: r, label: r }))]}
            value={filters.role}
            onChange={(v) => set({ role: v })}
          />
        </div>
        <div className="[&>div>button]:h-10 [&>div>button]:text-[13px]">
          <Combobox
            label="Asociación"
            placeholder="Todas"
            options={[{ value: "", label: "Todas" }, ...activeAssocs.map((a) => ({ value: a.id, label: a.name }))]}
            value={filters.associationId}
            onChange={(v) => set({ associationId: v })}
          />
        </div>
      </div>
    </Card>
  );
}
