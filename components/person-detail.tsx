"use client";
import * as React from "react";
import { X, User, Hash, Phone, Mail, MapPin, Users, Building2, CalendarDays, Bird } from "lucide-react";
import type { Person } from "@/lib/mock-data";
import { deptName, muniName, assocName } from "@/lib/mock-data";
import { fmtDate } from "@/lib/format";

export function PersonDetail({ person, onClose }: { person: Person | null; onClose: () => void }) {
  React.useEffect(() => {
    if (!person) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [person, onClose]);

  if (!person) return null;

  const rows = [
    { icon: Hash, label: "Identidad", value: person.identity, mono: true },
    { icon: Phone, label: "Teléfono", value: person.phone, mono: true },
    { icon: Mail, label: "Correo", value: person.email ?? "—" },
    { icon: MapPin, label: "Departamento", value: deptName(person.departmentId) },
    { icon: MapPin, label: "Municipio", value: muniName(person.municipalityId) },
    { icon: Building2, label: "Asociación", value: assocName(person.associationId) },
    { icon: CalendarDays, label: "Fecha de registro", value: fmtDate(person.createdAt) },
  ];

  return (
    <div className="animate-fade-in fixed inset-0 z-[90] grid place-items-center bg-black/45 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Detalle de ${person.fullName}`}>
      <div className="animate-pop-in w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 bg-[#732427] p-4 text-white">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
            <User size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold">{person.fullName}</p>
            <p className="text-xs text-white/75">Ficha del registrado</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/15 transition-transform hover:bg-white/25 active:scale-95">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[60vh] space-y-1 overflow-y-auto p-3">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-[#FAFAF8]">
                <Icon size={15} className="shrink-0 text-[#732427]" />
                <span className="w-[130px] shrink-0 text-xs text-[#78716C]">{r.label}</span>
                <span className={`flex-1 text-right text-[13px] font-medium text-[#1C1917] ${r.mono ? "font-mono" : ""}`}>{r.value}</span>
              </div>
            );
          })}
          <div className="flex items-start gap-3 rounded-lg px-2.5 py-2">
            <Bird size={15} className="mt-0.5 shrink-0 text-[#732427]" />
            <span className="w-[130px] shrink-0 text-xs text-[#78716C]">Roles</span>
            <span className="flex flex-1 flex-wrap justify-end gap-1.5">
              {person.roles.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 rounded-full border border-[#E7E2D9] bg-[#F8EDEF] px-2.5 py-1 text-xs font-semibold text-[#732427]">
                  <Users size={11} />
                  {r}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="border-t border-[#EDE9E1] bg-[#FAFAF8] p-3">
          <button onClick={onClose} className="h-10 w-full cursor-pointer rounded-xl bg-white text-sm font-semibold text-[#1C1917] transition-all duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
