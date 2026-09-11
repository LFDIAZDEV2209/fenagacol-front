"use client";
import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, FileSpreadsheet, Loader2 } from "lucide-react";

// Botón de exportación con estado de carga y pista de alcance.
// onExport genera el archivo (síncrono); el toast de éxito lo pone el caller.
export function ExportButton({
  onExport,
  label = "Exportar Excel",
  hint = "Datos filtrados",
  className = "",
}: {
  onExport: () => void | Promise<void>;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const [busy, setBusy] = React.useState(false);

  async function run() {
    if (busy) return;
    setBusy(true);
    try {
      await onExport();
    } finally {
      window.setTimeout(() => setBusy(false), 700);
    }
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      title={hint ? `${label} — ${hint.toLowerCase()}` : label}
      className={`group inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3.5 text-[13px] font-semibold text-[#732427] shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0 ${className}`}
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} className="transition-transform duration-200 group-hover:scale-110" />}
      {busy ? "Generando..." : label}
      {hint && !busy && (
        <span className="hidden rounded-full bg-[#F8EDEF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#732427] sm:inline">
          {hint}
        </span>
      )}
    </button>
  );
}

// Botón — rosa principal, compacto, con feedback táctil
export function Button({
  variant = "primary",
  size = "lg",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#732427] focus-visible:ring-offset-2";
  const sizes = {
    sm: "h-8 px-3.5 text-[13px]",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-[15px] font-semibold",
  };
  const variants = {
    primary:
      "bg-gradient-to-br from-[#732427] to-[#481418] text-white hover:brightness-110 hover:shadow-[0_8px_22px_rgba(115,36,39,0.42)] active:brightness-95 shadow-[0_4px_14px_rgba(115,36,39,0.32)]",
    secondary:
      "bg-white text-[#1C1917] border border-[#E7E2D9] hover:bg-[#FAFAF8] hover:shadow-sm",
    ghost: "bg-transparent text-[#1C1917] hover:bg-[#F1EFEA]",
    outline:
      "bg-white border-2 border-[#732427] text-[#732427] hover:bg-[#F8EDEF]",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-[#EDE9E1] bg-white shadow-[0_1px_2px_rgba(28,25,23,0.05)] transition-shadow duration-200 ${className}`}
      {...props}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; compact?: boolean }) {
  const { error, compact, className = "", ...rest } = props;
  return (
    <div className="w-full">
      <input
        className={`w-full rounded-xl border bg-white text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#732427] focus:ring-4 focus:ring-[#732427]/10 ${compact ? "h-10 px-3 text-[13px]" : "h-12 px-4 text-[15px]"} ${error ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100" : "border-[#E7E2D9]"} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-[13px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`mb-1.5 block text-[13px] font-semibold text-[#1C1917] ${className}`} {...props} />;
}

export function Badge({ className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F8EDEF] text-[#732427] border border-[#E8CDD4] ${className}`}
      {...props}
    />
  );
}

// Combobox con búsqueda — accesible y liviano
export function Combobox({
  label,
  placeholder = "Buscar...",
  options,
  value,
  onChange,
  error,
  disabled,
}: {
  label?: React.ReactNode;
  placeholder?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {label && <Label>{label}</Label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm transition-all ${disabled ? "cursor-not-allowed bg-[#FAFAF8] text-[#A8A29E]" : "hover:border-[#732427]/50 hover:shadow-sm"} ${error ? "border-red-400 bg-red-50/30" : "border-[#E7E2D9]"} ${open ? "border-[#732427] ring-4 ring-[#732427]/10" : ""}`}
      >
        <span className={`truncate ${selected ? "text-[#1C1917]" : "text-[#A8A29E]"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {error && <p className="mt-1.5 text-[13px] font-medium text-red-600">{error}</p>}
      {open && (
        <div className="animate-pop-in absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[#E7E2D9] bg-white shadow-[0_16px_40px_rgba(28,25,23,0.16)]">
          <div className="border-b border-[#F1EFEA] bg-[#FAFAF8] p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar..."
              className="h-9 w-full rounded-lg border border-[#E7E2D9] bg-white px-3 text-[13px] outline-none placeholder:text-[#A8A29E] focus:border-[#732427]"
            />
          </div>
          <div className="max-h-[220px] overflow-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="py-7 text-center text-[13px] text-[#A8A29E]">Sin resultados</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors hover:bg-[#F8EDEF] active:bg-[#E8CDD4]/50 ${value === o.value ? "bg-[#F8EDEF] font-semibold text-[#732427]" : "text-[#1C1917]"}`}
                >
                  <span className="truncate">{o.label}</span>
                  {value === o.value && <span className="text-[#732427]">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Encabezado de tabla ordenable: click alterna asc/desc. aria-sort para lector de pantalla.
export function SortTh({
  label,
  active,
  dir,
  onToggle,
  className = "px-3 py-2.5",
  title,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onToggle: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <th aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"} className={`font-semibold ${className}`}>
      <button
        onClick={onToggle}
        title={title ?? `Ordenar por ${label.toLowerCase()}`}
        className="inline-flex cursor-pointer items-center gap-1.5 hover:text-white"
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp size={12} className="text-white" /> : <ArrowDown size={12} className="text-white" />
        ) : (
          <ArrowUpDown size={12} className="text-white/40" />
        )}
      </button>
    </th>
  );
}

// Encabezado admin con fondo del color principal
export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up relative overflow-hidden rounded-xl bg-gradient-to-br from-[#732427] to-[#481418] p-4 text-white shadow-[0_10px_28px_rgba(115,36,39,0.32)] sm:p-5">
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/20 blur-2xl" />
      <div className="relative flex flex-wrap items-center gap-3.5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/15">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold leading-tight sm:text-[22px]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-white/75">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// Progress del formulario público
export function Progress({ value, max = 4 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8CDD4]">
      <div className="h-full rounded-full bg-[#732427] transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
