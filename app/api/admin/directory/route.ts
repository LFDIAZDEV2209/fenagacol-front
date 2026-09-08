import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";

// Directorio completo para el admin (service_role, tras sesión válida).
// Une people + person_roles + roles y devuelve shapes compatibles con la UI.
export async function GET() {
  const store = await cookies();
  const email = await verifySession(store.get(COOKIE_NAME)?.value);
  if (!email) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  try {
    const sb = await createServiceClient();
    const [rPeople, rRoles, rPR, rAssocs] = await Promise.all([
      sb.from("people").select("*").order("created_at", { ascending: false }).limit(5000),
      sb.from("roles").select("id,label,active,is_other").order("sort"),
      sb.from("person_roles").select("person_id,role_id"),
      sb.from("associations").select("id,name,department_id,municipality_id,active").order("name"),
    ]);
    const err = rPeople.error ?? rRoles.error ?? rPR.error ?? rAssocs.error;
    if (err) throw new Error(err.message);

    const labelById = new Map((rRoles.data ?? []).map((r) => [r.id as string, r.label as string]));
    const rolesByPerson = new Map<string, string[]>();
    for (const pr of rPR.data ?? []) {
      const label = labelById.get(pr.role_id as string);
      if (!label) continue;
      const arr = rolesByPerson.get(pr.person_id as string) ?? [];
      arr.push(label);
      rolesByPerson.set(pr.person_id as string, arr);
    }

    const people = (rPeople.data ?? []).map((p) => {
      const roles = rolesByPerson.get(p.id as string) ?? [];
      if (p.other_role_detail) roles.push(p.other_role_detail as string);
      return {
        id: p.id,
        fullName: p.full_name,
        identity: p.identity_number,
        phone: p.phone,
        email: p.email ?? undefined,
        departmentId: p.department_id,
        municipalityId: p.municipality_id,
        roles,
        associationId: p.association_id ?? undefined,
        createdAt: String(p.created_at).slice(0, 10),
      };
    });

    return NextResponse.json({
      people,
      roles: (rRoles.data ?? []).map((r) => ({
        id: r.id,
        label: r.label,
        active: r.active,
        isOther: r.is_other,
      })),
      assocs: (rAssocs.data ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        departmentId: a.department_id,
        municipalityId: a.municipality_id,
        active: a.active,
        members: 0,
        custom: false,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error leyendo el directorio." },
      { status: 500 }
    );
  }
}
