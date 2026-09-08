// Formato consistente es-CO para todo el admin
export function fmtNum(n: number) {
  return n.toLocaleString("es-CO");
}

export function fmtPct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

// YYYY-MM-DD -> DD/MM/YYYY legible
export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

// Stamp para nombres de archivo: 2026-09-08
export function dateStamp(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function todayISO() {
  return dateStamp();
}
