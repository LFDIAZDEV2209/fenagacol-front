// Datos mock realistas — estructura compatible con Supabase/Postgres
// DIVIPOLA, roles, personas, asociaciones, KPIs

export type Department = { id: string; divipola: string; name: string };
export type Municipality = { id: string; divipola: string; departmentId: string; name: string };
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

export const DEPARTMENTS: Department[] = [
  { id: "05", divipola: "05", name: "Antioquia" },
  { id: "08", divipola: "08", name: "Atlántico" },
  { id: "11", divipola: "11", name: "Bogotá D.C." },
  { id: "13", divipola: "13", name: "Bolívar" },
  { id: "15", divipola: "15", name: "Boyacá" },
  { id: "17", divipola: "17", name: "Caldas" },
  { id: "18", divipola: "18", name: "Caquetá" },
  { id: "19", divipola: "19", name: "Cauca" },
  { id: "20", divipola: "20", name: "Cesar" },
  { id: "23", divipola: "23", name: "Córdoba" },
  { id: "25", divipola: "25", name: "Cundinamarca" },
  { id: "27", divipola: "27", name: "Chocó" },
  { id: "41", divipola: "41", name: "Huila" },
  { id: "44", divipola: "44", name: "La Guajira" },
  { id: "47", divipola: "47", name: "Magdalena" },
  { id: "50", divipola: "50", name: "Meta" },
  { id: "52", divipola: "52", name: "Nariño" },
  { id: "54", divipola: "54", name: "Norte de Santander" },
  { id: "63", divipola: "63", name: "Quindío" },
  { id: "66", divipola: "66", name: "Risaralda" },
  { id: "68", divipola: "68", name: "Santander" },
  { id: "70", divipola: "70", name: "Sucre" },
  { id: "73", divipola: "73", name: "Tolima" },
  { id: "76", divipola: "76", name: "Valle del Cauca" },
  { id: "81", divipola: "81", name: "Arauca" },
  { id: "85", divipola: "85", name: "Casanare" },
  { id: "86", divipola: "86", name: "Putumayo" },
  { id: "88", divipola: "88", name: "Archipiélago de San Andrés" },
  { id: "91", divipola: "91", name: "Amazonas" },
  { id: "94", divipola: "94", name: "Guainía" },
  { id: "95", divipola: "95", name: "Guaviare" },
  { id: "99", divipola: "99", name: "Vichada" },
];

export const MUNICIPALITIES: Municipality[] = [
  // Antioquia
  { id: "05001", divipola: "05001", departmentId: "05", name: "Medellín" },
  { id: "05002", divipola: "05002", departmentId: "05", name: "Abejorral" },
  { id: "05045", divipola: "05045", departmentId: "05", name: "Apartadó" },
  { id: "05129", divipola: "05129", departmentId: "05", name: "Caldas" },
  { id: "05266", divipola: "05266", departmentId: "05", name: "Envigado" },
  { id: "05360", divipola: "05360", departmentId: "05", name: "Itagüí" },
  { id: "05615", divipola: "05615", departmentId: "05", name: "Rionegro" },
  { id: "05847", divipola: "05847", departmentId: "05", name: "Urrao" },
  // Atlántico
  { id: "08001", divipola: "08001", departmentId: "08", name: "Barranquilla" },
  { id: "08078", divipola: "08078", departmentId: "08", name: "Baranoa" },
  { id: "08296", divipola: "08296", departmentId: "08", name: "Galapa" },
  { id: "08433", divipola: "08433", departmentId: "08", name: "Malambo" },
  { id: "08520", divipola: "08520", departmentId: "08", name: "Palmar de Varela" },
  { id: "08573", divipola: "08573", departmentId: "08", name: "Puerto Colombia" },
  { id: "08606", divipola: "08606", departmentId: "08", name: "Sabanalarga" },
  { id: "08758", divipola: "08758", departmentId: "08", name: "Soledad" },
  // Bogotá
  { id: "11001", divipola: "11001", departmentId: "11", name: "Bogotá" },
  // Bolívar
  { id: "13001", divipola: "13001", departmentId: "13", name: "Cartagena" },
  { id: "13052", divipola: "13052", departmentId: "13", name: "Arjona" },
  { id: "13430", divipola: "13430", departmentId: "13", name: "Magangué" },
  { id: "13657", divipola: "13657", departmentId: "13", name: "San Juan Nepomuceno" },
  { id: "13836", divipola: "13836", departmentId: "13", name: "Turbaco" },
  // Boyacá
  { id: "15001", divipola: "15001", departmentId: "15", name: "Tunja" },
  { id: "15047", divipola: "15047", departmentId: "15", name: "Aquitania" },
  { id: "15238", divipola: "15238", departmentId: "15", name: "Duitama" },
  { id: "15759", divipola: "15759", departmentId: "15", name: "Sogamoso" },
  // Caldas
  { id: "17001", divipola: "17001", departmentId: "17", name: "Manizales" },
  { id: "17380", divipola: "17380", departmentId: "17", name: "La Dorada" },
  { id: "17433", divipola: "17433", departmentId: "17", name: "Manzanares" },
  // Caquetá
  { id: "18001", divipola: "18001", departmentId: "18", name: "Florencia" },
  { id: "18247", divipola: "18247", departmentId: "18", name: "El Doncello" },
  // Cauca
  { id: "19001", divipola: "19001", departmentId: "19", name: "Popayán" },
  { id: "19110", divipola: "19110", departmentId: "19", name: "Buenos Aires" },
  { id: "19300", divipola: "19300", departmentId: "19", name: "Guapi" },
  // Cesar
  { id: "20001", divipola: "20001", departmentId: "20", name: "Valledupar" },
  { id: "20011", divipola: "20011", departmentId: "20", name: "Aguachica" },
  { id: "20238", divipola: "20238", departmentId: "20", name: "El Copey" },
  // Córdoba
  { id: "23001", divipola: "23001", departmentId: "23", name: "Montería" },
  { id: "23068", divipola: "23068", departmentId: "23", name: "Ayapel" },
  { id: "23300", divipola: "23300", departmentId: "23", name: "Cotorra" },
  { id: "23417", divipola: "23417", departmentId: "23", name: "Lorica" },
  { id: "23570", divipola: "23570", departmentId: "23", name: "Pueblo Nuevo" },
  { id: "23807", divipola: "23807", departmentId: "23", name: "Tierralta" },
  // Cundinamarca
  { id: "25001", divipola: "25001", departmentId: "25", name: "Agua de Dios" },
  { id: "25293", divipola: "25293", departmentId: "25", name: "Gachancipá" },
  { id: "25473", divipola: "25473", departmentId: "25", name: "Mosquera" },
  { id: "25754", divipola: "25754", departmentId: "25", name: "Soacha" },
  { id: "25899", divipola: "25899", departmentId: "25", name: "Zipaquirá" },
  // Chocó
  { id: "27001", divipola: "27001", departmentId: "27", name: "Quibdó" },
  { id: "27205", divipola: "27205", departmentId: "27", name: "Condoto" },
  // Huila
  { id: "41001", divipola: "41001", departmentId: "41", name: "Neiva" },
  { id: "41298", divipola: "41298", departmentId: "41", name: "Garzón" },
  { id: "41524", divipola: "41524", departmentId: "41", name: "Palermo" },
  // La Guajira — foco guajiro
  { id: "44001", divipola: "44001", departmentId: "44", name: "Riohacha" },
  { id: "44035", divipola: "44035", departmentId: "44", name: "Albania" },
  { id: "44090", divipola: "44090", departmentId: "44", name: "Dibulla" },
  { id: "44430", divipola: "44430", departmentId: "44", name: "Maicao" },
  { id: "44560", divipola: "44560", departmentId: "44", name: "Manaure" },
  { id: "44650", divipola: "44650", departmentId: "44", name: "San Juan del Cesar" },
  { id: "44847", divipola: "44847", departmentId: "44", name: "Uribia" },
  { id: "44855", divipola: "44855", departmentId: "44", name: "Urumita" },
  { id: "44078", divipola: "44078", departmentId: "44", name: "Barrancas" },
  { id: "44279", divipola: "44279", departmentId: "44", name: "Fonseca" },
  // Magdalena
  { id: "47001", divipola: "47001", departmentId: "47", name: "Santa Marta" },
  { id: "47189", divipola: "47189", departmentId: "47", name: "Ciénaga" },
  { id: "47460", divipola: "47460", departmentId: "47", name: "Fundación" },
  { id: "47541", divipola: "47541", departmentId: "47", name: "Pivijay" },
  // Meta
  { id: "50001", divipola: "50001", departmentId: "50", name: "Villavicencio" },
  { id: "50226", divipola: "50226", departmentId: "50", name: "Cumaral" },
  { id: "50573", divipola: "50573", departmentId: "50", name: "Puerto López" },
  // Nariño
  { id: "52001", divipola: "52001", departmentId: "52", name: "Pasto" },
  { id: "52356", divipola: "52356", departmentId: "52", name: "Ipiales" },
  // Norte Santander
  { id: "54001", divipola: "54001", departmentId: "54", name: "Cúcuta" },
  { id: "54498", divipola: "54498", departmentId: "54", name: "Ocaña" },
  // Quindío
  { id: "63001", divipola: "63001", departmentId: "63", name: "Armenia" },
  { id: "63470", divipola: "63470", departmentId: "63", name: "Montenegro" },
  // Risaralda
  { id: "66001", divipola: "66001", departmentId: "66", name: "Pereira" },
  { id: "66400", divipola: "66400", departmentId: "66", name: "La Virginia" },
  // Santander
  { id: "68001", divipola: "68001", departmentId: "68", name: "Bucaramanga" },
  { id: "68276", divipola: "68276", departmentId: "68", name: "Floridablanca" },
  { id: "68861", divipola: "68861", departmentId: "68", name: "Vélez" },
  // Sucre
  { id: "70001", divipola: "70001", departmentId: "70", name: "Sincelejo" },
  { id: "70265", divipola: "70265", departmentId: "70", name: "Guaranda" },
  { id: "70508", divipola: "70508", departmentId: "70", name: "Ovejas" },
  // Tolima
  { id: "73001", divipola: "73001", departmentId: "73", name: "Ibagué" },
  { id: "73268", divipola: "73268", departmentId: "73", name: "Espinal" },
  { id: "73616", divipola: "73616", departmentId: "73", name: "Rioblanco" },
  // Valle
  { id: "76001", divipola: "76001", departmentId: "76", name: "Cali" },
  { id: "76111", divipola: "76111", departmentId: "76", name: "Buenaventura" },
  { id: "76520", divipola: "76520", departmentId: "76", name: "Palmira" },
  // Arauca, Casanare, Putumayo etc simplificado
  { id: "81001", divipola: "81001", departmentId: "81", name: "Arauca" },
  { id: "85001", divipola: "85001", departmentId: "85", name: "Yopal" },
  { id: "86001", divipola: "86001", departmentId: "86", name: "Mocoa" },
  { id: "88001", divipola: "88001", departmentId: "88", name: "San Andrés" },
  { id: "91001", divipola: "91001", departmentId: "91", name: "Leticia" },
  { id: "94001", divipola: "94001", departmentId: "94", name: "Inírida" },
  { id: "95001", divipola: "95001", departmentId: "95", name: "San José del Guaviare" },
  { id: "99001", divipola: "99001", departmentId: "99", name: "Puerto Carreño" },
];

export function getMunicipalitiesByDept(departmentId: string) {
  return MUNICIPALITIES.filter((m) => m.departmentId === departmentId);
}

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

// Helpers de lookup
export function deptName(id: string) {
  return DEPARTMENTS.find((d) => d.id === id)?.name ?? "—";
}
export function muniName(id: string) {
  return MUNICIPALITIES.find((m) => m.id === id)?.name ?? "—";
}
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
