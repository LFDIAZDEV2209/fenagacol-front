"use client";
import * as React from "react";
import { ASSOCIATIONS, PEOPLE, ROLES, type Person } from "./mock-data";
import { todayISO } from "./format";

// DEMO sementara: Supabase public schema está vacío (sin tablas), así que la
// configuración del admin y los registros del formulario se guardan en
// localStorage. Estructura lista para migrar a Supabase (tablas roles,
// associations, form_settings, people) sin cambiar los consumidores.

export type RoleOpt = { id: string; label: string; active: boolean; isOther?: boolean };
export type AssocOpt = {
  id: string;
  name: string;
  departmentId: string;
  municipalityId: string;
  active: boolean;
  members: number;
  custom?: boolean;
};
export type FormTexts = {
  moduleTitle: string;
  moduleSub: string;
  s1Title: string;
  s1Sub: string;
  s2Title: string;
  s2Sub: string;
  s3Title: string;
  s3Sub: string;
  s4Title: string;
  s4Sub: string;
  submitLabel: string;
};

type Config = {
  roles: RoleOpt[];
  assocs: AssocOpt[];
  deptOff: string[];
  texts: FormTexts;
  people: Person[];
};

const KEY = "fenagacol_cfg_v1";
const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");

const DEFAULT_TEXTS: FormTexts = {
  moduleTitle: "Módulo de Registro",
  moduleSub: "Completa tus datos para hacer parte de nuestro registro gremial.",
  s1Title: "Cuéntanos sobre ti",
  s1Sub: "Usa tus datos tal como aparecen en tu documento.",
  s2Title: "¿Dónde vives?",
  s2Sub: "Selecciona tu departamento y tu municipio. Escribe para buscar más rápido.",
  s3Title: "Cuéntanos a qué te dedicas",
  s3Sub: "Puedes elegir más de uno. Selecciona todas las que apliquen.",
  s4Title: "¿Perteneces a alguna asociación?",
  s4Sub: "Si haces parte de un colectivo o asociación, cuéntanos cuál.",
  submitLabel: "Enviar registro",
};

function defaults(): Config {
  return {
    roles: ROLES.map((r) => ({ id: slug(r), label: r, active: true, isOther: r === "Otro" })),
    assocs: ASSOCIATIONS.map((a) => ({ ...a, active: true })),
    deptOff: [],
    texts: DEFAULT_TEXTS,
    people: [],
  };
}

function load(): Config {
  const d = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return d;
    const p = JSON.parse(raw) as Partial<Config>;
    return {
      roles: Array.isArray(p.roles) && p.roles.length ? p.roles : d.roles,
      assocs: Array.isArray(p.assocs) && p.assocs.length ? p.assocs : d.assocs,
      deptOff: Array.isArray(p.deptOff) ? p.deptOff : [],
      texts: { ...d.texts, ...(p.texts ?? {}) },
      people: Array.isArray(p.people) ? p.people : [],
    };
  } catch {
    return d;
  }
}

type Ctx = {
  cfg: Config;
  ready: boolean;
  activeRoles: RoleOpt[];
  activeAssocs: AssocOpt[];
  allPeople: Person[];
  addRole: (label: string) => void;
  renameRole: (id: string, label: string) => void;
  toggleRole: (id: string) => void;
  deleteRole: (id: string) => boolean;
  addAssoc: (a: { name: string; departmentId: string; municipalityId: string }) => void;
  updateAssoc: (id: string, patch: Partial<AssocOpt>) => void;
  toggleAssoc: (id: string) => void;
  deleteAssoc: (id: string) => string | null;
  toggleDept: (id: string) => void;
  setTexts: (t: FormTexts) => void;
  resetTexts: () => void;
  addPerson: (p: {
    fullName: string;
    identity: string;
    phone: string;
    email?: string;
    departmentId: string;
    municipalityId: string;
    roles: string[];
    associationId?: string;
  }) => void;
};

const C = React.createContext<Ctx | null>(null);

export function useConfig() {
  const ctx = React.useContext(C);
  if (!ctx) throw new Error("useConfig fuera de ConfigProvider");
  return ctx;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [cfg, setCfg] = React.useState<Config>(defaults);
  const [ready, setReady] = React.useState(false);

  // Carga diferida: evita mismatch de hidratación (SSR usa defaults) y la
  // lectura de localStorage ocurre una vez montado el cliente.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setCfg(load());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  React.useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(cfg));
      } catch {
        // almacenamiento lleno o bloqueado: se sigue en memoria
      }
    }
  }, [cfg, ready]);

  const activeRoles = React.useMemo(() => cfg.roles.filter((r) => r.active), [cfg.roles]);
  const activeAssocs = React.useMemo(() => cfg.assocs.filter((a) => a.active), [cfg.assocs]);
  const allPeople = React.useMemo(
    () => [...cfg.people, ...PEOPLE].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [cfg.people]
  );

  const value: Ctx = {
    cfg,
    ready,
    activeRoles,
    activeAssocs,
    allPeople,
    addRole: (label) => {
      const l = label.trim();
      if (!l) return;
      const id = `${slug(l)}-${Date.now().toString(36)}`;
      setCfg((c) => ({ ...c, roles: [...c.roles, { id, label: l, active: true }] }));
    },
    renameRole: (id, label) => {
      const l = label.trim();
      if (!l) return;
      setCfg((c) => ({ ...c, roles: c.roles.map((r) => (r.id === id ? { ...r, label: l } : r)) }));
    },
    toggleRole: (id) =>
      setCfg((c) => ({ ...c, roles: c.roles.map((r) => (r.id === id ? { ...r, active: !r.active } : r)) })),
    deleteRole: (id) => {
      let ok = false;
      setCfg((c) => {
        const target = c.roles.find((r) => r.id === id);
        if (!target) return c;
        const used = [...c.people, ...PEOPLE].some((p) => p.roles.includes(target.label));
        if (used) return c;
        ok = true;
        return { ...c, roles: c.roles.filter((r) => r.id !== id) };
      });
      return ok;
    },
    addAssoc: (a) => {
      const id = `c-${Date.now().toString(36)}`;
      setCfg((c) => ({ ...c, assocs: [...c.assocs, { ...a, id, active: true, members: 0, custom: true }] }));
    },
    updateAssoc: (id, patch) =>
      setCfg((c) => ({ ...c, assocs: c.assocs.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
    toggleAssoc: (id) =>
      setCfg((c) => ({ ...c, assocs: c.assocs.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) })),
    deleteAssoc: (id) => {
      const target = cfg.assocs.find((a) => a.id === id);
      if (!target) return "No encontrada";
      if ((target.members ?? 0) > 0) return "Tiene miembros registrados, desactívala en vez de eliminarla";
      if ([...cfg.people, ...PEOPLE].some((p) => p.associationId === id)) return "Tiene registros asociados";
      setCfg((c) => ({ ...c, assocs: c.assocs.filter((a) => a.id !== id) }));
      return null;
    },
    toggleDept: (id) =>
      setCfg((c) => ({
        ...c,
        deptOff: c.deptOff.includes(id) ? c.deptOff.filter((d) => d !== id) : [...c.deptOff, id],
      })),
    setTexts: (t) => setCfg((c) => ({ ...c, texts: t })),
    resetTexts: () => setCfg((c) => ({ ...c, texts: DEFAULT_TEXTS })),
    addPerson: (p) =>
      setCfg((c) => ({
        ...c,
        people: [
          {
            id: `demo-${Date.now().toString(36)}`,
            fullName: p.fullName,
            identity: p.identity,
            phone: p.phone,
            email: p.email || undefined,
            departmentId: p.departmentId,
            municipalityId: p.municipalityId,
            roles: p.roles,
            associationId: p.associationId || undefined,
            createdAt: todayISO(),
          },
          ...c.people,
        ],
      })),
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}
