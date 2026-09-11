"use client";
import * as React from "react";
import { Users, Search, Filter, Eye, ChevronLeft, ChevronRight, Bird, Inbox, AlertTriangle, RotateCw } from "lucide-react";
import { Card, Input, PageHeader, ExportButton, SortTh } from "@/components/ui";
import { FiltersBar } from "@/components/filters-bar";
import { PersonDetail } from "@/components/person-detail";
import { useConfig } from "@/lib/config-store";
import { emptyFilters, type Filters } from "@/lib/filters";
import { deptName, muniName, type Person } from "@/lib/mock-data";
import { resolveAssocName } from "@/lib/config-store";
import { downloadExcel, personRows } from "@/lib/export-excel";
import { fetchExportRows, useDebouncedValue, usePeopleQuery } from "@/lib/server-data";
import { useToast } from "@/components/toast";
import { fmtDate, fmtNum } from "@/lib/format";

const PAGE_SIZE = 10;

type SortKey = "name" | "identity" | "phone" | "dept" | "muni" | "assoc" | "date";

export default function RegistradosPage() {
  const { activeRoles, cfg } = useConfig();
  const { push } = useToast();
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "date", dir: "desc" });
  const [selected, setSelected] = React.useState<Person | null>(null);

  // Búsqueda con debounce; el resto de filtros dispara de inmediato (con abort).
  const debouncedQ = useDebouncedValue(filters.q);
  const serverFilters = React.useMemo(() => ({ ...filters, q: debouncedQ }), [filters, debouncedQ]);
  const { data, total, loading, error, reload } = usePeopleQuery({
    filters: serverFilters,
    page,
    pageSize: PAGE_SIZE,
    sortKey: sort.key,
    sortDir: sort.dir,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function updateFilters(f: Filters) {
    setFilters(f);
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "date" ? "desc" : "asc" }));
    setPage(1);
  }

  async function exportFiltered() {
    const rows = await fetchExportRows(serverFilters);
    await downloadExcel("registros", [{ name: "Registros", rows: personRows(rows, cfg.assocs) }]);
    push(`Excel descargado con ${fmtNum(rows.length)} registros`);
  }

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
            {loading && total === 0 ? "Buscando..." : `${fmtNum(total)} ${total === 1 ? "persona encontrada" : "personas encontradas"}`}
          </p>
          <p className="hidden text-[11px] text-[#A8A29E] sm:block">Toca el encabezado para ordenar · paginado en servidor</p>
        </div>
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[#F1EFEA]" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-500">
              <AlertTriangle size={20} />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-[#1C1917]">No se pudieron cargar los registros</p>
            <p className="mt-1 text-[13px] text-[#78716C]">{error}</p>
            <button onClick={reload} className="mt-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#732427] px-4 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px">
              <RotateCw size={14} />
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[880px] text-[13px]">
              <thead>
                <tr className="bg-[#732427] text-left text-[11px] uppercase tracking-wider text-white/90">
                  <SortTh label="Nombre" className="px-4 py-2.5" active={sort.key === "name"} dir={sort.dir} onToggle={() => toggleSort("name")} />
                  <SortTh label="Identidad" active={sort.key === "identity"} dir={sort.dir} onToggle={() => toggleSort("identity")} />
                  <SortTh label="Teléfono" active={sort.key === "phone"} dir={sort.dir} onToggle={() => toggleSort("phone")} />
                  <SortTh label="Departamento" active={sort.key === "dept"} dir={sort.dir} onToggle={() => toggleSort("dept")} />
                  <SortTh label="Municipio" active={sort.key === "muni"} dir={sort.dir} onToggle={() => toggleSort("muni")} />
                  <th className="px-3 py-2.5 font-semibold" title="Una persona puede tener varios roles: sin orden definido">Rol</th>
                  <SortTh label="Asociación" active={sort.key === "assoc"} dir={sort.dir} onToggle={() => toggleSort("assoc")} />
                  <SortTh label="Fecha" active={sort.key === "date"} dir={sort.dir} onToggle={() => toggleSort("date")} />
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F2]">
                {data.length === 0 ? (
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
                  data.map((p) => (
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
                      <td className="max-w-[150px] truncate px-3 py-2.5 text-[#78716C]" title={resolveAssocName(p.associationId, cfg.assocs)}>{resolveAssocName(p.associationId, cfg.assocs)}</td>
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
          <p className="text-xs text-[#78716C]">Página {Math.min(page, totalPages)} de {totalPages} · {fmtNum(total)} registros</p>
          <div className="flex gap-2">
            <button disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-[#E7E2D9] bg-white px-3.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-sm disabled:opacity-40 disabled:hover:translate-y-0">
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button disabled={page === totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-[#732427] px-3.5 text-[13px] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#481418] hover:shadow-md disabled:opacity-40 disabled:hover:translate-y-0">
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
