"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  LogOut,
  Menu,
  X,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/registrados", label: "Registrados", icon: Users },
  { href: "/dashboard/asociaciones", label: "Asociaciones", icon: Building2 },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Resumen",
  "/dashboard/registrados": "Registrados",
  "/dashboard/asociaciones": "Asociaciones",
  "/dashboard/reportes": "Reportes",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const v = localStorage.getItem("fenagacol_admin");
    if (!v) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready)
    return (
      <div className="min-h-screen bg-[#f8f3e8] grid place-items-center">
        <div className="flex items-center gap-3 text-sm text-[#7a6e5a]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#6b1220]/20 border-t-[#6b1220]" />
          Cargando panel...
        </div>
      </div>
    );

  const current = TITLES[pathname] ?? "Panel";

  return (
    <div className="min-h-screen bg-[#f5efe2] flex">
      {/* sidebar desktop */}
      <aside className="hidden lg:flex w-[264px] shrink-0 bg-[#0f0a0c] text-[#f5efe2] flex-col sticky top-0 h-screen">
        <div className="h-[68px] px-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#6b1220] border border-white/15 grid place-items-center font-black text-xs text-white shadow-[0_4px_14px_rgba(107,18,32,0.5)]">TG</div>
          <div>
            <p className="font-display font-bold text-[15px] leading-none">Tu Carné Gremial</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/50">Admin · Fenagacol</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/40">Gestión</p>
          {NAV.map((n) => {
            const active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:-translate-y-px ${active ? "bg-[#6b1220] text-white shadow-[0_6px_18px_rgba(107,18,32,0.45)]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${active ? "bg-white/15" : "bg-white/10 group-hover:bg-white/15"}`}>
                  <Icon size={16} strokeWidth={2.2} />
                </span>
                {n.label}
                {active && <ChevronRight size={15} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
          <p className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/40">Accesos</p>
          <Link
            href="/registro"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 cursor-pointer transition-all duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-white"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 group-hover:bg-white/15">
              <ClipboardList size={16} strokeWidth={2.2} />
            </span>
            Ver formulario público
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
            <img src="https://i.pravatar.cc/100?img=15" alt="Administrador" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#6b1220]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none">Administrador</p>
              <p className="mt-1 text-xs opacity-60 truncate">admin@fenagacol.co</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("fenagacol_admin");
              router.push("/login");
            }}
            className="mt-3 flex w-full h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:bg-[#6b1220] active:translate-y-0 active:scale-[0.98]"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* top bar desktop con color principal */}
        <header className="hidden lg:block sticky top-0 z-30 bg-[#6b1220] text-[#fff7e8] shadow-[0_4px_20px_rgba(107,18,32,0.3)]">
          <div className="flex h-[68px] items-center gap-4 px-8">
            <div className="flex items-center gap-2 text-[13px] text-white/70">
              <span>Panel</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-white">{current}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 border border-white/20 px-3 py-1.5 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                Datos actualizados hoy
              </span>
              <Link
                href="/registro"
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6b1220] transition-all duration-200 hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
              >
                <ClipboardList size={15} />
                Ver registro
              </Link>
            </div>
          </div>
        </header>

        {/* top bar mobile */}
        <header className="lg:hidden h-[56px] bg-[#6b1220] text-[#fff7e8] flex items-center justify-between px-4 sticky top-0 z-30 shadow-[0_4px_16px_rgba(107,18,32,0.3)]">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen((v) => !v)} aria-label="Abrir menú" className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-white/12 border border-white/20 transition-transform active:scale-95">
              <Menu size={18} />
            </button>
            <div className="leading-tight">
              <span className="block font-display text-[15px] font-bold">Tu Carné Gremial</span>
              <span className="block text-[11px] text-white/70">{current}</span>
            </div>
          </div>
          <Link href="/registro" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#6b1220]">
            <ClipboardList size={13} />
            Registro
          </Link>
        </header>

        {/* drawer */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40 animate-fade-in">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[288px] bg-[#0f0a0c] text-[#f5efe2] p-4 animate-fade-up overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#6b1220] text-xs font-black text-white">TG</div>
                  <span className="font-display font-bold">Navegación</span>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/10 transition-transform active:scale-95">
                  <X size={16} />
                </button>
              </div>
              <nav className="space-y-2">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium cursor-pointer transition-colors ${pathname === n.href ? "bg-[#6b1220] text-white" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
                    >
                      <Icon size={17} />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={() => {
                  localStorage.removeItem("fenagacol_admin");
                  router.push("/login");
                }}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-medium"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
