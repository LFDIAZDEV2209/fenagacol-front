"use client";
import * as React from "react";
import { Card, Combobox, Button, PageHeader } from "@/components/ui";
import { ASSOCIATIONS, DEPARTMENTS, PEOPLE, ROLES, deptName, muniName, getMunicipalitiesByDept } from "@/lib/mock-data";
import { DonutByRole } from "@/components/dashboard-charts";
import { BarChart3, Download, Filter, FileSpreadsheet, MapPin, Building2, Users } from "lucide-react";

export default function ReportesPage() {
  const [dept, setDept] = React.useState("");
  const [muni, setMuni] = React.useState("");
  const [rol, setRol] = React.useState("");
  const [assoc, setAssoc] = React.useState("");
  const munis = React.useMemo(() => (dept ? getMunicipalitiesByDept(dept) : []), [dept]);

  const filtered = React.useMemo(
    () => PEOPLE.filter((p) => (!dept || p.departmentId === dept) && (!muni || p.municipalityId === muni) && (!rol || p.roles.includes(rol)) && (!assoc || p.associationId === assoc)),
    [dept, muni, rol, assoc]
  );

  const byDept = React.useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => map.set(deptName(p.departmentId), (map.get(deptName(p.departmentId)) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filtered]);

  const maxDept = Math.max(1, ...byDept.map(([, v]) => v));
  const byMuniMap = React.useMemo(() => {
    const m = new Map<string, number>();
    filtered.forEach((p) => {
      const name = muniName(p.municipalityId);
      m.set(name, (m.get(name) || 0) + 1);
    });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filtered]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<BarChart3 size={22} />}
        title="Reportes"
        subtitle="Filtra por territorio, rol y asociación para generar tu reporte."
        actions={
          <button className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6b1220] transition-all duration-200 hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:scale-[0.98]">
            <Download size={15} />
            Exportar reporte
          </button>
        }
      />

      <Card className="animate-fade-up stagger-1 p-5">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[#9a8d78]">
          <Filter size={13} />
          Filtros del reporte
        </p>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Combobox label="Departamento" placeholder="Todos" options={[{ value: "", label: "Todos" }, ...DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))]} value={dept} onChange={(v) => { setDept(v); setMuni(""); }} />
          <Combobox label="Municipio" placeholder="Todos" options={[{ value: "", label: "Todos" }, ...munis.map((m) => ({ value: m.id, label: m.name }))]} value={muni} onChange={setMuni} disabled={!dept} />
          <Combobox label="Rol" placeholder="Todos" options={[{ value: "", label: "Todos" }, ...ROLES.map((r) => ({ value: r, label: r }))]} value={rol} onChange={setRol} />
          <Combobox label="Asociación" placeholder="Todas" options={[{ value: "", label: "Todas" }, ...ASSOCIATIONS.map((a) => ({ value: a.id, label: a.name }))]} value={assoc} onChange={setAssoc} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="animate-fade-up stagger-2 p-6 text-center lg:col-span-1">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#9a8d78]">
            <Users size={13} />
            Total de registros
          </p>
          <p className="mt-2 font-display text-[46px] font-bold leading-none text-[#6b1220]">{filtered.length.toLocaleString("es-CO")}</p>
          <p className="mt-2 text-xs text-[#7a6e5a]">Según filtros actuales</p>
          <div className="mt-4 rounded-xl border border-[#ece2d1] bg-[#fdf8ef] p-3 text-left text-xs text-[#7a6e5a]">
            {dept && <span className="mb-1 mr-1 inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 font-medium text-[#1c1a17]"><MapPin size={11} />{deptName(dept)}</span>}
            {muni && <span className="mb-1 mr-1 inline-flex rounded-full border bg-white px-2 py-1 font-medium text-[#1c1a17]">{muni}</span>}
            {rol && <span className="mb-1 mr-1 inline-flex rounded-full border bg-white px-2 py-1 font-medium text-[#1c1a17]">{rol}</span>}
            {assoc && <span className="mb-1 mr-1 inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 font-medium text-[#1c1a17]"><Building2 size={11} />{ASSOCIATIONS.find(a => a.id === assoc)?.name}</span>}
            {!dept && !rol && !assoc && "Sin filtros — mostrando todo el país"}
          </div>
        </Card>
        <Card className="animate-fade-up stagger-3 p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-[#1c1a17]">
            <MapPin size={16} className="text-[#6b1220]" />
            Registros por departamento (filtrado)
          </h3>
          <div className="mt-4 space-y-3">
            {byDept.length === 0 ? <p className="py-6 text-center text-sm text-[#9a8d78]">Sin datos con esos filtros</p> : byDept.map(([name, val], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-[112px] truncate text-sm">{name}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#f0e8d5]">
                  <div className="animate-bar h-full rounded-full bg-gradient-to-r from-[#6b1220] to-[#b4532a]" style={{ width: `${(val / maxDept) * 100}%`, animationDelay: `${i * 0.06}s` }} />
                </div>
                <span className="w-10 text-right text-sm font-semibold">{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="animate-fade-up stagger-3 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-[#1c1a17]">
            <MapPin size={16} className="text-[#6b1220]" />
            Registros por municipio
          </h3>
          <div className="mt-4 space-y-2">
            {byMuniMap.map(([name, val]) => (
              <div key={name} className="flex justify-between border-b border-[#f5efe2] py-2 text-sm last:border-0">
                <span className="text-[#4a3f35]">{name}</span>
                <span className="font-semibold text-[#1c1a17]">{val}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="animate-fade-up stagger-4 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-[#1c1a17]">
            <Users size={16} className="text-[#6b1220]" />
            Distribución por rol
          </h3>
          <div className="mt-4">
            <DonutByRole />
          </div>
          <h3 className="mt-8 flex items-center gap-2 font-semibold text-[#1c1a17]">
            <Building2 size={16} className="text-[#6b1220]" />
            Por asociación
          </h3>
          <div className="mt-3 space-y-2">
            {ASSOCIATIONS.slice(0, 6).map((a) => {
              const c = filtered.filter((p) => p.associationId === a.id).length;
              return <div key={a.id} className="flex justify-between text-sm"><span className="truncate pr-3 text-[#4a3f35]">{a.name}</span><span className="shrink-0 font-semibold">{c}</span></div>;
            })}
          </div>
        </Card>
      </div>

      <Card className="animate-fade-up stagger-4 border-dashed bg-[#fdf8ef] p-6">
        <h3 className="flex items-center gap-2 font-semibold text-[#1c1a17]">
          <FileSpreadsheet size={17} className="text-[#6b1220]" />
          ¿Necesitas el Excel?
        </h3>
        <p className="mt-1 text-sm text-[#7a6e5a]">En la versión con Supabase conectado, este botón genera un CSV con los filtros actuales y lo descarga.</p>
        <Button className="mt-4">
          <Download size={15} />
          Exportar reporte
        </Button>
      </Card>
    </div>
  );
}
