"use client";
import * as React from "react";
import { CalendarDays, Filter, Eraser, X } from "lucide-react";
import { Card, Combobox } from "./ui";
import { DEPARTMENTS, MUNICIPALITIES, getMunicipalitiesByDept } from "@/lib/mock-data";
import { useConfig } from "@/lib/config-store";
import { activeFilterCount, type Filters } from "@/lib/filters";

// Barra de filtros reutilizable: afecta KPIs + gráficas + tablas a la vez.
// Alto contraste: tarjeta blanca con borde definido sobre fondo gris.
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

  const deptLabel = DEPARTMENTS.find((d) => d.id === filters.departmentId)?.name;
  const muniLabel = MUNICIPALITIES.find((m) => m.id === filters.municipalityId)?.name;
  const assocLabel = activeAssocs.find((a) => a.id === filters.associationId)?.name;

  const chips: { key: string; tag: string; value: string; clear: () => void }[] = [
    ...(filters.from ? [{ key: "from", tag: "Desde", value: filters.from, clear: () => set({ from: "" }) }] : []),
    ...(filters.to ? [{ key: "to", tag: "Hasta", value: filters.to, clear: () => set({ to: "" }) }] : []),
    ...(deptLabel ? [{ key: "dept", tag: "Depto.", value: deptLabel, clear: () => set({ departmentId: "", municipalityId: "" }) }] : []),
    ...(muniLabel ? [{ key: "muni", tag: "Mpio.", value: muniLabel, clear: () => set({ municipalityId: "" }) }] : []),
    ...(filters.role ? [{ key: "role", tag: "Rol", value: filters.role, clear: () => set({ role: "" }) }] : []),
    ...(assocLabel ? [{ key: "assoc", tag: "Asoc.", value: assocLabel, clear: () => set({ associationId: "" }) }] : []),
  ];

  const dateCls =
    "h-10 w-full rounded-lg border border-[#D9D2C2] bg-white pl-9 pr-2.5 text-[13px] font-medium text-[#1C1917] outline-none transition-all focus:border-[#BE123C] focus:ring-4 focus:ring-[#BE123C]/15 hover:border-[#BE123C]/50 cursor-pointer [color-scheme:light]";

  return (
    <Card className="animate-fade-up stagger-1 relative z-30 border-[#E0DACA] bg-white p-3.5 shadow-[0_1px_3px_rgba(28,25,23,0.07)]">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#57534E]">
          <Filter size={13} className="text-[#BE123C]" />
          Filtros
          {count > 0 ? (
            <span className="rounded-full bg-[#BE123C] px-2 py-0.5 text-[10px] font-bold text-white">{count} activos</span>
          ) : (
            <span className="font-medium normal-case tracking-normal text-[#A8A29E]">— sin aplicar</span>
          )}
        </p>
        {count > 0 && (
          <button
            onClick={() => onChange({ q: "", from: "", to: "", departmentId: "", municipalityId: "", role: "", associationId: "" })}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E7E2D9] bg-[#FAFAF8] px-3 py-1.5 text-xs font-semibold text-[#57534E] transition-all duration-200 hover:-translate-y-px hover:border-[#BE123C]/40 hover:text-[#BE123C] hover:shadow-sm"
          >
            <Eraser size={13} />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-6">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-[#292524]">Desde</span>
          <span className="relative block">
            <CalendarDays size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input type="date" lang="es-CO" value={filters.from} max={filters.to || undefined} onChange={(e) => set({ from: e.target.value })} className={dateCls} />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-[#292524]">Hasta</span>
          <span className="relative block">
            <CalendarDays size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input type="date" lang="es-CO" value={filters.to} min={filters.from || undefined} onChange={(e) => set({ to: e.target.value })} className={dateCls} />
          </span>
        </label>
        <div className="[&>div>button]:h-10 [&>div>button]:border-[#D9D2C2] [&>div>button]:text-[13px] [&>div>button]:font-medium [&_label]:text-[#292524]">
          <Combobox
            label="Departamento"
            placeholder="Todos"
            options={[{ value: "", label: "Todos" }, ...deptos.map((d) => ({ value: d.id, label: d.name }))]}
            value={filters.departmentId}
            onChange={(v) => set({ departmentId: v, municipalityId: "" })}
          />
        </div>
        <div className="[&>div>button]:h-10 [&>div>button]:border-[#D9D2C2] [&>div>button]:text-[13px] [&>div>button]:font-medium [&_label]:text-[#292524]">
          <Combobox
            label="Municipio"
            placeholder={filters.departmentId ? "Todos" : "Elige depto."}
            options={[{ value: "", label: "Todos" }, ...munis.map((m) => ({ value: m.id, label: m.name }))]}
            value={filters.municipalityId}
            onChange={(v) => set({ municipalityId: v })}
            disabled={!filters.departmentId}
          />
        </div>
        <div className="[&>div>button]:h-10 [&>div>button]:border-[#D9D2C2] [&>div>button]:text-[13px] [&>div>button]:font-medium [&_label]:text-[#292524]">
          <Combobox
            label="Rol"
            placeholder="Todos"
            options={[{ value: "", label: "Todos" }, ...roleOptions.map((r) => ({ value: r, label: r }))]}
            value={filters.role}
            onChange={(v) => set({ role: v })}
          />
        </div>
        <div className="[&>div>button]:h-10 [&>div>button]:border-[#D9D2C2] [&>div>button]:text-[13px] [&>div>button]:font-medium [&_label]:text-[#292524]">
          <Combobox
            label="Asociación"
            placeholder="Todas"
            options={[{ value: "", label: "Todas" }, ...activeAssocs.map((a) => ({ value: a.id, label: a.name }))]}
            value={filters.associationId}
            onChange={(v) => set({ associationId: v })}
          />
        </div>
      </div>

      {chips.length > 0 && (
        <div className="animate-fade-in mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#F1EFEA] pt-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">Aplicados:</span>
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={c.clear}
              title={`Quitar filtro ${c.tag}`}
              className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#F3D9E0] bg-[#FFF1F2] py-1 pl-2.5 pr-1.5 text-xs font-semibold text-[#9F1239] transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
            >
              <span className="font-normal text-[#BE123C]/70">{c.tag}</span> {c.value}
              <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-[#BE123C]/10 p-0.5 transition-colors group-hover:bg-[#BE123C] group-hover:text-white">
                <X size={10} />
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
