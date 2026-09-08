"use client";

// Gráficas SVG livianas (sin dependencias pesadas). Todas reciben datos ya
// filtrados: responden a los filtros del admin.
export const ROLE_COLORS = ["#BE123C", "#E11D48", "#F472A6", "#B4532A", "#D9A441", "#78716C", "#A8A29E"];

export function HBarList({ items }: { items: { name: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((d) => d.value));
  if (!items.length) return <p className="py-6 text-center text-[13px] text-[#A8A29E]">Sin datos con esos filtros</p>;
  return (
    <div className="space-y-2.5">
      {items.map((d, i) => (
        <div key={d.name} className="group flex cursor-default items-center gap-2.5">
          <span className="w-[104px] truncate text-[13px] font-medium text-[#1C1917]" title={d.name}>{d.name}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F1EFEA]">
            <div
              className="animate-bar h-full rounded-full bg-gradient-to-r from-[#BE123C] to-[#F472A6] transition-all duration-300 group-hover:brightness-110"
              style={{ width: `${(d.value / max) * 100}%`, animationDelay: `${Math.min(i, 8) * 0.05}s` }}
            />
          </div>
          <span className="w-10 text-right text-[13px] font-semibold text-[#1C1917]">{d.value.toLocaleString("es-CO")}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({ data }: { data: { label: string; value: number; key: string }[] }) {
  const W = 600;
  const H = 170;
  const PAD = { l: 8, r: 8, t: 10, b: 24 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length;
  const x = (i: number) => PAD.l + (i / Math.max(1, n - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${PAD.l},${H - PAD.b} ${pts} ${x(n - 1)},${H - PAD.b}`;
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-[13px] text-[#78716C]">
          <span className="font-display text-xl font-bold text-[#1C1917]">{total.toLocaleString("es-CO")}</span> registros en 12 semanas
        </p>
        <p className="text-[11px] font-medium text-[#A8A29E]">máx/sem {max}</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Tendencia de registros por semana">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BE123C" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#BE123C" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD.l} x2={W - PAD.r} y1={y(max * f)} y2={y(max * f)} stroke="#E7E2D9" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        <polygon points={area} fill="url(#trendFill)" />
        <polyline points={pts} fill="none" stroke="#BE123C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) =>
          i % 2 === 0 || i === n - 1 ? (
            <text key={d.key} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#A8A29E">{d.label}</text>
          ) : null
        )}
        {data.map((d, i) => (
          <circle key={d.key} cx={x(i)} cy={y(d.value)} r={d.value === max && max > 0 ? 4 : 2.5} fill={d.value === max && max > 0 ? "#BE123C" : "#fff"} stroke="#BE123C" strokeWidth="2">
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export function Donut({ items }: { items: { label: string; value: number }[] }) {
  const total = items.reduce((a, b) => a + b.value, 0);
  if (!total) return <p className="py-6 text-center text-[13px] text-[#A8A29E]">Sin datos con esos filtros</p>;
  let acc = 0;
  const segs = items.map((r, i) => {
    const start = acc;
    acc += r.value;
    return { ...r, start, end: acc, color: ROLE_COLORS[i % ROLE_COLORS.length] };
  });
  const gradient = segs.map((s) => `${s.color} ${(s.start / total) * 100}% ${(s.end / total) * 100}%`).join(", ");

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="animate-pop-in relative h-[148px] w-[148px] shrink-0 rounded-full transition-transform duration-300 hover:scale-[1.03]" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="absolute inset-[16px] grid place-items-center rounded-full border border-[#F1EFEA] bg-white">
          <div className="text-center">
            <p className="font-display text-xl font-bold text-[#1C1917]">{total.toLocaleString("es-CO")}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A29E]">Registros</p>
          </div>
        </div>
      </div>
      <div className="grid w-full flex-1 grid-cols-2 gap-2">
        {segs.map((r) => (
          <div key={r.label} className="flex cursor-default items-center gap-2 rounded-lg border border-[#EDE9E1] bg-[#FAFAF8] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium leading-none text-[#1C1917]">{r.label}</p>
              <p className="mt-1 text-[11px] text-[#78716C]">{r.value} · {Math.round((r.value / total) * 100)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
