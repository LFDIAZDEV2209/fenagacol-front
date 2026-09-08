"use client";
import * as React from "react";
import { Share2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
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
    </div>
  );
}
