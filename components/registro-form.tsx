"use client";
import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button, Card, Combobox, Input, Label, Progress } from "./ui";
import { DEPARTMENTS, MUNICIPALITIES, getMunicipalitiesByDept } from "@/lib/mock-data";
import { useConfig } from "@/lib/config-store";
import { useToast } from "./toast";
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
  const { activeRoles, activeAssocs, addPerson, cfg, ready } = useConfig();
  const { push } = useToast();
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<FormData>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const t = cfg.texts;
  const deptos = React.useMemo(() => DEPARTMENTS.filter((d) => !cfg.deptOff.includes(d.id)), [cfg.deptOff]);
  const munis = React.useMemo(() => (data.departmentId ? getMunicipalitiesByDept(data.departmentId) : []), [data.departmentId]);
  const otherSelected = data.roles.some((l) => activeRoles.find((r) => r.label === l)?.isOther);

  // El municipio se resetea en el onChange del departamento; aquí solo se valida
  // contra las opciones vigentes (por si el admin cambió la configuración).

  function validate(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.fullName.trim() || data.fullName.trim().length < 6) e.fullName = "Escribe tu nombre completo";
      if (!/^\d{6,12}$/.test(data.identity.trim())) e.identity = "Ingresa un número de identidad válido (6 a 12 dígitos)";
      if (!/^3\d{9}$/.test(data.phone.trim())) e.phone = "Ingresa un celular válido (10 dígitos, empieza con 3)";
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Correo no válido";
    }
    if (s === 2) {
      if (!data.departmentId || !deptos.some((d) => d.id === data.departmentId)) {
        e.departmentId = "Selecciona tu departamento";
      }
      if (!data.municipalityId || !munis.some((m) => m.id === data.municipalityId)) {
        e.municipalityId = "Selecciona tu municipio";
      }
    }
    if (s === 3) {
      if (data.roles.length === 0) e.roles = "Selecciona al menos un rol";
      if (otherSelected && !data.otroDetalle.trim()) e.otroDetalle = "Cuéntanos cuál es tu rol";
    }
    if (s === 4) {
      if (!data.pertenece) e.pertenece = "Selecciona Sí o No";
      if (data.pertenece === "si" && !data.associationId) e.associationId = "Selecciona tu asociación";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step)) {
      setStep((s) => Math.min(4, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!validate(4)) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    addPerson({
      fullName: data.fullName.trim(),
      identity: data.identity.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      departmentId: data.departmentId,
      municipalityId: data.municipalityId,
      roles: otherSelected
        ? [...data.roles.filter((l) => !activeRoles.find((r) => r.label === l)?.isOther), `${data.otroDetalle.trim()}`]
        : data.roles,
      associationId: data.pertenece === "si" ? data.associationId : undefined,
    });
    setSending(false);
    setSubmitted(true);
    push("Registro guardado correctamente");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) {
    return (
      <div className="space-y-3">
        <div className="h-2 animate-pulse rounded-full bg-[#F3D9E0]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#F4F4F2]" />
      </div>
    );
  }

  if (submitted) {
    const deptLabel = DEPARTMENTS.find((d) => d.id === data.departmentId)?.name;
    const muniLabel = MUNICIPALITIES.find((m) => m.id === data.municipalityId)?.name ?? data.municipalityId;
    return (
      <Card className="animate-fade-up p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#BE123C] text-white">
          <Check size={26} strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-2xl font-bold leading-tight text-[#1c1a17]">¡Registro completado!</h2>
        <p className="mt-1.5 text-sm text-[#7a6e5a]">Gracias por hacer parte de nuestra comunidad.</p>
        <div className="mt-5 rounded-2xl border border-[#ece2d1] bg-[#fdf8ef] p-4 text-left">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#9a8d78]">Resumen de tu registro</p>
          <div className="space-y-1.5 text-sm">
            <p><span className="text-[#7a6e5a]">Nombre:</span> <span className="font-semibold text-[#1c1a17]">{data.fullName}</span></p>
            <p><span className="text-[#7a6e5a]">Ubicación:</span> <span className="font-medium">{deptLabel} — {muniLabel}</span></p>
            <p><span className="text-[#7a6e5a]">Roles:</span> <span className="font-medium">{data.roles.join(", ")}{otherSelected ? ` (${data.otroDetalle})` : ""}</span></p>
            {data.pertenece === "si" && <p><span className="text-[#7a6e5a]">Asociación:</span> <span className="font-medium">{activeAssocs.find(a => a.id === data.associationId)?.name}</span></p>}
          </div>
        </div>
        <p className="mt-3.5 text-sm text-[#7a6e5a]">Tu información ha sido registrada correctamente.</p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button onClick={() => { setData(initial); setStep(1); setSubmitted(false); }}>Hacer otro registro</Button>
          <Link href="/" className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-[#e8ddd0] bg-white px-6 font-semibold text-[#1c1a17] transition-all duration-200 hover:-translate-y-px hover:bg-[#fdf6e8]">Volver al inicio</Link>
        </div>
      </Card>
    );
  }

  const stepNames = ["Datos personales", "Ubicación", "Actividad", "Asociación"];
  const stepTitles = [t.s1Title, t.s2Title, t.s3Title, t.s4Title];
  const stepSubs = [t.s1Sub, t.s2Sub, t.s3Sub, t.s4Sub];

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold text-[#1c1a17]">{t.moduleTitle}</h2>
        <p className="mt-0.5 text-sm text-[#7a6e5a]">{t.moduleSub}</p>
      </div>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[13px] font-semibold tracking-wide text-[#7a6e5a]">Paso {step} de 4</p>
        <p className="text-[13px] font-medium text-[#9a8d78]">{stepNames[step - 1]}</p>
      </div>
      <Progress value={step} max={4} />

      <Card className="mt-4 p-5 sm:p-6">
        <div key={step} className="animate-fade-up">
          <h2 className="font-display text-xl font-bold text-[#1c1a17]">{stepTitles[step - 1]}</h2>
          <p className="mt-1 text-sm text-[#7a6e5a]">{stepSubs[step - 1]}</p>
        </div>

        <div className="mt-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombres y apellidos <span className="text-[#BE123C]">*</span></Label>
                <Input id="fullName" placeholder="Ej: Carlos Andrés Epiayú" value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} error={errors.fullName} autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="identity">Número de identidad <span className="text-[#BE123C]">*</span></Label>
                <Input id="identity" placeholder="Ej: 1112345678" inputMode="numeric" value={data.identity} onChange={(e) => setData({ ...data, identity: e.target.value.replace(/\D/g, "") })} error={errors.identity} />
              </div>
              <div>
                <Label htmlFor="phone">Número de teléfono <span className="text-[#BE123C]">*</span></Label>
                <Input id="phone" placeholder="Ej: 3001234567" inputMode="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} error={errors.phone} />
                <p className="mt-1.5 text-xs text-[#9a8d78]">Te contactaremos solo para temas del registro.</p>
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico <span className="font-normal text-[#9a8d78]">(opcional)</span></Label>
                <Input id="email" placeholder="Ej: carlos@correo.co" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} error={errors.email} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-[#ece2d1] bg-[#fdf8ef] p-3 text-sm text-[#7a6e5a]">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e8ddd0] bg-white text-[#BE123C]">1</span>
                El municipio depende del departamento que elijas
                <span className="ml-auto hidden text-xs sm:inline">Departamento → Municipio</span>
              </div>
              <Combobox
                label="Departamento *"
                placeholder="Selecciona tu departamento"
                options={deptos.map((d) => ({ value: d.id, label: d.name }))}
                value={data.departmentId}
                onChange={(v) => setData((d) => ({ ...d, departmentId: v, municipalityId: "" }))}
                error={errors.departmentId}
              />
              <Combobox
                label="Municipio *"
                placeholder={data.departmentId ? "Selecciona tu municipio" : "Primero elige departamento"}
                options={munis.map((m) => ({ value: m.id, label: m.name }))}
                value={data.municipalityId}
                onChange={(v) => setData((d) => ({ ...d, municipalityId: v }))}
                error={errors.municipalityId}
                disabled={!data.departmentId}
              />
              {!data.departmentId && <p className="text-xs text-[#9a8d78]">Tip: prueba escribir “Guajira” o “Antioquia”</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#1c1a17]">Selecciona tu rol <span className="text-[#BE123C]">*</span></p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {activeRoles.map((role) => {
                  const active = data.roles.includes(role.label);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, roles: active ? d.roles.filter((r) => r !== role.label) : [...d.roles, role.label] }))}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-200 hover:-translate-y-px ${active ? "border-[#BE123C] bg-[#FFF1F2] shadow-sm" : "border-[#e8ddd0] bg-white hover:border-[#F3A8BB] hover:bg-[#FFF7F9]"}`}
                    >
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${active ? "border-[#BE123C] bg-[#BE123C] text-white" : "border-[#d6c7b3] bg-white"}`}>
                        {active && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className="text-[15px] font-medium text-[#1c1a17]">{role.label}</span>
                    </button>
                  );
                })}
              </div>
              {activeRoles.length === 0 && <p className="text-sm text-[#9a8d78]">No hay roles disponibles por ahora.</p>}
              {errors.roles && <p className="mt-2 text-[13px] font-medium text-red-600">{errors.roles}</p>}
              {otherSelected && (
                <div className="animate-fade-up rounded-xl border border-[#ece2d1] bg-[#fdf8ef] p-4">
                  <Label htmlFor="otroDetalle">¿Cuál? <span className="text-[#BE123C]">*</span></Label>
                  <Input id="otroDetalle" placeholder="Ej: Veterinario, juez de gallera..." value={data.otroDetalle} onChange={(e) => setData({ ...data, otroDetalle: e.target.value })} error={errors.otroDetalle} />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "si", label: "Sí", desc: "Hago parte de una" },
                  { id: "no", label: "No", desc: "Aún no pertenezco" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, pertenece: opt.id as "si" | "no", associationId: opt.id === "no" ? "" : d.associationId }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-px ${data.pertenece === opt.id ? "border-[#BE123C] bg-[#BE123C] text-white shadow-[0_8px_20px_rgba(190,18,60,0.28)]" : "border-[#e8ddd0] bg-white hover:border-[#F3A8BB]"}`}
                  >
                    <p className={`text-[16px] font-bold ${data.pertenece === opt.id ? "text-white" : "text-[#1c1a17]"}`}>
                      <span className="mr-2 inline-flex h-5 w-5 place-items-center justify-center rounded-full border-2 align-middle text-[10px]" style={{ borderColor: data.pertenece === opt.id ? "white" : "#d6c7b3", background: data.pertenece === opt.id ? "white" : "transparent", color: data.pertenece === opt.id ? "#BE123C" : "transparent" }}>✓</span>
                      {opt.label}
                    </p>
                    <p className={`mt-1 text-xs ${data.pertenece === opt.id ? "text-white/80" : "text-[#7a6e5a]"}`}>{opt.desc}</p>
                  </button>
                ))}
              </div>
              {errors.pertenece && <p className="text-[13px] font-medium text-red-600">{errors.pertenece}</p>}

              {data.pertenece === "si" && (
                <div className="animate-fade-up rounded-xl border border-[#ece2d1] bg-[#fdf8ef] p-4">
                  <Combobox
                    label="¿Cuál asociación? *"
                    placeholder="Busca tu asociación"
                    options={activeAssocs.map((a) => ({ value: a.id, label: a.name }))}
                    value={data.associationId}
                    onChange={(v) => setData((d) => ({ ...d, associationId: v }))}
                    error={errors.associationId}
                  />
                  <p className="mt-2 text-xs text-[#9a8d78]">Si no aparece, podrás actualizarlo después con el administrador.</p>
                </div>
              )}

              <div className="flex gap-3 rounded-xl border border-[#e8ddd0] bg-[#f0e8d5] p-3.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e8ddd0] bg-white text-[#BE123C]">✓</div>
                <div>
                  <p className="text-sm font-semibold text-[#1c1a17]">Revisa tus datos antes de enviar.</p>
                  <p className="mt-0.5 text-sm text-[#7a6e5a]">{data.fullName || "—"} · {DEPARTMENTS.find((d) => d.id === data.departmentId)?.name || "Departamento"} · {data.roles.join(", ") || "Rol"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex gap-2.5">
          {step > 1 && (
            <Button variant="secondary" onClick={back} className="flex-1 sm:flex-none">
              Volver
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={next} className="flex-1">
              Continuar
              <ChevronRight size={17} />
            </Button>
          ) : (
            <Button onClick={submit} disabled={sending} className="flex-1">
              {sending ? "Enviando..." : t.submitLabel}
            </Button>
          )}
        </div>

        <p className="mt-3.5 text-center text-xs text-[#9a8d78]">Tus datos están protegidos. Solo el equipo administrador podrá verlos.</p>
      </Card>
    </div>
  );
}
