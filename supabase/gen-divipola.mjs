// Generador DIVIPOLA -> lib/divipola.json (fuente: datos.gov.co gdxc-w37w, DANE).
// Uso: node supabase/gen-divipola.mjs
// No-destructivo: conserva por código los nombres históricos de la UI ya presentes
// en el JSON; agrega únicamente las entidades que falten (p. ej. los 18 ANCAP) en
// Title Case ES. Luego ejecutar `node supabase/seed-divipola.mjs` para la DB.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const URL_DATASET = "https://www.datos.gov.co/resource/gdxc-w37w.json?$limit=50000";
const jsonPath = fileURLToPath(new URL("../lib/divipola.json", import.meta.url));

const titleCaseEs = (s) =>
  s
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      if (/^[-–]$/.test(w)) return w;
      const lower = w.toLowerCase();
      if (i > 0 && ["de", "del", "la", "las", "los", "el", "en", "y"].includes(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");

const oficial = await fetch(URL_DATASET, { headers: { Accept: "application/json" } }).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status} descargando DIVIPOLA`);
  return r.json();
});

const local = JSON.parse(readFileSync(jsonPath, "utf8"));
const depts = [...local.departments];
const munis = [...local.municipalities];

const muniCodes = new Set(munis.map((m) => m.code));
const deptCodes = new Set(depts.map((d) => d.code));

let addedMunis = 0;
let addedDepts = 0;
const added = [];
for (const row of oficial) {
  const code = String(row.cod_mpio).trim();
  const dcode = String(row.cod_dpto).trim();
  const name = String(row.nom_mpio).normalize("NFC");
  if (!/^\d{5}$/.test(code) || !/^\d{2}$/.test(dcode)) continue;
  if (!muniCodes.has(code)) {
    munis.push({ code, departmentCode: dcode, name: titleCaseEs(name) });
    muniCodes.add(code);
    addedMunis++;
    added.push(`${code} ${titleCaseEs(name)}`);
  }
  if (!deptCodes.has(dcode)) {
    depts.push({ code: dcode, name: titleCaseEs(String(row.dpto).normalize("NFC")) });
    deptCodes.add(dcode);
    addedDepts++;
  }
}

depts.sort((a, b) => a.code.localeCompare(b.code));
munis.sort((a, b) => a.code.localeCompare(b.code));

const deptsOficiales = new Set(oficial.map((r) => String(r.cod_dpto).trim()));
const codigosOficiales = new Set(oficial.map((r) => String(r.cod_mpio).trim()).filter((c) => /^\d{5}$/.test(c)));
const faltanDepts = [...deptsOficiales].filter((c) => !deptCodes.has(c));
const faltanMunis = [...codigosOficiales].filter((c) => !muniCodes.has(c));
if (faltanDepts.length || faltanMunis.length) {
  throw new Error(`Inconsistencia tras el merge. Depts faltantes: ${faltanDepts} — Munis faltantes: ${faltanMunis}`);
}

if (addedMunis || addedDepts) {
  writeFileSync(jsonPath, JSON.stringify({ departments: depts, municipalities: munis }, null, 2) + "\n");
  console.log(`Agregados: ${addedDepts} departamentos, ${addedMunis} municipios/ANCAP`);
  console.log(added.map((a) => "  + " + a).join("\n"));
} else {
  console.log("Sin cambios: el JSON ya cubre todas las entidades del dataset oficial.");
}
console.log(`DIVIPOLA OK: ${depts.length} departamentos, ${munis.length} municipios`);
