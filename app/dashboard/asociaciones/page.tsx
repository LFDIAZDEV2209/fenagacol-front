"use client";
import * as React from "react";
import { Building2, Search, MapPin, Users, Inbox, Power, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Card, Input, PageHeader, ExportButton, SortTh } from "@/components/ui";
import { useConfig } from "@/lib/config-store";
import { deptName, muniName } from "@/lib/mock-data";
import { emptyFilters } from "@/lib/filters";
import { downloadExcel, assocRows } from "@/lib/export-excel";
import { useSummaryQuery } from "@/lib/server-data";
import { useToast } from "@/components/toast";
import { fmtNum } from "@/lib/format";

export default function AsociacionesPage() {
  const { cfg, ready, toggleAssoc, membersOf } = useConfig();
  const { push } = useToast();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">("all");
  const [sort, setSort] = React.useState<{ key: "name" | "members" | "dept" | "muni"; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  // Miembros reales por asociación (servidor); fallback a conteo local sin red.
  const { summary } = useSummaryQuery(emptyFilters);
  const serverMembers = React.useMemo(
    () => new Map((summary?.byAssoc ?? []).map((a) => [a.id, a.value])),
    [summary]
  );
  const members = React.useCallback((id: string) => serverMembers.get(id) ?? membersOf(id), [serverMembers, membersOf]);

  const filtered = React.useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return cfg.assocs
      .filter((a) => (status === "all" ? true : status === "active" ? a.active : !a.active))
      .filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()))
      .slice()
      .sort((a, b) => {
        if (sort.key === "members") return (members(a.id) - members(b.id)) * dir;
        const av = sort.key === "dept" ? deptName(a.departmentId) : sort.key === "muni" ? muniName(a.municipalityId) : a.name;
        const bv = sort.key === "dept" ? deptName(b.departmentId) : sort.key === "muni" ? muniName(b.municipalityId) : b.name;
        return av.localeCompare(bv, "es", { sensitivity: "base" }) * dir;
      });
  }, [cfg.assocs, q, status, sort, members]);
  const totalMembers = filtered.reduce((a, b) => a + members(b.id), 0);

  function toggleSort(key: typeof sort.key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  const sortOpts: { key: typeof sort.key; label: string }[] = [
    { key: "name", label: "Nombre" },
    { key: "members", label: "Miembros" },
    { key: "dept", label: "Depto" },
    { key: "muni", label: "Mpio" },
  ];
  const statusOpts: { key: typeof status; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "active", label: "Activas" },
    { key: "inactive", label: "Inactivas" },
  ];

  async function exportAll() {
    await downloadExcel("asociaciones", [
      { name: "Asociaciones", rows: assocRows(filtered.map((a) => ({ ...a, members: members(a.id) }))) },
    ]);
    push(`Excel descargado con ${fmtNum(filtered.length)} asociaciones`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<Building2 size={20} />}
        title="Asociaciones"
        subtitle={`${fmtNum(cfg.assocs.length)} asociaciones · ${fmtNum(totalMembers)} miembros en la selección.`}
        actions={<ExportButton onExport={exportAll} />}
      />

      <Card className="animate-fade-up stagger-1 space-y-3 p-3.5">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
          <Input compact placeholder="Buscar asociación... (prueba “Guajira” o “Caribe”)" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full border border-[#E7E2D9] bg-[#FAFAF8] p-1">
            {statusOpts.map((o) => (
              <button
                key={o.key}
                onClick={() => setStatus(o.key)}
                className={`cursor-pointer rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${status === o.key ? "bg-[#732427] text-white shadow-sm" : "text-[#78716C] hover:text-[#1C1917]"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <span className="ml-auto hidden text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E] sm:inline">Ordenar:</span>
          <div className="flex flex-wrap gap-1.5">
            {sortOpts.map((o) => {
              const on = sort.key === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => toggleSort(o.key)}
                  title={`Ordenar por ${o.label.toLowerCase()}`}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors ${on ? "border-[#732427]/40 bg-[#F8EDEF] text-[#732427]" : "border-[#E7E2D9] bg-white text-[#78716C] hover:text-[#1C1917]"}`}
                >
                  {o.label}
                  {on && (sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {!ready ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[#F1EFEA]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((a, i) => (
            <Card key={a.id} className={`animate-fade-up stagger-${(i % 4) + 1} group flex gap-3 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(115,36,39,0.12)] ${!a.active ? "opacity-60" : ""}`}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#E8CDD4] bg-[#F8EDEF] text-[#732427] transition-transform duration-200 group-hover:scale-110">
                <Building2 size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-[#1C1917]">{a.name}</p>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-[#78716C]">
                  <MapPin size={12} className="shrink-0 text-[#A55262]" />
                  {deptName(a.departmentId)} · {muniName(a.municipalityId)}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#E7E2D9] bg-[#F4F4F2] px-2 py-0.5 text-[11px] font-semibold text-[#732427]">
                    <Users size={11} />
                    {fmtNum(members(a.id))} miembros
                  </span>
                  {!a.active && (
                    <span className="rounded-full bg-[#F1EFEA] px-2 py-0.5 text-[11px] font-semibold text-[#78716C]">Inactiva</span>
                  )}
                  <button
                    onClick={() => {
                      toggleAssoc(a.id);
                      push(a.active ? `“${a.name}” desactivada` : `“${a.name}” activada`, "info");
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#E7E2D9] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#44403C] transition-colors hover:border-[#732427]/40 hover:text-[#732427]"
                  >
                    <Power size={11} />
                    {a.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {ready && filtered.length === 0 && (
        <Card className="animate-pop-in p-10 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-[#EDE9E1] bg-[#FAFAF8] text-[#A8A29E]">
            <Inbox size={20} />
          </div>
          <p className="mt-2.5 text-sm font-semibold text-[#1C1917]">Sin resultados</p>
          <p className="mt-1 text-[13px] text-[#78716C]">Prueba con “Guajira” o “Caribe”.</p>
        </Card>
      )}

      <Card className="animate-fade-up stagger-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#F1EFEA] bg-[#FAFAF8]/60 p-3.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <Building2 size={14} className="text-[#732427]" />
            Tabla de asociaciones
          </h3>
          <Link href="/dashboard/configuracion" className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E7E2D9] bg-white px-3 py-1.5 text-xs font-semibold text-[#44403C] transition-all duration-200 hover:-translate-y-px hover:text-[#732427] hover:shadow-sm">
            <Pencil size={12} />
            Gestionar
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[620px] text-[13px]">
            <thead>
              <tr className="bg-[#732427] text-left text-[11px] uppercase tracking-wider text-white/90">
                <SortTh label="Asociación" className="px-4 py-2.5" active={sort.key === "name"} dir={sort.dir} onToggle={() => toggleSort("name")} />
                <SortTh label="Departamento" active={sort.key === "dept"} dir={sort.dir} onToggle={() => toggleSort("dept")} />
                <SortTh label="Municipio" active={sort.key === "muni"} dir={sort.dir} onToggle={() => toggleSort("muni")} />
                <SortTh label="Miembros" className="px-4 py-2.5 text-right" active={sort.key === "members"} dir={sort.dir} onToggle={() => toggleSort("members")} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F2]">
              {filtered.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-[#FAF4F5]">
                  <td className="px-4 py-2.5 font-medium text-[#1C1917]">
                    <span className="inline-flex items-center gap-2">
                      <Building2 size={13} className="shrink-0 text-[#A55262]" />
                      {a.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#44403C]">{deptName(a.departmentId)}</td>
                  <td className="px-3 py-2.5 text-[#44403C]">{muniName(a.municipalityId)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#1C1917]">{fmtNum(members(a.id))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
