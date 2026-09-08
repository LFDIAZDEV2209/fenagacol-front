import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f3e8]">
      <SiteHeader />
      <main className="mx-auto max-w-[1160px] px-4 sm:px-6">
        {/* hero */}
        <section className="mt-4 rounded-[24px] overflow-hidden bg-white border border-[#ece2d1] shadow-[0_16px_40px_rgba(28,26,23,0.08)] grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf8ef] border border-[#ece2d1] text-xs font-semibold tracking-widest uppercase text-[#6b1220]">
              Plataforma oficial · Fenagacol
            </span>
            <h1 className="mt-5 font-display text-[34px] sm:text-[44px] font-extrabold leading-[0.9] text-[#1c1a17]">
              Tu Carné <span className="text-[#6b1220]">Gremial</span>
              <br />
              <span className="font-light text-[#7a6e5a] text-[26px] sm:text-[30px]">El poder de estar unidos.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5a4f42] max-w-[48ch]">
              Una plataforma sencilla para registrar y conocer a nuestra comunidad campesina y gallera de Colombia. Rápida, humana y hecha para el campo.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/registro" className="h-[52px] px-8 inline-flex items-center justify-center rounded-xl bg-[#6b1220] text-white font-semibold hover:bg-[#7e1730] shadow-[0_8px_20px_rgba(107,18,32,0.22)]">
                Registrarme ahora
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="ml-2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/login" className="h-[52px] px-8 inline-flex items-center justify-center rounded-xl bg-white border border-[#e8ddd0] font-semibold text-[#1c1a17] hover:bg-[#fdf6e8]">
                Soy administrador
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 border-t border-[#f0e8d5] pt-6">
              <div className="flex -space-x-2">
                {[1,2,3].map(i=> (
                  <Image key={i} src={`https://i.pravatar.cc/100?img=${10+i}`} alt="" width={36} height={36} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
                ))}
                <span className="w-9 h-9 rounded-full bg-[#6b1220] border-2 border-white grid place-items-center text-white text-xs font-bold">+12k</span>
              </div>
              <p className="text-xs leading-tight text-[#7a6e5a]"><span className="font-semibold text-[#1c1a17]">12.482 registrados</span><br/>en 184 municipios del país</p>
            </div>
          </div>
          <div className="relative h-[280px] lg:h-auto min-h-[380px] bg-[#fdf8ef]">
            <Image
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80&auto=format&fit=crop"
              alt="Paisaje rural colombiano"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c0a0d]/30 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white lg:via-transparent lg:to-transparent" />
            {/* floating card */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur rounded-2xl border border-white/60 shadow-[0_12px_30px_rgba(28,26,23,0.12)] p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#fdf6e8] border border-[#ece2d1] grid place-items-center text-[#6b1220]">✓</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1c1a17]">Módulo de Registro — 4 pasos</p>
                <p className="text-xs text-[#7a6e5a] mt-0.5">Datos personales → Ubicación → Actividad → Asociación. 2 a 3 minutos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* como funciona */}
        <section className="mt-10 sm:mt-12">
          <h2 className="font-display text-xl font-bold text-[#1c1a17]">¿Cómo funciona?</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            {[
              { n:"01", t:"Recibes el enlace", d:"Te llega por WhatsApp o por tu asociación.", img:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80&auto=format&fit=crop" },
              { n:"02", t:"Te registras en 3 minutos", d:"Formulario grande, claro y sin complicaciones.", img:"https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80&auto=format&fit=crop" },
              { n:"03", t:"Haces parte del gremio", d:"Tu carné y tu asociación quedan registrados.", img:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop" },
            ].map(c=> (
              <div key={c.n} className="rounded-2xl bg-white border border-[#ece2d1] overflow-hidden shadow-sm">
                <div className="relative h-32">
                  <Image src={c.img} alt="" fill className="object-cover" />
                  <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#6b1220] text-white grid place-items-center text-xs font-bold">{c.n}</span>
                </div>
                <div className="p-5">
                  <p className="font-semibold text-[#1c1a17]">{c.t}</p>
                  <p className="text-sm text-[#7a6e5a] mt-1">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 mb-12 rounded-2xl bg-[#6b1220] text-[#fff7e8] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-lg">¿Listo para registrarte?</p>
            <p className="text-sm text-white/80">Toma menos de 3 minutos. Solo necesitas tu cédula y tu celular.</p>
          </div>
          <Link href="/registro" className="shrink-0 h-11 px-7 inline-flex items-center justify-center rounded-xl bg-white text-[#6b1220] font-semibold hover:bg-[#fff7e8]">
            Ir al formulario
          </Link>
        </section>
      </main>
      <footer className="border-t border-[#ece2d1] bg-white">
        <div className="mx-auto max-w-[1160px] px-4 sm:px-6 h-[64px] flex items-center justify-between text-xs text-[#9a8d78]">
          <span>© {new Date().getFullYear()} Fenagacol · Tu Carné Gremial</span>
          <span className="hidden sm:inline">Hecho con respeto por el campo colombiano</span>
        </div>
      </footer>
    </div>
  );
}
