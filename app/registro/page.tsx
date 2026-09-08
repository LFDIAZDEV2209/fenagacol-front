import { RegistroForm } from "@/components/registro-form";
import { SiteHeader } from "@/components/site-header";
import Image from "next/image";

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-[#f8f3e8]">
      <SiteHeader minimal />
      {/* Hero rural — sutil, no corporativo */}
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6 pt-5 pb-10">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-8 items-start">
          {/* izquierda: form — primero en móvil */}
          <div className="order-1">
            {/* banner superior estilo form original pero pulido */}
            <div className="rounded-2xl overflow-hidden border border-[#ece2d1] shadow-[0_8px_30px_rgba(28,26,23,0.08)] bg-white">
              <div className="relative h-[148px] sm:h-[164px]">
                <Image
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop"
                  alt="Campo colombiano — comunidad rural"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a0d]/85 via-[#4a0f1f]/55 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                {/* contenido */}
                <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-center">
                  <p className="inline-flex w-fit px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-white text-[11px] font-semibold tracking-widest uppercase border border-white/20">Registro oficial</p>
                  <h1 className="mt-3 font-display text-[26px] sm:text-[30px] font-bold leading-[0.95] text-white drop-shadow">
                    Tu Carné Gremial: <br />
                    <span className="text-[#f5d6a0]">El Poder de Estar Unidos.</span>
                  </h1>
                  <p className="mt-2 text-sm text-white/85 max-w-[36ch]">Una plataforma sencilla para registrar y conocer a nuestra comunidad campesina y gallera.</p>
                </div>
                {/* hombre con gallo sutil a la derecha — segunda imagen superpuesta */}
                <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-[42%]">
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#4a0f1f]/10" />
                  <Image
                    src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80&auto=format&fit=crop"
                    alt="Productor rural"
                    fill
                    sizes="(max-width:1024px) 100vw, 35vw"
                    className="object-cover [object-position:center_30%] opacity-[0.92]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 bg-[#4a0f1f]/10 mix-blend-multiply" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#732427]" />
              </div>
            </div>

            <div className="mt-6">
              <RegistroForm />
            </div>
          </div>

          {/* derecha: contexto humano / confianza — debajo en móvil, sticky en desktop */}
          <div className="order-2 lg:sticky lg:top-6 space-y-4">
            <div className="rounded-2xl overflow-hidden bg-white border border-[#ece2d1] shadow-[0_8px_30px_rgba(28,26,23,0.06)]">
              <div className="relative h-[220px] sm:h-[260px]">
                <Image
                  src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80&auto=format&fit=crop"
                  alt="Comunidad campesina"
                  fill
                  sizes="(max-width:1024px) 100vw, 35vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c0a0d]/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <p className="text-sm font-semibold">Más de 12.000 personas ya registradas</p>
                  <p className="text-xs text-white/80 mt-1">Campesinos, galleros, cuidadores y comerciantes de todo el país.</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-[#1c1a17]">¿Por qué registrarte?</h3>
                <ul className="mt-3 space-y-2.5">
                  {[
                    "Obtén tu carné gremial oficial",
                    "Conecta con asociaciones de tu región",
                    "Participa en caracterización y apoyos del gremio",
                  ].map((t) => (
                    <li key={t} className="flex gap-2.5 text-sm text-[#4a3f35]">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#f0e8d5] border border-[#e8ddd0] grid place-items-center text-[#732427] text-xs">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-[#732427] text-[#fff7e8] p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <p className="text-xs font-semibold tracking-widest uppercase opacity-70">Testimonio</p>
              <p className="mt-2 text-[15px] leading-relaxed font-medium">“El registro fue muy fácil. En 2 minutos quedé listo y ya me contactaron de la asociación.”</p>
              <p className="mt-3 text-xs opacity-70">— Luis E., Riohacha, La Guajira · Gallero y criador</p>
            </div>

            <div className="rounded-2xl bg-white border border-[#ece2d1] p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fdf8ef] border border-[#ece2d1] grid place-items-center text-[#732427]">🛡️</div>
              <div>
                <p className="text-sm font-semibold text-[#1c1a17]">Datos protegidos</p>
                <p className="text-xs text-[#7a6e5a]">Solo el equipo administrador autorizado puede ver la información.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
