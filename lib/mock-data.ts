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

export const ASSOCIATIONS: Association[] = [
  { id: "a1", name: "Asociación de Galleros de La Guajira", departmentId: "44", municipalityId: "44001", members: 420 },
  { id: "a2", name: "Asogalleros del Caribe", departmentId: "08", municipalityId: "08001", members: 380 },
  { id: "a3", name: "Fenagacol - Seccional Antioquia", departmentId: "05", municipalityId: "05001", members: 610 },
  { id: "a4", name: "Gremio Gallístico del Atlántico", departmentId: "08", municipalityId: "08606", members: 210 },
  { id: "a5", name: "Asociación Campesina del Cesar", departmentId: "20", municipalityId: "20001", members: 305 },
  { id: "a6", name: "Asoguajira - Maicao", departmentId: "44", municipalityId: "44430", members: 270 },
  { id: "a7", name: "Criadores de Santander", departmentId: "68", municipalityId: "68001", members: 190 },
  { id: "a8", name: "Colectivo Gallero de Córdoba", departmentId: "23", municipalityId: "23001", members: 340 },
  { id: "a9", name: "Asociación Vallecaucana de Galleros", departmentId: "76", municipalityId: "76001", members: 455 },
  { id: "a10", name: "Gremio Rural de Bolívar", departmentId: "13", municipalityId: "13001", members: 260 },
  { id: "a11", name: "Asociación de Cuidadores del Magdalena", departmentId: "47", municipalityId: "47001", members: 145 },
  { id: "a12", name: "Federación Campesina Huilense", departmentId: "41", municipalityId: "41001", members: 220 },
  { id: "a13", name: "Asogalleros de Uribia", departmentId: "44", municipalityId: "44847", members: 180 },
  { id: "a14", name: "Comerciantes Gallísticos de Cúcuta", departmentId: "54", municipalityId: "54001", members: 165 },
  { id: "a15", name: "Entusiastas del Tolima", departmentId: "73", municipalityId: "73001", members: 130 },
  { id: "a16", name: "Asociación de Criadores de Meta", departmentId: "50", municipalityId: "50001", members: 95 },
  { id: "a17", name: "Gremio Gallero de Sucre", departmentId: "70", municipalityId: "70001", members: 175 },
  { id: "a18", name: "Asociación Rural de La Guajira Sur", departmentId: "44", municipalityId: "44650", members: 310 },
  { id: "a19", name: "Asocaldas", departmentId: "17", municipalityId: "17001", members: 110 },
  { id: "a20", name: "Asociación Nariñense de Galleros", departmentId: "52", municipalityId: "52001", members: 80 },
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
    associationId: pick(["a1", "a6", "a13", "a18"]),
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
