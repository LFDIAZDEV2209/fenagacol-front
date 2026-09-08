"use client";
import * as React from "react";
import { ASSOCIATIONS, PEOPLE, ROLES, assocName as staticAssocName, type Person } from "./mock-data";
import { todayISO } from "./format";
import { createRegistration, getPublicCatalogs } from "./supabase/queries";

// Fuente de verdad: Supabase (roles, associations, people) cuando hay conexión.
// localStorage queda como caché/offline + preferencias (deptOff, texts).
// Si el servidor no responde, todo sigue funcionando con datos locales.

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

type Stored = {
  roles: RoleOpt[];
  assocs: AssocOpt[];
  deptOff: string[];
  texts: FormTexts;
  people: Person[];
};

// Nombre de asociación resolviendo SIEMPRE contra la lista dinámica
// (incluye creadas/desactivadas por el admin). La lista estática solo es
// último recurso para registros viejos sin catálogo cargado.
export function resolveAssocName(id: string | undefined, assocs: AssocOpt[]): string {
  if (!id) return "Sin asociación";
  return assocs.find((a) => a.id === id)?.name ?? staticAssocName(id);
}

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

function defaults(): Stored {
  return {
    roles: ROLES.map((r) => ({ id: slug(r), label: r, active: true, isOther: r === "Otro" })),
    assocs: ASSOCIATIONS.map((a) => ({ ...a, active: true })),
    deptOff: [],
    texts: DEFAULT_TEXTS,
    people: [],
  };
}

function loadLocal(): Stored {
  const d = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return d;
    const p = JSON.parse(raw) as Partial<Stored>;
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

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, init);
  const d = (await r.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
  if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`);
  return d;
}

type AddPersonResult = { ok: boolean; code?: string; local?: boolean };

type Ctx = {
  cfg: Stored;
  ready: boolean;
  serverOk: boolean;
  activeRoles: RoleOpt[];
  activeAssocs: AssocOpt[];
  allPeople: Person[];
  membersOf: (assocId: string) => number;
  addRole: (label: string) => void;
  renameRole: (id: string, label: string) => void;
  toggleRole: (id: string) => void;
  deleteRole: (id: string) => Promise<boolean>;
  addAssoc: (a: { name: string; departmentId: string; municipalityId: string }) => void;
  updateAssoc: (id: string, patch: Partial<AssocOpt>) => void;
  toggleAssoc: (id: string) => void;
  deleteAssoc: (id: string) => Promise<string | null>;
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
    otherDetail?: string;
    associationId?: string;
  }) => Promise<AddPersonResult>;
};

const C = React.createContext<Ctx | null>(null);

export function useConfig() {
  const ctx = React.useContext(C);
  if (!ctx) throw new Error("useConfig fuera de ConfigProvider");
  return ctx;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [cfg, setCfg] = React.useState<Stored>(defaults);
  const [ready, setReady] = React.useState(false);
  const [serverOk, setServerOk] = React.useState(false);
  const [serverPeople, setServerPeople] = React.useState<Person[]>([]);

  // Carga diferida: prefs locales + catálogos del servidor (públicos) +
  // directorio admin (solo con sesión; 401 silencioso en el form público).
  // Ambas fuentes en paralelo para no sumar latencias en cascada.
  React.useEffect(() => {
    const id = window.setTimeout(async () => {
      setCfg(loadLocal());
      setReady(true);
      const [cat, dir] = await Promise.allSettled([
        getPublicCatalogs(),
        api("/api/admin/directory") as Promise<{
          people: Person[];
          roles: RoleOpt[];
          assocs: AssocOpt[];
        }>,
      ]);
      const catalogs = cat.status === "fulfilled" ? cat.value : null;
      if (catalogs && catalogs.roles.length) {
        setCfg((c) => ({ ...c, roles: catalogs.roles, assocs: catalogs.assocs.length ? catalogs.assocs : c.assocs }));
        setServerOk(true);
      }
      if (dir.status === "fulfilled") {
        if (Array.isArray(dir.value.people)) setServerPeople(dir.value.people);
        if (Array.isArray(dir.value.roles) && dir.value.roles.length) {
          setCfg((c) => ({ ...c, roles: dir.value.roles, assocs: dir.value.assocs?.length ? dir.value.assocs : c.assocs }));
        }
        setServerOk(true);
      }
      // Rechazos = 401 en formulario público o sin red: se sigue con datos locales.
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

  const allPeople = React.useMemo(() => {
    const seen = new Set<string>();
    const out: Person[] = [];
    for (const p of [...serverPeople, ...cfg.people, ...PEOPLE]) {
      if (seen.has(p.identity)) continue;
      seen.add(p.identity);
      out.push(p);
    }
    return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [serverPeople, cfg.people]);

  const membersOf = React.useCallback(
    (assocId: string) => allPeople.filter((p) => p.associationId === assocId).length,
    [allPeople]
  );

  // Memorizado: evita re-renderizar todo el admin en cada cambio del provider.
  const value: Ctx = React.useMemo(
    () => ({
    cfg,
    ready,
    serverOk,
    activeRoles,
    activeAssocs,
    allPeople,
    membersOf,
    addRole: (label) => {
      const l = label.trim();
      if (!l) return;
      const tempId = `${slug(l)}-${Date.now().toString(36)}`;
      setCfg((c) => ({ ...c, roles: [...c.roles, { id: tempId, label: l, active: true }] }));
      api("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: l }),
      })
        .then((d) => {
          const realId = (d as { id?: string }).id;
          if (realId) setCfg((c) => ({ ...c, roles: c.roles.map((r) => (r.id === tempId ? { ...r, id: realId } : r)) }));
        })
        .catch(() => undefined);
    },
    renameRole: (id, label) => {
      const l = label.trim();
      if (!l) return;
      setCfg((c) => ({ ...c, roles: c.roles.map((r) => (r.id === id ? { ...r, label: l } : r)) }));
      api(`/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: l }),
      }).catch(() => undefined);
    },
    toggleRole: (id) => {
      const next = !cfg.roles.find((r) => r.id === id)?.active;
      setCfg((c) => ({ ...c, roles: c.roles.map((r) => (r.id === id ? { ...r, active: !r.active } : r)) }));
      api(`/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      }).catch(() => undefined);
    },
    deleteRole: async (id) => {
      if (serverOk) {
        try {
          await api(`/api/admin/roles/${id}`, { method: "DELETE" });
          setCfg((c) => ({ ...c, roles: c.roles.filter((r) => r.id !== id) }));
          return true;
        } catch {
          return false;
        }
      }
      const target = cfg.roles.find((r) => r.id === id);
      if (!target) return false;
      if (allPeople.some((p) => p.roles.includes(target.label))) return false;
      setCfg((c) => ({ ...c, roles: c.roles.filter((r) => r.id !== id) }));
      return true;
    },
    addAssoc: (a) => {
      const tempId = `c-${Date.now().toString(36)}`;
      setCfg((c) => ({ ...c, assocs: [...c.assocs, { ...a, id: tempId, active: true, members: 0, custom: true }] }));
      api("/api/admin/associations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      })
        .then((d) => {
          const realId = (d as { id?: string }).id;
          if (realId) setCfg((c) => ({ ...c, assocs: c.assocs.map((x) => (x.id === tempId ? { ...x, id: realId } : x)) }));
        })
        .catch(() => undefined);
    },
    updateAssoc: (id, patch) => {
      setCfg((c) => ({ ...c, assocs: c.assocs.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
      const body: Record<string, unknown> = {};
      if (patch.name !== undefined) body.name = patch.name;
      if (patch.departmentId !== undefined) body.departmentId = patch.departmentId;
      if (patch.municipalityId !== undefined) body.municipalityId = patch.municipalityId;
      if (patch.active !== undefined) body.active = patch.active;
      if (Object.keys(body).length) {
        api(`/api/admin/associations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).catch(() => undefined);
      }
    },
    toggleAssoc: (id) => {
      const next = !cfg.assocs.find((a) => a.id === id)?.active;
      setCfg((c) => ({ ...c, assocs: c.assocs.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) }));
      api(`/api/admin/associations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      }).catch(() => undefined);
    },
    deleteAssoc: async (id) => {
      if (serverOk) {
        try {
          await api(`/api/admin/associations/${id}`, { method: "DELETE" });
          setCfg((c) => ({ ...c, assocs: c.assocs.filter((a) => a.id !== id) }));
          return null;
        } catch (e) {
          return e instanceof Error ? e.message : "No se pudo eliminar.";
        }
      }
      const target = cfg.assocs.find((a) => a.id === id);
      if (!target) return "No encontrada";
      if (allPeople.some((p) => p.associationId === id)) return "Tiene registros asociados";
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
    addPerson: async (p) => {
      const person: Person = {
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
      };
      try {
        await createRegistration({
          fullName: p.fullName,
          identity: p.identity,
          phone: p.phone,
          email: p.email,
          departmentId: p.departmentId,
          municipalityId: p.municipalityId,
          roles: p.roles,
          otherDetail: p.otherDetail,
          associationId: p.associationId,
        });
        setCfg((c) => ({ ...c, people: [person, ...c.people] }));
        return { ok: true };
      } catch (e) {
        const code = e instanceof Error ? e.message : "NETWORK";
        if (code === "DUPLICATE_IDENTITY") return { ok: false, code };
        if (code === "STALE_ROLES" || code === "STALE_ASSOC") return { ok: false, code };
        // Sin conexión: guarda local para no perder el registro
        setCfg((c) => ({ ...c, people: [person, ...c.people] }));
        return { ok: true, local: true };
      }
    },
    }),
    [cfg, ready, serverOk, activeRoles, activeAssocs, allPeople, membersOf]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}
