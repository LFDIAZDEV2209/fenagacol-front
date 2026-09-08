import Link from "next/link";

export function SiteHeader({ minimal }: { minimal?: boolean }) {
  return (
    <header className={`w-full ${minimal ? "bg-white border-b border-[#ece2d1]" : "bg-transparent"}`}>
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6 h-[64px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#732427] flex items-center justify-center text-white font-extrabold text-[13px] tracking-tight">TG</div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[16px] text-[#1c1a17] tracking-tight">Tu Carné Gremial</p>
            <p className="text-[11px] font-medium tracking-widest text-[#9a8d78] uppercase">El poder de estar unidos</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/registro" className="px-4 py-2 rounded-full bg-[#732427] text-white text-sm font-semibold hover:bg-[#481418] transition-colors">
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  );
}
