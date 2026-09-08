"use client";
import * as React from "react";
import { Card, Combobox, Input, Button, PageHeader } from "@/components/ui";
import { ASSOCIATIONS, DEPARTMENTS, MUNICIPALITIES, PEOPLE, ROLES, deptName, muniName, assocName, getMunicipalitiesByDept } from "@/lib/mock-data";
import { Users, Search, Filter, Download, Eraser, Eye, ChevronLeft, ChevronRight, Bird, Inbox } from "lucide-react";

export default function RegistradosPage() {
  const [q, setQ] = React.useState("");
  const [dept, setDept] = React.useState("");
  const [muni, setMuni] = React.useState("");
  const [rol, setRol] = React.useState("");
  const [assoc, setAssoc] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const munis = React.useMemo(() => (dept ? getMunicipalitiesByDept(dept) : MUNICIPALITIES), [dept]);

  const filtered = React.useMemo(() => {
    return PEOPLE.filter((p) => {
      if (q) {
        const s = q.toLowerCase();
        if (!(`${p.fullName} ${p.identity} ${p.phone}`.toLowerCase().includes(s))) return false;
      }
      if (dept && p.departmentId !== dept) return false;
      if (muni && p.municipalityId !== muni) return false;
      if (rol && !p.roles.includes(rol)) return false;
      if (assoc && p.associationId !== assoc) return false;
      return true;
    });
  }, [q, dept, muni, rol, assoc]);

  React.useEffect(() => setPage(1), [q, dept, muni, rol, assoc]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function clear() {
    setQ(""); setDept(""); setMuni(""); setRol(""); setAssoc("");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<Users size={22} />}
        title="Personas registradas"
        subtitle="Consulta y administra las personas registradas."
        actions={
          <button className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6b1220] transition-all duration-200 hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:scale-[0.98]">
            <Download size={15} />
            Exportar
          </button>
        }
      />

      <Card className="animate-fade-up stagger-1 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8d78]" />
            <Input placeholder="Buscar por nombre, identidad o teléfono..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-[#fdf8ef] pl-11" />
          </div>
          <button onClick={clear} className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e8ddd0] bg-white px-5 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:bg-[#fdf8ef] hover:shadow-sm active:translate-y-0 active:scale-[0.98]">
            <Eraser size={15} />
            Limpiar
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[#9a8d78]">
          <Filter size={13} />
          Filtros
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Combobox label="Departamento" placeholder="Todos" options={[{ value: "", label: "Todos" }, ...DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))]} value={dept} onChange={(v) => { setDept(v); setMuni(""); }} />
          <Combobox label="Municipio" placeholder="Todos" options={[{ value: "", label: "Todos" }, ...munis.map((m) => ({ value: m.id, label: m.name }))]} value={muni} onChange={setMuni} />
          <Combobox label="Rol" placeholder="Todos" options={[{ value: "", label: "Todos" }, ...ROLES.map((r) => ({ value: r, label: r }))]} value={rol} onChange={setRol} />
          <Combobox label="Asociación" placeholder="Todas" options={[{ value: "", label: "Todas" }, ...ASSOCIATIONS.map((a) => ({ value: a.id, label: a.name }))]} value={assoc} onChange={setAssoc} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1c1a17]">
            {filtered.length.toLocaleString("es-CO")} {filtered.length === 1 ? "persona encontrada" : "personas encontradas"}
          </p>
          <p className="hidden sm:block text-xs text-[#9a8d78]">Filtra por La Guajira + Gallero para probar</p>
        </div>
      </Card>

      <Card className="animate-fade-up stagger-2 overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[#6b1220] text-xs tracking-widest uppercase text-white/85">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Nombre</th>
                <th className="text-left font-semibold px-3 py-3">Identidad</th>
                <th className="text-left font-semibold px-3 py-3">Teléfono</th>
                <th className="text-left font-semibold px-3 py-3">Departamento</th>
                <th className="text-left font-semibold px-3 py-3">Municipio</th>
                <th className="text-left font-semibold px-3 py-3">Rol</th>
                <th className="text-left font-semibold px-3 py-3">Asociación</th>
                <th className="text-left font-semibold px-3 py-3">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8d5]">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="mx-auto max-w-[360px] animate-fade-up">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#ece2d1] bg-[#fdf8ef] text-[#9a8d78]">
                        <Inbox size={22} />
                      </div>
                      <p className="mt-3 font-semibold text-[#1c1a17]">Sin resultados</p>
                      <p className="text-sm text-[#7a6e5a] mt-1">Ajusta los filtros o busca otro término.</p>
                      <Button variant="secondary" size="sm" onClick={clear} className="mt-4">Limpiar filtros</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#fdf6e8]/70">
                    <td className="px-4 py-3 font-medium text-[#1c1a17]">{p.fullName}</td>
                    <td className="px-3 py-3 font-mono text-xs text-[#4a3f35]">{p.identity}</td>
                    <td className="px-3 py-3 text-[#4a3f35]">{p.phone}</td>
                    <td className="px-3 py-3">{deptName(p.departmentId)}</td>
                    <td className="px-3 py-3">{muniName(p.municipalityId)}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#f0e8d5] border border-[#e8ddd0] text-xs font-semibold text-[#6b1220]">
                        <Bird size={11} />
                        {p.roles.join(", ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#7a6e5a] max-w-[160px] truncate">{assocName(p.associationId)}</td>
                    <td className="px-3 py-3 text-[#7a6e5a]">{p.createdAt}</td>
                    <td className="px-4 py-3">
                      <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#e8ddd0] bg-white px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-px hover:border-[#6b1220]/40 hover:text-[#6b1220] hover:shadow-sm active:translate-y-0">
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

        <div className="flex items-center justify-between p-4 border-t border-[#ece2d1] bg-[#fdf8ef]/50">
          <p className="text-xs text-[#7a6e5a]">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#e8ddd0] bg-white px-4 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-sm disabled:opacity-40 disabled:hover:translate-y-0">
              <ChevronLeft size={15} />
              Anterior
            </button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#6b1220] px-4 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#7e1730] hover:shadow-md disabled:opacity-40 disabled:hover:translate-y-0">
              Siguiente
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
