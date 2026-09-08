"use client";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { RegistroForm } from "@/components/registro-form";

// Vista previa del formulario público para el admin.
// Usa <RegistroForm preview />: recorrido 100% visual, CERO persistencia.
export default function VistaPreviaPage() {
  return (
    <div className="space-y-4">
      <div className="animate-fade-up flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <Eye size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-900">Modo vista previa</p>
          <p className="text-[13px] text-amber-800">Ves exactamente lo que verá el campesino. Nada de lo que hagas aquí se guarda.</p>
        </div>
        <Link
          href="/dashboard/compartir"
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3.5 text-[13px] font-semibold text-[#57534E] shadow-sm transition-all duration-200 hover:-translate-y-px hover:text-[#732427] hover:shadow"
        >
          <ArrowLeft size={14} />
          Volver a Compartir
        </Link>
      </div>

      <div className="rounded-2xl border border-[#EDE9E1] bg-[#FAF7F0] p-3.5 sm:p-6">
        <div className="mx-auto w-full max-w-[640px]">
          <RegistroForm preview />
        </div>
      </div>
    </div>
  );
}
