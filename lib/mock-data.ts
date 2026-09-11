// Datos mock realistas — estructura compatible con Supabase/Postgres
// Territorio canónico en ./divipola (DIVIPOLA DANE, generado); aquí solo re-export compat.
import { DEPARTMENTS, MUNICIPALITIES, getMunicipalitiesByDept } from "./divipola";
export { DEPARTMENTS, MUNICIPALITIES, deptName, muniName, getMunicipalitiesByDept } from "./divipola";
export type { Department, Municipality } from "./divipola";
export type Association = { id: string; name: string; departmentId: string; municipalityId: string; members: number };
export type Person = {
  id: string;
  fullName: string;
  identity: string;
  phone: string;
  email?: string;
  departmentId: string;
  municipalityId: string;
  roles: string[];
  associationId?: string;
  createdAt: string;
};

export const ROLES = ["Gallero", "Cuidador", "Comerciante", "Entusiasta", "Criador", "Otro"] as const;

// Catálogo vigente (territorio provisional 11/11001 — completar en Configuración).
// Espejo del seed en DB; si difieren, manda el servidor.
export const ASSOCIATIONS: Association[] = [
  { id: "asocgalf", name: "ASOCGALF", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogain", name: "ASOGAIN", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogatlan", name: "ASOGATLAN", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogasins", name: "ASOGASINS", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogacb", name: "ASOGACB", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogacor", name: "ASOGACOR", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogallmet", name: "ASOGALLMET", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogallospitalito", name: "ASOGALLOS PITALITO", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogalco", name: "ASOGALCO", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogahuila", name: "ASOGAHUILA", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogacauca", name: "ASOGACAUCA", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogacundi", name: "ASOGACUNDI", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogacbol", name: "ASOGACBOL", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asocoljueces", name: "ASOCOLJUECES", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asocojuvial", name: "ASOCOJUVIAL", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogamelgar", name: "ASOGAMELGAR", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogamac", name: "ASOGAMAC", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogoss", name: "ASOGOSS", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "gallcor", name: "GALLCOR", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogademom", name: "ASOGADEMOM", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogasum", name: "ASOGASUM", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogaap", name: "ASOGAAP", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogamayo", name: "ASOGAMAYO", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogalltauremena", name: "ASOGALLTAUREMENA", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogasur", name: "ASOGASUR", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogaquilla", name: "ASOGAQUILLA", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogacol", name: "ASOGACOL", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogsdemon", name: "ASOGSDEMON", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asogadisrio", name: "ASOGADISRIO", departmentId: "11", municipalityId: "11001", members: 0 },
  { id: "asoencria", name: "ASOENCRÍA", departmentId: "11", municipalityId: "11001", members: 0 },
];

// Personas mock — 92 registros variados para tablas y KPIs
const nombres = [
  "Carlos Andrés Pushaina",
  "José Luis Epiayú",
  "María Fernanda Uriana",
  "Luis Alberto Ipuana",
  "Yurani González",
  "Jorge Eliécer Barros",
  "Ana Milena Redondo",
  "Pedro Miguel Arpushana",
  "Rosa Elena Mengual",
  "Ever David López",
  "Lisandro Gómez",
  "Darwin Curvelo",
  "Yulieth Sierra",
  "Héctor Julio Morales",
  "Ronal Jayariyú",
  "Edinson Fernández",
  "Carmen Alicia Pinto",
  "Fredys Pérez",
  "Maicol Solano",
  "Nayelis Ureche",
  "Wilmer Amaya",
  "Diana Marcela Ortega",
  "Jhon Jairo Castaño",
  "Olga Lucía Mejía",
  "Santiago Rivera",
  "Camila Duarte",
  "Arcadio Brito",
  "Leonor Bolaño",
  "Eder Gutiérrez",
  "Luz Marina Zúñiga",
  "Franklin Ramírez",
  "Karen Dayana Móvil",
  "Oscar Iván Quintero",
  "Mileidy Roys",
  "Albeiro Coronado",
  "Yeison Palmar",
  "Deimer Ortiz",
  "Yasmin Epieyú",
  "Esteban Cuadrado",
  "Ledis Aguilar",
];

function randomDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * offsetDays));
  return d.toISOString().slice(0, 10);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const PEOPLE: Person[] = Array.from({ length: 92 }, (_, i) => {
  const dept = pick(DEPARTMENTS);
  const munis = getMunicipalitiesByDept(dept.id);
  const muni = pick(munis.length ? munis : MUNICIPALITIES);
  const roleCount = Math.random() < 0.7 ? 1 : Math.random() < 0.85 ? 2 : 3;
  const roles = Array.from({ length: roleCount }, () => pick([...ROLES])).filter((v, idx, a) => a.indexOf(v) === idx);
  const hasAssoc = Math.random() < 0.62;
  const assocInDept = ASSOCIATIONS.filter((a) => a.departmentId === dept.id);
  const assoc = hasAssoc ? pick(assocInDept.length ? assocInDept : ASSOCIATIONS) : undefined;
  const baseName = nombres[i % nombres.length];
  return {
    id: `p${String(i + 1).padStart(4, "0")}`,
    fullName: i < 30 ? baseName : `${pick(nombres).split(" ")[0]} ${pick(nombres).split(" ").slice(-1)[0]} ${pick(["Epiayú", "Ipuana", "Uriana", "Pushaina", "Arpushana", "González", "López", "Barros", "Solano"])}`,
    identity: `${10000000 + Math.floor(Math.random() * 90000000)}`,
    phone: `3${Math.floor(100000000 + Math.random() * 899999999)}`,
    email: Math.random() < 0.45 ? `${baseName.split(" ")[0].toLowerCase()}.${i}@correo.co` : undefined,
    departmentId: dept.id,
    municipalityId: muni.id,
    roles,
    associationId: assoc?.id,
    createdAt: randomDate(120),
  };
}).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

// Inyecta algunos registros fijos para que La Guajira siempre tenga volumen alto (story)
for (let i = 0; i < 18; i++) {
  const m = pick(getMunicipalitiesByDept("44"));
  PEOPLE.push({
    id: `pg${i}`,
    fullName: pick(nombres),
    identity: `${11000000 + i}${Math.floor(Math.random() * 9000)}`,
    phone: `300${Math.floor(1000000 + Math.random() * 9000000)}`,
    departmentId: "44",
    municipalityId: m.id,
    roles: [pick(["Gallero", "Criador", "Cuidador"])],
    associationId: pick(["asocgalf", "asogain", "asogatlan", "asogasins"]),
    createdAt: randomDate(30),
  });
}

// Helpers de lookup (territorio vive en ./divipola)
export function assocName(id?: string) {
  if (!id) return "Sin asociación";
  return ASSOCIATIONS.find((a) => a.id === id)?.name ?? "—";
}

// KPIs calculados para dashboard (mock estables, no recalcular en cada render)
export const KPI = {
  total: 12482,
  galleros: 5241,
  asociados: 7830,
  municipios: 184,
};

export const DEPT_BARS = [
  { name: "Antioquia", value: 2450 },
  { name: "La Guajira", value: 1830 },
  { name: "Atlántico", value: 1420 },
  { name: "Bolívar", value: 1120 },
  { name: "Córdoba", value: 980 },
  { name: "Magdalena", value: 850 },
  { name: "Cesar", value: 740 },
  { name: "Santander", value: 620 },
  { name: "Valle del Cauca", value: 590 },
  { name: "Sucre", value: 480 },
];

export const ROLE_DONUT = [
  { label: "Gallero", value: 38, color: "#6b1220" },
  { label: "Criador", value: 18, color: "#b4532a" },
  { label: "Cuidador", value: 14, color: "#d9a441" },
  { label: "Comerciante", value: 12, color: "#7a6e5a" },
  { label: "Entusiasta", value: 11, color: "#9ab0a0" },
  { label: "Otro", value: 7, color: "#e8ddd0" },
];
