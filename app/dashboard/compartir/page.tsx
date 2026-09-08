"use client";
import * as React from "react";
import Link from "next/link";
import { Eye, Share2 } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { SharePanel } from "@/components/share-form";

export default function CompartirPage() {
  const [url, setUrl] = React.useState("");

  // URL solo en cliente (SSR no tiene window): se resuelve tras montar.
  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => setUrl(`${window.location.origin}/registro`));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<Share2 size={20} />}
        title="Compartir formulario"
        subtitle="Envía el registro a quien quieras: enlace, WhatsApp, QR o email."
      />
      {url ? (
        <SharePanel url={url} />
      ) : (
        <div className="h-40 animate-pulse rounded-xl bg-[#F1EFEA]" />
      )}

      <Card className="animate-fade-up stagger-3 flex flex-wrap items-center gap-3 border-[#E8CDD4] bg-[#FAF4F5] p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#732427] shadow-sm">
          <Eye size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1C1917]">¿Quieres verlo antes de enviarlo?</p>
          <p className="text-[13px] text-[#78716C]">Abre la vista previa: recorre el formulario como un campesino, sin guardar nada.</p>
        </div>
        <Link
          href="/dashboard/vista-previa"
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#732427] to-[#481418] px-5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(115,36,39,0.3)] transition-all duration-200 hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
        >
          <Eye size={15} />
          Abrir vista previa
        </Link>
      </Card>
    </div>
  );
}
