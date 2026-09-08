import Link from "next/link";

export function SiteHeader({ minimal }: { minimal?: boolean }) {
  return (
    <header className={`w-full ${minimal ? "bg-white border-b border-[#ece2d1]" : "bg-transparent"}`}>
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6 h-[64px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#BE123C] flex items-center justify-center text-white font-black text-[13px] tracking-tight">TG</div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[16px] text-[#1c1a17] tracking-tight">Tu Carné Gremial</p>
            <p className="text-[11px] font-medium tracking-widest text-[#9a8d78] uppercase">El poder de estar unidos</p>
          </div>
        </Link>
        <nav className="hidden sm:flex items-center gap-2">
          <Link href="/registro" className="px-4 py-2 rounded-full bg-[#BE123C] text-white text-sm font-semibold hover:bg-[#9F1239] transition-colors">
            Registrarse
          </Link>
          <Link href="/login" className="px-4 py-2 rounded-full bg-white border border-[#e8ddd0] text-sm font-medium hover:bg-[#fdf6e8]">
            Ingresar
          </Link>
        </nav>
        <Link href="/login" className="sm:hidden w-9 h-9 rounded-full bg-white border border-[#e8ddd0] grid place-items-center text-[#BE123C]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        </Link>
      </div>
    </header>
  );
}
