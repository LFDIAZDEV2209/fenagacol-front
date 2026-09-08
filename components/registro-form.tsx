"use client";
import * as React from "react";
import { Button, Card, Combobox, Input, Label, Progress } from "./ui";
import { ASSOCIATIONS, DEPARTMENTS, MUNICIPALITIES, ROLES, getMunicipalitiesByDept } from "@/lib/mock-data";
import Link from "next/link";

type FormData = {
  fullName: string;
  identity: string;
  phone: string;
  email: string;
  departmentId: string;
  municipalityId: string;
  roles: string[];
  otroDetalle: string;
  pertenece: "" | "si" | "no";
  associationId: string;
};

const initial: FormData = {
  fullName: "",
  identity: "",
  phone: "",
  email: "",
  departmentId: "",
  municipalityId: "",
  roles: [],
  otroDetalle: "",
  pertenece: "",
  associationId: "",
};

export function RegistroForm() {
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<FormData>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const munis = React.useMemo(() => (data.departmentId ? getMunicipalitiesByDept(data.departmentId) : []), [data.departmentId]);

  // reset municipio when dept changes
  React.useEffect(() => {
    if (data.departmentId && data.municipalityId) {
      const ok = munis.some((m) => m.id === data.municipalityId);
      if (!ok) setData((d) => ({ ...d, municipalityId: "" }));
    }
  }, [data.departmentId, data.municipalityId, munis]);

  function validate(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.fullName.trim() || data.fullName.trim().length < 6) e.fullName = "Escribe tu nombre completo";
      if (!/^\d{6,12}$/.test(data.identity.trim())) e.identity = "Ingresa un número de identidad válido (6 a 12 dígitos)";
      if (!/^3\d{9}$/.test(data.phone.trim())) e.phone = "Ingresa un celular válido (10 dígitos, empieza con 3)";
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Correo no válido";
    }
    if (s === 2) {
      if (!data.departmentId) e.departmentId = "Selecciona tu departamento";
      if (!data.municipalityId) e.municipalityId = "Selecciona tu municipio";
    }
    if (s === 3) {
      if (data.roles.length === 0) e.roles = "Selecciona al menos un rol";
      if (data.roles.includes("Otro") && !data.otroDetalle.trim()) e.otroDetalle = "Cuéntanos cuál es tu rol";
    }
    if (s === 4) {
      if (!data.pertenece) e.pertenece = "Selecciona Sí o No";
      if (data.pertenece === "si" && !data.associationId) e.associationId = "Selecciona tu asociación";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step)) setStep((s) => Math.min(4, s + 1));
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!validate(4)) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    const deptName = DEPARTMENTS.find((d) => d.id === data.departmentId)?.name;
    const muniLabel = MUNICIPALITIES.find((m) => m.id === data.municipalityId)?.name ?? data.municipalityId;
    return (
      <Card className="p-8 sm:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#6b1220] text-white grid place-items-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 className="font-display text-[28px] font-bold text-[#1c1a17] leading-tight">¡Registro completado!</h2>
        <p className="mt-2 text-[15px] text-[#7a6e5a]">Gracias por hacer parte de nuestra comunidad.</p>
        <div className="mt-6 bg-[#fdf8ef] border border-[#ece2d1] rounded-2xl p-5 text-left">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#9a8d78] mb-3">Resumen de tu registro</p>
          <div className="space-y-2 text-sm">
            <p><span className="text-[#7a6e5a]">Nombre:</span> <span className="font-semibold text-[#1c1a17]">{data.fullName}</span></p>
            <p><span className="text-[#7a6e5a]">Ubicación:</span> <span className="font-medium">{deptName} — {muniLabel}</span></p>
            <p><span className="text-[#7a6e5a]">Roles:</span> <span className="font-medium">{data.roles.join(", ")}{data.roles.includes("Otro") ? ` (${data.otroDetalle})` : ""}</span></p>
            {data.pertenece === "si" && <p><span className="text-[#7a6e5a]">Asociación:</span> <span className="font-medium">{ASSOCIATIONS.find(a=>a.id===data.associationId)?.name}</span></p>}
          </div>
        </div>
        <p className="mt-4 text-sm text-[#7a6e5a]">Tu información ha sido registrada correctamente.</p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => { setData(initial); setStep(1); setSubmitted(false); }}>Hacer otro registro</Button>
          <Link href="/" className="h-[52px] px-7 inline-flex items-center justify-center rounded-xl bg-white border border-[#e8ddd0] font-semibold text-[#1c1a17] hover:bg-[#fdf6e8]">Volver al inicio</Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* progress */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold tracking-wide text-[#7a6e5a]">Paso {step} de 4</p>
        <p className="text-[13px] font-medium text-[#9a8d78]">{step === 1 ? "Datos personales" : step === 2 ? "Ubicación" : step === 3 ? "Actividad" : "Asociación"}</p>
      </div>
      <Progress value={step} max={4} />

      <Card className="mt-5 p-5 sm:p-7">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-[22px] font-bold text-[#1c1a17]">Cuéntanos sobre ti</h2>
              <p className="text-sm text-[#7a6e5a] mt-1">Usa tus datos tal como aparecen en tu documento.</p>
            </div>

            <div>
              <Label htmlFor="fullName">Nombres y apellidos <span className="text-[#6b1220]">*</span></Label>
              <Input id="fullName" placeholder="Ej: Carlos Andrés Epiayú" value={data.fullName} onChange={(e)=> setData({...data, fullName: e.target.value})} error={errors.fullName} autoComplete="name" />
            </div>

            <div>
              <Label htmlFor="identity">Número de identidad <span className="text-[#6b1220]">*</span></Label>
              <Input id="identity" placeholder="Ej: 1112345678" inputMode="numeric" value={data.identity} onChange={(e)=> setData({...data, identity: e.target.value.replace(/\D/g,"")})} error={errors.identity} />
            </div>

            <div>
              <Label htmlFor="phone">Número de teléfono <span className="text-[#6b1220]">*</span></Label>
              <Input id="phone" placeholder="Ej: 3001234567" inputMode="tel" value={data.phone} onChange={(e)=> setData({...data, phone: e.target.value.replace(/\D/g,"").slice(0,10)})} error={errors.phone} />
              <p className="mt-1.5 text-xs text-[#9a8d78]">Te contactaremos solo para temas del registro.</p>
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico <span className="text-[#9a8d78] font-normal">(opcional)</span></Label>
              <Input id="email" placeholder="Ej: carlos@correo.co" type="email" value={data.email} onChange={(e)=> setData({...data, email: e.target.value})} error={errors.email} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-[22px] font-bold text-[#1c1a17]">¿Dónde vives?</h2>
              <p className="text-sm text-[#7a6e5a] mt-1">Selecciona tu departamento y tu municipio. Escribe para buscar más rápido.</p>
            </div>

            <div className="rounded-xl bg-[#fdf8ef] border border-[#ece2d1] p-3 flex gap-2 items-center text-sm text-[#7a6e5a]">
              <span className="w-7 h-7 rounded-full bg-white border border-[#e8ddd0] grid place-items-center text-[#6b1220]">1</span>
              El municipio depende del departamento que elijas
              <span className="ml-auto hidden sm:inline text-xs">Departamento → Municipio</span>
            </div>

            <Combobox
              label="Departamento *"
              placeholder="Selecciona tu departamento"
              options={DEPARTMENTS.map(d=> ({ value:d.id, label:d.name}))}
              value={data.departmentId}
              onChange={(v)=> setData(d=> ({...d, departmentId: v, municipalityId: ""}))}
              error={errors.departmentId}
            />

            <Combobox
              label="Municipio *"
              placeholder={data.departmentId ? "Selecciona tu municipio" : "Primero elige departamento"}
              options={munis.map(m=> ({ value:m.id, label:m.name}))}
              value={data.municipalityId}
              onChange={(v)=> setData(d=> ({...d, municipalityId: v}))}
              error={errors.municipalityId}
              disabled={!data.departmentId}
            />

            {!data.departmentId && <p className="text-xs text-[#9a8d78]">Tip: prueba escribir “Guajira” o “Antioquia”</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-[22px] font-bold text-[#1c1a17]">Cuéntanos a qué te dedicas</h2>
              <p className="text-sm text-[#7a6e5a] mt-1">Puedes elegir más de uno. Selecciona todas las que apliquen.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1c1a17] mb-3">Selecciona tu rol <span className="text-[#6b1220]">*</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map((role) => {
                  const active = data.roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={()=> setData(d=> ({...d, roles: active ? d.roles.filter(r=>r!==role) : [...d.roles, role]}))}
                      className={`text-left p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${active ? "bg-[#fdf6e8] border-[#6b1220] shadow-sm" : "bg-white border-[#e8ddd0] hover:border-[#d6c7b3] hover:bg-[#fdf8ef]"}`}
                    >
                      <span className={`mt-0.5 w-5 h-5 rounded-md border-2 grid place-items-center shrink-0 ${active ? "bg-[#6b1220] border-[#6b1220] text-white" : "border-[#d6c7b3] bg-white"}`}>
                        {active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5l10-10"/></svg>}
                      </span>
                      <span className={`text-[15px] font-medium ${active ? "text-[#1c1a17]" : "text-[#2b2118]"}`}>{role}</span>
                    </button>
                  );
                })}
              </div>
              {errors.roles && <p className="mt-2 text-[13px] text-red-600 font-medium">{errors.roles}</p>}
              {data.roles.includes("Otro") && (
                <div className="mt-4 p-4 rounded-xl bg-[#fdf8ef] border border-[#ece2d1]">
                  <Label htmlFor="otroDetalle">¿Cuál? <span className="text-[#6b1220]">*</span></Label>
                  <Input id="otroDetalle" placeholder="Ej: Veterinario, juez de gallera..." value={data.otroDetalle} onChange={(e)=> setData({...data, otroDetalle: e.target.value})} error={errors.otroDetalle} />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-[22px] font-bold text-[#1c1a17]">¿Perteneces a alguna asociación?</h2>
              <p className="text-sm text-[#7a6e5a] mt-1">Si haces parte de un colectivo o asociación, cuéntanos cuál.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "si", label: "Sí", desc: "Hago parte de una" },
                { id: "no", label: "No", desc: "Aún no pertenezco" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={()=> setData(d=> ({...d, pertenece: opt.id as any, associationId: opt.id==="no" ? "" : d.associationId}))}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${data.pertenece===opt.id ? "bg-[#6b1220] border-[#6b1220] text-white shadow-[0_8px_20px_rgba(107,18,32,0.22)]" : "bg-white border-[#e8ddd0] hover:border-[#d6c7b3]"}`}
                >
                  <p className={`text-[17px] font-bold ${data.pertenece===opt.id ? "text-white" : "text-[#1c1a17]"}`}><span className="inline-flex w-6 h-6 rounded-full border-2 mr-2 align-middle place-items-center justify-center text-[11px] relative top-[-1px]" style={{borderColor: data.pertenece===opt.id ? "white" : "#d6c7b3", background: data.pertenece===opt.id ? "white" : "transparent", color: data.pertenece===opt.id ? "#6b1220" : "transparent"}}>✓</span>{opt.label}</p>
                  <p className={`text-xs mt-1 ${data.pertenece===opt.id ? "text-white/80" : "text-[#7a6e5a]"}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
            {errors.pertenece && <p className="text-[13px] text-red-600 font-medium">{errors.pertenece}</p>}

            {data.pertenece === "si" && (
              <div className="p-4 rounded-xl bg-[#fdf8ef] border border-[#ece2d1]">
                <Combobox
                  label="¿Cuál asociación? *"
                  placeholder="Busca tu asociación"
                  options={ASSOCIATIONS.map(a=> ({ value:a.id, label:a.name}))}
                  value={data.associationId}
                  onChange={(v)=> setData(d=> ({...d, associationId: v}))}
                  error={errors.associationId}
                />
                <p className="mt-2 text-xs text-[#9a8d78]">Si no aparece, podrás actualizarlo después con el administrador.</p>
              </div>
            )}

            <div className="rounded-xl bg-[#f0e8d5] border border-[#e8ddd0] p-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#e8ddd0] grid place-items-center shrink-0 text-[#6b1220]">✓</div>
              <div>
                <p className="text-sm font-semibold text-[#1c1a17]">Revisa tus datos antes de enviar.</p>
                <p className="text-sm text-[#7a6e5a] mt-0.5">{data.fullName || "—"} · {DEPARTMENTS.find(d=>d.id===data.departmentId)?.name || "Departamento"} · {data.roles.join(", ") || "Rol"}</p>
              </div>
            </div>
          </div>
        )}

        {/* navegacion */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button variant="secondary" size="lg" onClick={back} className="flex-1 sm:flex-none">
              Volver
            </Button>
          )}
          {step < 4 ? (
            <Button size="lg" onClick={next} className="flex-1">
              Continuar
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="ml-2"><path d="M9 18l6-6-6-6"/></svg>
            </Button>
          ) : (
            <Button size="lg" onClick={submit} disabled={sending} className="flex-1">
              {sending ? "Enviando..." : "Enviar registro"}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-[#9a8d78]">Tus datos están protegidos. Solo el equipo administrador podrá verlos.</p>
      </Card>
    </div>
  );
}
