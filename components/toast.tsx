"use client";
import * as React from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

type Toast = { id: number; message: string; kind: "success" | "error" | "info" };

const Ctx = React.createContext<{ push: (message: string, kind?: Toast["kind"]) => void } | null>(null);

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast fuera de ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(1);

  const push = React.useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-pop-in pointer-events-auto flex items-start gap-2.5 rounded-xl border border-[#E7E2D9] bg-white px-3.5 py-3 shadow-[0_12px_32px_rgba(28,25,23,0.16)]"
          >
            {t.kind === "success" && <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />}
            {t.kind === "error" && <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />}
            {t.kind === "info" && <Info size={17} className="mt-0.5 shrink-0 text-[#732427]" />}
            <p className="text-[13px] font-medium leading-snug text-[#1C1917]">{t.message}</p>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
