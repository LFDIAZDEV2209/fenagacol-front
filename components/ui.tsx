"use client";
import * as React from "react";

// Botón primario — burgundy profundo, grande y accesible
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
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b1220] focus-visible:ring-offset-2";
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-[15px]",
    lg: "h-[52px] px-7 text-[16px] font-semibold",
  };
  const variants = {
    primary:
      "bg-[#6b1220] text-[#fff7e8] hover:bg-[#7e1730] active:bg-[#5a1020] shadow-[0_4px_14px_rgba(107,18,32,0.22)]",
    secondary:
      "bg-[#fff] text-[#1c1a17] border border-[#e8ddd0] hover:bg-[#fdf6e8] shadow-sm",
    ghost: "bg-transparent text-[#1c1a17] hover:bg-[#f0e8d5]",
    outline:
      "bg-white border-2 border-[#6b1220] text-[#6b1220] hover:bg-[#fdf6e8]",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#ece2d1] shadow-[0_8px_30px_rgba(28,26,23,0.06),0_1px_8px_rgba(28,26,23,0.07)] transition-shadow duration-200 ${className}`}
      {...props}
    />
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
    <div className="animate-fade-up relative overflow-hidden rounded-2xl bg-[#6b1220] text-[#fff7e8] p-5 sm:p-6 shadow-[0_12px_30px_rgba(107,18,32,0.28)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/20 blur-2xl" />
      <div className="relative flex flex-wrap items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 border border-white/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[22px] sm:text-2xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/75">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className = "", ...rest } = props;
  return (
    <div className="w-full">
      <input
        className={`w-full h-[52px] px-4 rounded-xl bg-white border text-[16px] placeholder:text-[#9a8d78] text-[#1c1a17] transition-colors outline-none focus:border-[#6b1220] focus:ring-4 focus:ring-[#6b1220]/10 ${error ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100" : "border-[#e8ddd0]"} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-[13px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-[14px] font-semibold text-[#1c1a17] mb-2 ${className}`} {...props} />;
}

export function Badge({ className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0e8d5] text-[#6b1220] border border-[#e8ddd0] ${className}`}
      {...props}
    />
  );
}

// Combobox searchable simple sin dependencias externas — accesible y liviano
export function Combobox({
  label,
  placeholder = "Buscar...",
  options,
  value,
  onChange,
  error,
  disabled,
}: {
  label?: string;
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
        className={`w-full h-[52px] px-4 rounded-xl border bg-white text-left flex items-center justify-between text-[15px] transition-all cursor-pointer ${disabled ? "bg-[#f8f3e8] text-[#9a8d78] cursor-not-allowed" : "hover:border-[#6b1220]/50 hover:shadow-sm"} ${error ? "border-red-400 bg-red-50/30" : "border-[#e8ddd0]"} ${open ? "border-[#6b1220] ring-4 ring-[#6b1220]/10" : ""}`}
      >
        <span className={selected ? "text-[#1c1a17]" : "text-[#9a8d78]"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a8d78" strokeWidth="2" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {error && <p className="mt-1.5 text-[13px] text-red-600 font-medium">{error}</p>}
      {open && (
        <div className="absolute z-40 mt-2 w-full bg-white rounded-xl border border-[#e8ddd0] shadow-[0_16px_40px_rgba(28,26,23,0.14)] overflow-hidden">
          <div className="p-2 border-b border-[#f0e8d5] bg-[#fdf8ef]">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full h-10 px-3 rounded-lg border border-[#e8ddd0] bg-white text-sm outline-none focus:border-[#6b1220] placeholder:text-[#9a8d78]"
            />
          </div>
          <div className="max-h-[220px] overflow-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#9a8d78]">Sin resultados</p>
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
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between cursor-pointer transition-colors hover:bg-[#fdf6e8] active:bg-[#f0e8d5] ${value === o.value ? "bg-[#f8f3e8] text-[#6b1220] font-semibold" : "text-[#1c1a17]"}`}
                >
                  {o.label}
                  {value === o.value && <span className="text-[#6b1220]">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Progress simple
export function Progress({ value, max = 4 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="w-full h-2 bg-[#f0e8d5] rounded-full overflow-hidden">
      <div className="h-full bg-[#6b1220] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
