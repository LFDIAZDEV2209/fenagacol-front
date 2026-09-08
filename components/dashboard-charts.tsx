"use client";
import { DEPT_BARS, ROLE_DONUT } from "@/lib/mock-data";

export function BarsByDept() {
  const max = Math.max(...DEPT_BARS.map((d) => d.value));
  return (
    <div className="space-y-3">
      {DEPT_BARS.map((d, i) => (
        <div key={d.name} className="group flex cursor-default items-center gap-3">
          <span className="w-[112px] truncate text-sm font-medium text-[#1c1a17]">{d.name}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#f0e8d5]">
            <div
              className="animate-bar h-full rounded-full bg-gradient-to-r from-[#6b1220] to-[#b4532a] transition-all duration-300 group-hover:brightness-110"
              style={{ width: `${(d.value / max) * 100}%`, animationDelay: `${i * 0.06}s` }}
            />
          </div>
          <span className="w-12 text-right text-sm font-semibold text-[#1c1a17]">{d.value.toLocaleString("es-CO")}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutByRole() {
  const total = ROLE_DONUT.reduce((a, b) => a + b.value, 0);
  let acc = 0;
  const segments = ROLE_DONUT.map((r) => {
    const start = acc;
    acc += r.value;
    return { ...r, start, end: acc };
  });

  // Build conic gradient
  const gradient = segments
    .map((s) => `${s.color} ${(s.start / total) * 100}% ${(s.end / total) * 100}%`)
    .join(", ");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="animate-pop-in relative h-[160px] w-[160px] shrink-0 rounded-full transition-transform duration-300 hover:scale-[1.03]" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="absolute inset-[18px] grid place-items-center rounded-full border border-[#f0e8d5] bg-white">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-[#1c1a17]">{total}%</p>
            <p className="text-[11px] tracking-widest uppercase text-[#9a8d78] font-semibold">Distribución</p>
          </div>
        </div>
      </div>
      <div className="grid w-full flex-1 grid-cols-2 gap-3">
        {ROLE_DONUT.map((r) => (
          <div key={r.label} className="flex cursor-default items-center gap-2.5 rounded-xl border border-[#ece2d1] bg-[#fdf8ef] p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: r.color }} />
            <div>
              <p className="text-sm font-medium text-[#1c1a17] leading-none">{r.label}</p>
              <p className="mt-1 text-xs text-[#7a6e5a]">{r.value}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
