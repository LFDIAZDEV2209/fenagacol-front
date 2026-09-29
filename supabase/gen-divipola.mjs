// Generador DIVIPOLA -> lib/divipola.json (fuentes: datos.gov.co xaxy-8nri corte dic-2024
// [cabeceras municipales + centros poblados] y gdxc-w37w [municipios + ANCAP], DANE).
// Uso: node supabase/gen-divipola.mjs
// Sync no-destructivo por código: agrega entidades que falten, CORRIGE nombres
// desalineados contra el oficial (conserva abreviaciones históricas de UI cuando
// el nombre local es palabra del oficial, p. ej. Bogotá, Cali, Cúcuta) y genera
// la lista de centros poblados (pueblos) como parte del catálogo territorial.
// Luego ejecutar `node supabase/seed-divipola.mjs` para el espejo en DB.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const jsonPath = fileURLToPath(new URL("../lib/divipola.json", import.meta.url));
const load = async (url) => {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} descargando ${url}`);
  return r.json();
};

const [xaxy, gdxc] = await Promise.all([
  load("https://www.datos.gov.co/resource/xaxy-8nri.json?$limit=50000"),
  load("https://www.datos.gov.co/resource/gdxc-w37w.json?$limit=50000"),
]);

const norm = (s) => String(s).normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
const normWord = (s) => norm(s).replace(/[,.]/g, "");

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

// Abreviación legítima: el nombre local aparece como palabra entera del oficial
// (sin puntuación). Evita sobreescribir decisiones históricas de UI (Bogotá, Cali, Cartagena, Cúcuta).
const esAbreviacion = (local, oficial) => normWord(oficial).split(" ").includes(normWord(local));

const local = JSON.parse(readFileSync(jsonPath, "utf8"));
const departments = [...local.departments].sort((a, b) => a.code.localeCompare(b.code));
const municipalities = [...local.municipalities];
const muniByCode = new Map(municipalities.map((m) => [m.code, m]));

let fixedNames = 0;
const fixed = [];
// Municipios: xaxy CM (1104 con cabecera) — código + nombre_oficial
for (const r of xaxy.filter((x) => x.tipo_centro_poblado === "CM")) {
  const code = String(r.codigo_municipio).trim();
  const existente = muniByCode.get(code);
  if (!existente) {
    municipalities.push({ code, departmentCode: String(r.codigo_departamento).trim(), name: titleCaseEs(r.nombre_municipio) });
    muniByCode.set(code, { name: "" });
    continue;
  }
  if (!esAbreviacion(existente.name, r.nombre_municipio)) {
    const nuevo = titleCaseEs(r.nombre_municipio);
    if (norm(existente.name) !== norm(nuevo)) { existente.name = nuevo; fixedNames++; fixed.push(code); }
  }
}
// ANCAP: municipios sin centros poblados — solo están en gdxc
for (const r of gdxc) {
  const code = String(r.cod_mpio).trim();
  if (muniByCode.has(code)) continue;
  if (String(r.tipo_municipio ?? "").includes("no municipalizada")) {
    municipalities.push({ code, departmentCode: String(r.cod_dpto).trim(), name: titleCaseEs(r.nom_mpio) });
    muniByCode.set(code, { name: "" });
  }
}

// Centros poblados (pueblos): 7057 CP, código divipola de 8 dígitos
const centrosPoblados = [];
const cpVistos = new Set();
for (const r of xaxy.filter((x) => x.tipo_centro_poblado === "CP")) {
  const code = String(r.codigo_centro_poblado).trim();
  if (!/^\d{8}$/.test(code) || cpVistos.has(code)) continue;
  cpVistos.add(code);
  const departmentCode = String(r.codigo_departamento).trim();
  const muniCode = String(r.codigo_municipio).trim();
  const muniName = titleCaseEs(r.nombre_municipio);
  let name = titleCaseEs(r.nombre_centro_poblado);
  // Desambiguar pueblos homónimos dentro del mismo departamento
  const sameDept = centrosPoblados.filter((c) => c.departmentCode === departmentCode);
  if (sameDept.some((c) => norm(c.name) === norm(name))) name = `${name} — ${muniName}`;
  centrosPoblados.push({ code, departmentCode, municipalityCode: muniCode, name });
}

departments.sort((a, b) => a.code.localeCompare(b.code));
municipalities.sort((a, b) => a.code.localeCompare(b.code));
centrosPoblados.sort((a, b) => a.code.localeCompare(b.code));

// Validaciones
const codigosMunis = new Set(municipalities.map((m) => m.code));
const faltanMunis = [...muniByCode.keys()].filter((c) => /^\d{5}$/.test(c) && !codigosMunis.has(c));
if (faltanMunis.length) throw new Error(`Municipios faltantes: ${faltanMunis}`);
const orfanos = centrosPoblados.filter((c) => !muniByCode.has(c.municipalityCode));
if (orfanos.length) throw new Error(`Centros poblados con municipio inexistente: ${orfanos.length}`);
const huérfanosDepto = [...departments].filter((d) => !/^(\d{2})$/.test(d.code));
if (huérfanosDepto.length) throw new Error("Departamentos con código inválido");

const antesMunis = local.municipalities.length;
if (fixedNames || antesMunis !== municipalities.length || local.centrosPoblados?.length !== centrosPoblados.length) {
  writeFileSync(jsonPath, JSON.stringify({ departments, municipalities, centrosPoblados }, null, 2) + "\n");
} else {
  console.log("Sin cambios respecto al JSON actual.");
}
console.log(`DIVIPOLA OK: ${departments.length} departamentos, ${municipalities.length} municipios, ${centrosPoblados.length} centros poblados (pueblos)`);
if (fixedNames) console.log(`Nombres de municipios corregidos: ${fixedNames}`);
