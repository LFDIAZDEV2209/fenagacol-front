// Acceso público (anon) a Supabase: catálogos + crear registros.
// RLS: anon solo SELECT roles/associations e INSERT people/person_roles.
// Los INSERT usan return=minimal (anon no tiene SELECT) e id generado en cliente.
import { createClient } from "./client";
import type { AssocOpt, RoleOpt } from "../config-store";

export type Catalogs = { roles: RoleOpt[]; assocs: AssocOpt[] };

export async function getPublicCatalogs(): Promise<Catalogs | null> {
  try {
    const sb = createClient();
    const [rRoles, rAssocs] = await Promise.all([
      sb.from("roles").select("id,label,active,is_other").order("sort"),
      sb.from("associations").select("id,name,department_id,municipality_id,active").order("name"),
    ]);
    if (rRoles.error || rAssocs.error) return null;
    return {
      roles: (rRoles.data ?? []).map((r) => ({
        id: r.id as string,
        label: r.label as string,
        active: r.active as boolean,
        isOther: r.is_other as boolean,
      })),
      assocs: (rAssocs.data ?? []).map((a) => ({
        id: a.id as string,
        name: a.name as string,
        departmentId: a.department_id as string,
        municipalityId: a.municipality_id as string,
        active: a.active as boolean,
        members: 0,
        custom: false,
      })),
    };
  } catch {
    return null;
  }
}

export type RegistrationInput = {
  fullName: string;
  identity: string;
  phone: string;
  email?: string;
  departmentId: string;
  municipalityId: string;
  roles: string[]; // labels visibles
  otherDetail?: string;
  associationId?: string;
};

export async function createRegistration(input: RegistrationInput): Promise<{ id: string }> {
  const sb = createClient();

  // Resuelve labels -> ids (las etiquetas las administra el admin y pueden cambiar)
  const { data: roles, error: rolesErr } = await sb.from("roles").select("id,label");
  if (rolesErr || !roles) throw new Error("NETWORK");
  const byLabel = new Map(roles.map((r) => [(r.label as string).toLowerCase(), r.id as string]));
  const roleIds = input.roles
    .map((l) => byLabel.get(l.toLowerCase()))
    .filter((id): id is string => !!id);
  if (roleIds.length !== input.roles.length) throw new Error("STALE_ROLES");

  const id = crypto.randomUUID();
  const { error: pErr } = await sb.from("people").insert({
    id,
    full_name: input.fullName,
    identity_number: input.identity,
    email: input.email || null,
    phone: input.phone,
    department_id: input.departmentId,
    municipality_id: input.municipalityId,
    association_id: input.associationId || null,
    other_role_detail: input.otherDetail || null,
  });
  if (pErr) {
    if (pErr.code === "23505") throw new Error("DUPLICATE_IDENTITY");
    if (pErr.code === "23503") throw new Error("STALE_ASSOC");
    throw new Error("NETWORK");
  }

  if (roleIds.length) {
    const { error: rErr } = await sb
      .from("person_roles")
      .insert(roleIds.map((role_id) => ({ person_id: id, role_id })));
    if (rErr) throw new Error("NETWORK");
  }

  return { id };
}
