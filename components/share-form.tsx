"use client";
import * as React from "react";
import { Link2, Check, MessageCircle, QrCode, Download, Share2, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "./ui";
import { useToast } from "./toast";

const MESSAGE = "Hola, regístrate en Tu Carné Gremial (Fenagacol) aquí:";

// Panel completo para compartir el formulario público.
export function SharePanel({ url }: { url: string }) {
  const { push } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const qrRef = React.useRef<HTMLDivElement>(null);
  const canNative = typeof navigator !== "undefined" && "share" in navigator;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    push("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    setDownloading(true);
    try {
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 32, 32, 448, 448);
        const a = document.createElement("a");
        a.href = c.toDataURL("image/png");
        a.download = "qr-registro-fenagacol.png";
        a.click();
        push("Código QR descargado");
        setDownloading(false);
      };
      img.onerror = () => {
        push("No se pudo descargar el QR", "error");
        setDownloading(false);
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
    } catch {
      push("No se pudo descargar el QR", "error");
      setDownloading(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Tu Carné Gremial — Registro", text: MESSAGE, url });
      push("Compartido correctamente");
    } catch {
      // cancelado por el usuario: sin ruido
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${MESSAGE} ${url}`)}`;
  const mail = `mailto:?subject=${encodeURIComponent("Registro gremial Fenagacol")}&body=${encodeURIComponent(`${MESSAGE}\n${url}`)}`;

  const btn =
    "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Card className="animate-fade-up stagger-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E]">Enlace público</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <code className="flex h-11 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-xl border border-[#E7E2D9] bg-[#FAFAF8] px-3 font-mono text-[13px] text-[#1C1917]">{url}</code>
          <button onClick={copy} className={`${btn} bg-[#BE123C] text-white shadow-[0_4px_14px_rgba(190,18,60,0.3)] hover:bg-[#9F1239]`}>
            {copied ? <Check size={15} /> : <Link2 size={15} />}
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#25D366] text-white hover:brightness-95 hover:shadow-md`}>
            <MessageCircle size={15} />
            WhatsApp
          </a>
          <a href={mail} className={`${btn} border border-[#E7E2D9] bg-white text-[#1C1917] hover:bg-[#FAFAF8] hover:shadow-sm`}>
            <Mail size={15} />
            Email
          </a>
          <button onClick={downloadQR} disabled={downloading} className={`${btn} border border-[#E7E2D9] bg-white text-[#1C1917] hover:bg-[#FAFAF8] hover:shadow-sm disabled:opacity-50`}>
            <Download size={15} />
            {downloading ? "Generando..." : "Descargar QR"}
          </button>
          {canNative ? (
            <button onClick={nativeShare} className={`${btn} border border-[#E7E2D9] bg-white text-[#1C1917] hover:bg-[#FAFAF8] hover:shadow-sm`}>
              <Share2 size={15} />
              Compartir
            </button>
          ) : (
            <button onClick={copy} className={`${btn} border border-[#E7E2D9] bg-white text-[#1C1917] hover:bg-[#FAFAF8] hover:shadow-sm`}>
              <QrCode size={15} />
              Ver QR
            </button>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[#78716C]">
          Comparte el enlace por el canal que prefieras. Quien lo abra verá el formulario público y su registro aparecerá en el panel.
        </p>
      </Card>

      <Card className="animate-fade-up stagger-2 grid place-items-center p-5">
        <div className="text-center">
          <div ref={qrRef} className="inline-block rounded-2xl border border-[#E7E2D9] bg-white p-3 shadow-sm">
            <QRCodeSVG value={url} size={180} level="M" fgColor="#1C1917" />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#1C1917]">
            <QrCode size={14} className="text-[#BE123C]" />
            Escanea para registrarte
          </p>
          <p className="mt-0.5 text-xs text-[#78716C]">Apunta la cámara del celular</p>
        </div>
      </Card>
    </div>
  );
}
