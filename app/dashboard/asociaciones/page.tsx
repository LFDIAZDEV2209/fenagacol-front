"use client";
import * as React from "react";
import { Card, Input, PageHeader } from "@/components/ui";
import { ASSOCIATIONS, deptName, muniName } from "@/lib/mock-data";
import { Building2, Search, MapPin, Users, Inbox } from "lucide-react";

export default function AsociacionesPage() {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => ASSOCIATIONS.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<Building2 size={22} />}
        title="Asociaciones"
        subtitle={`Listado gremial por territorio. Total: ${ASSOCIATIONS.length} asociaciones.`}
        actions={
          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#6b1220]">
            <Users size={15} />
            {filtered.length} encontradas
          </span>
        }
      />

      <Card className="animate-fade-up stagger-1 p-4">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8d78]" />
          <Input placeholder="Buscar asociación... (prueba “Guajira” o “Caribe”)" value={q} onChange={(e) => setQ(e.target.value)} className="pl-11" />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((a, i) => (
          <Card key={a.id} className={`animate-fade-up stagger-${(i % 4) + 1} group flex gap-4 p-5 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(107,18,32,0.12)]`}>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#ece2d1] bg-[#fdf6e8] text-[#6b1220] transition-transform duration-200 group-hover:scale-110">
              <Building2 size={19} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1c1a17] leading-tight">{a.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#7a6e5a]">
                <MapPin size={13} className="shrink-0 text-[#b4532a]" />
                {deptName(a.departmentId)} · {muniName(a.municipalityId)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0e8d5] border border-[#e8ddd0] text-xs font-semibold text-[#6b1220]">
                  <Users size={12} />
                  {a.members.toLocaleString("es-CO")} miembros
                </span>
                <span className="text-xs text-[#9a8d78]">ID {a.id}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="animate-pop-in p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#ece2d1] bg-[#fdf8ef] text-[#9a8d78]">
            <Inbox size={22} />
          </div>
          <p className="mt-3 font-semibold text-[#1c1a17]">Sin resultados</p>
          <p className="text-sm text-[#7a6e5a]">Prueba con “Guajira” o “Caribe”.</p>
        </Card>
      )}

      <Card className="animate-fade-up stagger-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#ece2d1] bg-[#fdf8ef]/60 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-[#1c1a17]">
            <Building2 size={16} className="text-[#6b1220]" />
            Tabla de asociaciones
          </h3>
          <span className="rounded-full border border-[#ece2d1] bg-white px-2.5 py-1 text-xs font-medium text-[#7a6e5a]">Total {ASSOCIATIONS.length}</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-[#6b1220] text-xs tracking-widest uppercase text-white/85">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Asociación</th>
                <th className="text-left font-semibold px-3 py-3">Departamento</th>
                <th className="text-left font-semibold px-3 py-3">Municipio</th>
                <th className="text-right font-semibold px-5 py-3">Miembros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8d5]">
              {filtered.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-[#fdf6e8]/70">
                  <td className="px-5 py-3 font-medium text-[#1c1a17]">
                    <span className="inline-flex items-center gap-2">
                      <Building2 size={14} className="text-[#b4532a]" />
                      {a.name}
                    </span>
                  </td>
                  <td className="px-3 py-3">{deptName(a.departmentId)}</td>
                  <td className="px-3 py-3">{muniName(a.municipalityId)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{a.members.toLocaleString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
