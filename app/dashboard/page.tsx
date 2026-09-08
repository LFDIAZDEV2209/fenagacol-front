import { Card, PageHeader } from "@/components/ui";
import { BarsByDept, DonutByRole } from "@/components/dashboard-charts";
import { KPI, PEOPLE, deptName, muniName, assocName } from "@/lib/mock-data";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Bird,
  Handshake,
  MapPin,
  Download,
  Eye,
  ArrowRight,
  CalendarDays,
  Sparkles,
} from "lucide-react";

const KPIS = [
  { label: "Total registrados", value: KPI.total, sub: "Personas en el gremio", icon: Users },
  { label: "Galleros", value: KPI.galleros, sub: "42% del total", icon: Bird },
  { label: "Asociados", value: KPI.asociados, sub: "63% con asociación", icon: Handshake },
  { label: "Municipios", value: KPI.municipios, sub: "Cobertura nacional", icon: MapPin },
];

export default function DashboardHome() {
  const recent = PEOPLE.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard size={22} />}
        title="Resumen del gremio"
        subtitle="Conoce el estado actual de nuestros registros."
        actions={
          <>
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/12 border border-white/20 px-3 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              Actualizado hoy
            </span>
            <Link
              href="/dashboard/reportes"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6b1220] transition-all duration-200 hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            >
              <Download size={15} />
              Exportar reporte
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k, i) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className={`animate-fade-up stagger-${i + 1} group p-5 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(107,18,32,0.12)]`}>
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9a8d78]">{k.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fdf6e8] border border-[#ece2d1] text-[#6b1220] transition-transform duration-200 group-hover:scale-110">
                  <Icon size={17} />
                </span>
              </div>
              <p className="mt-2 font-display text-[30px] font-bold leading-none text-[#1c1a17]">{k.value.toLocaleString("es-CO")}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#7a6e5a]">
                <Sparkles size={12} className="text-[#b4532a]" />
                {k.sub}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="animate-fade-up stagger-2 p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="flex items-center gap-2 font-semibold text-[#1c1a17]">
              <MapPin size={17} className="text-[#6b1220]" />
              Registros por departamento
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#fdf8ef] border border-[#ece2d1] text-[#7a6e5a] font-medium">Top 10</span>
          </div>
          <BarsByDept />
        </Card>
        <Card className="animate-fade-up stagger-3 p-6 lg:col-span-2">
          <h3 className="mb-5 flex items-center gap-2 font-semibold text-[#1c1a17]">
            <Users size={17} className="text-[#6b1220]" />
            Distribución por rol
          </h3>
          <DonutByRole />
        </Card>
      </div>

      <Card className="animate-fade-up stagger-4 overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h3 className="flex items-center gap-2 font-semibold text-[#1c1a17]">
            <CalendarDays size={17} className="text-[#6b1220]" />
            Registros recientes
          </h3>
          <Link href="/dashboard/registrados" className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#6b1220] transition-transform hover:translate-x-0.5">
            Ver todos
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[#fdf8ef] border-y border-[#ece2d1] text-xs tracking-widest uppercase text-[#9a8d78]">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Nombre</th>
                <th className="text-left font-semibold px-3 py-3">Departamento</th>
                <th className="text-left font-semibold px-3 py-3">Municipio</th>
                <th className="text-left font-semibold px-3 py-3">Rol</th>
                <th className="text-left font-semibold px-3 py-3">Asociación</th>
                <th className="text-left font-semibold px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8d5]">
              {recent.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-[#fdf6e8]/70">
                  <td className="px-5 py-3 font-medium text-[#1c1a17]">{p.fullName}</td>
                  <td className="px-3 py-3 text-[#4a3f35]">{deptName(p.departmentId)}</td>
                  <td className="px-3 py-3 text-[#4a3f35]">{muniName(p.municipalityId)}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0e8d5] border border-[#e8ddd0] text-xs font-semibold text-[#6b1220]">
                      <Bird size={11} />
                      {p.roles[0]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[#7a6e5a] max-w-[180px] truncate">{assocName(p.associationId)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2 text-[#7a6e5a]">
                      {p.createdAt}
                      <Eye size={13} className="opacity-0 transition-opacity" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
