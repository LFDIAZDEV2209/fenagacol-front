"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Share2,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";

const NAV = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/registrados", label: "Registrados", icon: Users },
  { href: "/dashboard/asociaciones", label: "Asociaciones", icon: Building2 },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/dashboard/compartir", label: "Compartir", icon: Share2 },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Resumen",
  "/dashboard/registrados": "Registrados",
  "/dashboard/asociaciones": "Asociaciones",
  "/dashboard/reportes": "Reportes",
  "/dashboard/compartir": "Compartir formulario",
  "/dashboard/configuracion": "Configuración",
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  async function signOut() {
    await logout();
    push("Sesión cerrada correctamente", "info");
    router.replace("/login");
  }

  if (loading || !user)
    return (
      <div className="grid min-h-screen place-items-center bg-[#FAFAF8]">
        <div className="flex items-center gap-2.5 text-[13px] text-[#78716C]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#BE123C]/20 border-t-[#BE123C]" />
          Cargando panel...
        </div>
      </div>
    );

  const current = TITLES[pathname] ?? "Panel";

  return (
    <div className="flex min-h-screen bg-[#F4F4F2]">
      {/* sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-[#14090D] text-[#F5F3F0] lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#BE123C] text-[11px] font-black text-white shadow-[0_4px_14px_rgba(190,18,60,0.5)]">TG</div>
          <div>
            <p className="font-display text-[14px] font-bold leading-none">Tu Carné Gremial</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Admin · Fenagacol</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Gestión</p>
          {NAV.map((n) => {
            const active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 hover:-translate-y-px ${active ? "bg-[#BE123C] text-white shadow-[0_6px_18px_rgba(190,18,60,0.45)]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${active ? "bg-white/15" : "bg-white/10 group-hover:bg-white/15"}`}>
                  <Icon size={15} strokeWidth={2.2} />
                </span>
                {n.label}
                {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
          <p className="px-2.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Accesos</p>
          <Link
            href="/registro"
            className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/70 transition-all duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-white"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 group-hover:bg-white/15">
              <ClipboardList size={15} strokeWidth={2.2} />
            </span>
            Formulario público
          </Link>
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 p-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#BE123C] text-xs font-bold text-white">
              {(user.email[0] ?? "A").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-none">Administrador</p>
              <p className="mt-1 truncate text-[11px] opacity-60">{user.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-2.5 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/10 text-[13px] font-medium transition-all duration-200 hover:-translate-y-px hover:bg-[#BE123C] active:translate-y-0 active:scale-[0.98]"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar con color principal */}
        <header className="sticky top-0 z-30 hidden bg-[#BE123C] text-white shadow-[0_4px_20px_rgba(190,18,60,0.3)] lg:block">
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex items-center gap-1.5 text-[13px] text-white/70">
              <span>Panel</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-white">{current}</span>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium">
                <span className="animate-pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
                Datos actualizados hoy
              </span>
              <Link
                href="/dashboard/compartir"
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3.5 text-[13px] font-semibold text-[#BE123C] transition-all duration-200 hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
              >
                <Share2 size={14} />
                Compartir formulario
              </Link>
            </div>
          </div>
        </header>

        {/* top bar mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#BE123C] px-3.5 text-white shadow-[0_4px_16px_rgba(190,18,60,0.3)] lg:hidden">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setOpen((v) => !v)} aria-label="Abrir menú" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-white/25 bg-white/10 transition-transform active:scale-95">
              <Menu size={17} />
            </button>
            <div className="leading-tight">
              <span className="block font-display text-[14px] font-bold">Tu Carné Gremial</span>
              <span className="block text-[11px] text-white/70">{current}</span>
            </div>
          </div>
          <Link href="/dashboard/compartir" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#BE123C]">
            <Share2 size={13} />
            Compartir
          </Link>
        </header>

        {/* drawer */}
        {open && (
          <div className="animate-fade-in fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="animate-fade-up absolute bottom-0 left-0 top-0 w-[272px] overflow-y-auto bg-[#14090D] p-3.5 text-[#F5F3F0]">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#BE123C] text-[11px] font-black text-white">TG</div>
                  <span className="font-display text-[14px] font-bold">Navegación</span>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/10 transition-transform active:scale-95">
                  <X size={15} />
                </button>
              </div>
              <nav className="space-y-1.5">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-colors ${pathname === n.href ? "bg-[#BE123C] text-white" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
                    >
                      <Icon size={16} />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={signOut}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/10 py-2.5 text-[13px] font-medium"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
