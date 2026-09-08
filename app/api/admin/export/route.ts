import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseFilters, requireAdmin, toNextDay } from "../_lib";

// GET /api/admin/export?mismos filtros que directory
// Devuelve TODAS las filas filtradas (tope 20.000) para el Excel del cliente.
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const f = parseFilters(new URL(req.url).searchParams);
    const sb = await createServiceClient();

    const rRoles = await sb.from("roles").select("id,label");
    if (rRoles.error) throw new Error(rRoles.error.message);
    const labelById = new Map((rRoles.data ?? []).map((r) => [r.id as string, r.label as string]));
    let roleId: string | null = null;
    if (f.role) {
      roleId = (rRoles.data ?? []).find((r) => (r.label as string).toLowerCase() === f.role.toLowerCase())?.id as string ?? null;
      if (!roleId) return NextResponse.json({ rows: [] });
    }

    const select = roleId ? "*, person_roles!inner(role_id)" : "*, person_roles(role_id)";
    let query = sb.from("people").select(select);
    if (f.q) {
      query = query.or(`full_name.ilike.%${f.q}%,identity_number.ilike.%${f.q}%,phone.ilike.%${f.q}%`);
    }
    if (f.from) query = query.gte("created_at", f.from);
    if (f.to) query = query.lt("created_at", toNextDay(f.to));
    if (f.departmentId) query = query.eq("department_id", f.departmentId);
    if (f.municipalityId) query = query.eq("municipality_id", f.municipalityId);
    if (f.associationId) query = query.eq("association_id", f.associationId);
    if (roleId) query = query.eq("person_roles.role_id", roleId);
    query = query.order("created_at", { ascending: false }).range(0, 19999);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((p) => {
      const roles = ((p.person_roles ?? []) as { role_id: string }[])
        .map((pr) => labelById.get(pr.role_id))
        .filter((l): l is string => !!l);
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
    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error exportando." },
      { status: 500 }
    );
  }
}
