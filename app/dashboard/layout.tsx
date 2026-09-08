"use client";
import Image from "next/image";
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
  "/dashboard/vista-previa": "Vista previa",
  "/dashboard/configuracion": "Configuración",
};

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);
  const scrolled = useScrolled();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // El drawer se cierra en el onClick de cada enlace (sin effects).
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
  const topbarCls = scrolled
    ? "bg-[#8E0F2E]/95 shadow-[0_10px_36px_rgba(142,15,46,0.42)] backdrop-blur-md"
    : "bg-[#BE123C] shadow-[0_4px_20px_rgba(190,18,60,0.28)]";

  const navItem = (active: boolean) =>
    `group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 hover:-translate-y-px ${
      active ? "bg-[#FFF1F2] font-semibold text-[#BE123C] shadow-[inset_0_0_0_1px_#F3D9E0]" : "text-[#57534E] hover:bg-[#F7F6F3] hover:text-[#1C1917]"
    }`;
  const navIcon = (active: boolean) =>
    `grid h-7 w-7 shrink-0 place-items-center rounded-md transition-all duration-200 ${
      active ? "bg-[#BE123C] text-white shadow-[0_3px_10px_rgba(190,18,60,0.4)]" : "bg-[#F1EFEA] text-[#78716C] group-hover:bg-[#E7E2D9] group-hover:text-[#44403C]"
    }`;

  const sidebarBody = (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
        <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A8A29E]">Gestión</p>
        {NAV.map((n) => {
          const active = pathname === n.href;
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={navItem(active)} aria-current={active ? "page" : undefined}>
              <span className={navIcon(active)}>
                <Icon size={15} strokeWidth={2.2} />
              </span>
              {n.label}
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
        <p className="px-2.5 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A8A29E]">Accesos</p>
        <Link
          href="/registro"
          className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#57534E] transition-all duration-200 hover:-translate-y-px hover:bg-[#F7F6F3] hover:text-[#1C1917]"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#F1EFEA] text-[#78716C] transition-colors group-hover:bg-[#E7E2D9] group-hover:text-[#44403C]">
            <ClipboardList size={15} strokeWidth={2.2} />
          </span>
          Formulario público
        </Link>
      </nav>
      <div className="border-t border-[#EDE9E1] p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-[#EDE9E1] bg-[#FAFAF8] p-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#BE123C] text-xs font-bold text-white">
            {(user.email[0] ?? "A").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-none text-[#1C1917]">Administrador</p>
            <p className="mt-1 truncate text-[11px] text-[#78716C]">{user.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-2.5 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#E7E2D9] bg-white text-[13px] font-semibold text-[#57534E] transition-all duration-200 hover:-translate-y-px hover:border-[#BE123C]/40 hover:bg-[#FFF1F2] hover:text-[#BE123C] active:translate-y-0 active:scale-[0.98]"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F4F2]">
      {/* sidebar desktop — blanco */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-[#E7E2D9] bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-[#F1EFEA] px-4">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=96&q=70&auto=format&fit=crop"
            alt="Campo colombiano"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-black/10"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-[14px] font-bold leading-tight text-[#1C1917]">Tu Carné Gremial</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#BE123C]">Admin · Fenagacol</p>
          </div>
        </div>
        {sidebarBody}
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar desktop con efecto scroll */}
        <header className={`sticky top-0 z-30 hidden text-white transition-all duration-300 lg:block ${topbarCls}`}>
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

        {/* topbar mobile con efecto scroll */}
        <header className={`sticky top-0 z-30 flex h-14 items-center justify-between px-3.5 text-white transition-all duration-300 lg:hidden ${topbarCls}`}>
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

        {/* drawer mobile — blanco */}
        {open && (
          <div className="animate-fade-in fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
            <div className="animate-fade-up absolute bottom-0 left-0 top-0 flex w-[272px] flex-col overflow-y-auto border-r border-[#E7E2D9] bg-white">
              <div className="flex items-center justify-between border-b border-[#F1EFEA] p-3.5">
                <div className="flex items-center gap-2">
                  <Image
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=96&q=70&auto=format&fit=crop"
                    alt="Campo colombiano"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-black/10"
                  />
                  <span className="font-display text-[14px] font-bold text-[#1C1917]">Tu Carné Gremial</span>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[#F4F4F2] text-[#57534E] transition-transform active:scale-95">
                  <X size={15} />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col">{sidebarBody}</div>
            </div>
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
