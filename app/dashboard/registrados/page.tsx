"use client";
import * as React from "react";
import { Users, Search, Filter, Eye, ChevronLeft, ChevronRight, Bird, Inbox, ArrowUpDown } from "lucide-react";
import { Card, Input, PageHeader, ExportButton } from "@/components/ui";
import { FiltersBar } from "@/components/filters-bar";
import { PersonDetail } from "@/components/person-detail";
import { useConfig } from "@/lib/config-store";
import { applyFilters, emptyFilters, type Filters } from "@/lib/filters";
import { deptName, muniName, assocName, type Person } from "@/lib/mock-data";
import { downloadExcel, personRows } from "@/lib/export-excel";
import { useToast } from "@/components/toast";
import { fmtDate, fmtNum } from "@/lib/format";

type SortKey = "name" | "date";
const PAGE_SIZE = 10;

export default function RegistradosPage() {
  const { allPeople, activeRoles, ready } = useConfig();
  const { push } = useToast();
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [selected, setSelected] = React.useState<Person | null>(null);

  const filtered = React.useMemo(() => {
    const f = applyFilters(allPeople, filters);
    const dir = sort.dir;
    return [...f].sort((a, b) =>
      sort.key === "name" ? a.fullName.localeCompare(b.fullName, "es") * dir : (a.createdAt < b.createdAt ? -1 : 1) * dir
    );
  }, [allPeople, filters, sort]);

  // Al cambiar filtros se vuelve a la página 1 (vía updateFilters, sin effects).
  function updateFilters(f: Filters) {
    setFilters(f);
    setPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "name" ? 1 : -1 }));
  }

  function exportFiltered() {
    downloadExcel("registros", [{ name: "Registros", rows: personRows(filtered) }]);
    push(`Excel descargado con ${fmtNum(filtered.length)} registros`);
  }

  const sortIcon = (key: SortKey) => (
    <ArrowUpDown size={12} className={sort.key === key ? "text-[#732427]" : "text-[#D6D3D1]"} />
  );

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<Users size={20} />}
        title="Personas registradas"
        subtitle="Busca, filtra, ordena y exporta el padrón del gremio."
        actions={<ExportButton onExport={exportFiltered} />}
      />

      <Card className="animate-fade-up stagger-1 p-3.5">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
          <Input
            compact
            placeholder="Buscar por nombre, identidad o teléfono..."
            value={filters.q}
            onChange={(e) => updateFilters({ ...filters, q: e.target.value })}
            className="bg-[#FAFAF8] pl-9"
          />
        </div>
      </Card>

      <FiltersBar filters={filters} onChange={updateFilters} roleOptions={activeRoles.map((r) => r.label)} />

      <Card className="animate-fade-up stagger-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#F1EFEA] px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1C1917]">
            <Filter size={13} className="text-[#732427]" />
            {fmtNum(filtered.length)} {filtered.length === 1 ? "persona encontrada" : "personas encontradas"}
          </p>
          <p className="hidden text-[11px] text-[#A8A29E] sm:block">Toca el encabezado para ordenar</p>
        </div>
        {!ready ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[#F1EFEA]" />
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[880px] text-[13px]">
              <thead>
                <tr className="bg-[#732427] text-left text-[11px] uppercase tracking-wider text-white/90">
                  <th className="px-4 py-2.5 font-semibold">
                    <button onClick={() => toggleSort("name")} className="inline-flex cursor-pointer items-center gap-1.5 hover:text-white">
                      Nombre {sortIcon("name")}
                    </button>
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Identidad</th>
                  <th className="px-3 py-2.5 font-semibold">Teléfono</th>
                  <th className="px-3 py-2.5 font-semibold">Departamento</th>
                  <th className="px-3 py-2.5 font-semibold">Municipio</th>
                  <th className="px-3 py-2.5 font-semibold">Rol</th>
                  <th className="px-3 py-2.5 font-semibold">Asociación</th>
                  <th className="px-3 py-2.5 font-semibold">
                    <button onClick={() => toggleSort("date")} className="inline-flex cursor-pointer items-center gap-1.5 hover:text-white">
                      Fecha {sortIcon("date")}
                    </button>
                  </th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F2]">
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center">
                      <div className="animate-fade-up mx-auto max-w-[320px]">
                        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-[#EDE9E1] bg-[#FAFAF8] text-[#A8A29E]">
                          <Inbox size={20} />
                        </div>
                        <p className="mt-2.5 text-sm font-semibold text-[#1C1917]">Sin resultados</p>
                        <p className="mt-1 text-[13px] text-[#78716C]">Ajusta los filtros o busca otro término.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-[#FAF4F5]">
                      <td className="px-4 py-2.5 font-medium text-[#1C1917]">{p.fullName}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[#44403C]">{p.identity}</td>
                      <td className="px-3 py-2.5 text-[#44403C]">{p.phone}</td>
                      <td className="px-3 py-2.5 text-[#44403C]">{deptName(p.departmentId)}</td>
                      <td className="px-3 py-2.5 text-[#44403C]">{muniName(p.municipalityId)}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#E8CDD4] bg-[#F8EDEF] px-2 py-0.5 text-[11px] font-semibold text-[#732427]">
                          <Bird size={10} />
                          {p.roles[0]}
                          {p.roles.length > 1 ? ` +${p.roles.length - 1}` : ""}
                        </span>
                      </td>
                      <td className="max-w-[150px] truncate px-3 py-2.5 text-[#78716C]">{assocName(p.associationId)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#78716C]">{fmtDate(p.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => setSelected(p)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E7E2D9] bg-white px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-px hover:border-[#732427]/40 hover:text-[#732427] hover:shadow-sm active:translate-y-0"
                        >
                          <Eye size={13} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#F1EFEA] bg-[#FAFAF8]/60 p-3">
          <p className="text-xs text-[#78716C]">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-[#E7E2D9] bg-white px-3.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-sm disabled:opacity-40 disabled:hover:translate-y-0">
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-[#732427] px-3.5 text-[13px] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#481418] hover:shadow-md disabled:opacity-40 disabled:hover:translate-y-0">
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      <PersonDetail person={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
