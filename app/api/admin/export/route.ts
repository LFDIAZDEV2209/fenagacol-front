import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseFilters, parseExportPaging, requireAdmin, toNextDay } from "../_lib";

// GET /api/admin/export?mismos filtros que directory
// Devuelve TODAS las filas filtradas (tope 20.000) para el Excel del cliente.
// El cliente pagina con start/rows: una respuesta por chunk cabe en el
// payload serverless de Vercel (4,5 MB). Sin start, respuesta única rápida.
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const f = parseFilters(url.searchParams);
    const { start, rows: maxRows } = parseExportPaging(url.searchParams);
    const sb = await createServiceClient();

    const rRoles = await sb.from("roles").select("id,label");
    if (rRoles.error) throw new Error(rRoles.error.message);
    const labelById = new Map(
      (rRoles.data ?? []).map((r) => [r.id as string, r.label as string]),
    );
    let roleId: string | null = null;
    if (f.role) {
      roleId =
        ((rRoles.data ?? []).find(
          (r) => (r.label as string).toLowerCase() === f.role.toLowerCase(),
        )?.id as string) ?? null;
      if (!roleId)
        return NextResponse.json({ rows: [], total: 0, truncated: false });
    }

    const select = roleId
      ? "*, person_roles!inner(role_id)"
      : "*, person_roles(role_id)";
    const makeQuery = (first: boolean) => {
      let query = sb
        .from("people")
        .select(select, first ? { count: "exact" } : {});
      if (f.q) {
        query = query.or(
          `full_name.ilike.%${f.q}%,identity_number.ilike.%${f.q}%,phone.ilike.%${f.q}%`,
        );
      }
      if (f.from) query = query.gte("created_at", f.from);
      if (f.to) query = query.lt("created_at", toNextDay(f.to));
      if (f.departmentId) query = query.eq("department_id", f.departmentId);
      if (f.municipalityId)
        query = query.eq("municipality_id", f.municipalityId);
      if (f.associationId) query = query.eq("association_id", f.associationId);
      if (roleId) query = query.eq("person_roles.role_id", roleId);
      return query.order("id", { ascending: true });
    };
    // Cada petición respeta Max Rows; el orden único evita saltos entre páginas.
    const data = [];
    let total = 0;
    for (let lo = start; lo < start + maxRows; lo += 1000) {
      const result = await makeQuery(lo === start)
        .range(lo, Math.min(lo + 999, start + maxRows - 1))
        .abortSignal(req.signal);
      if (result.error) throw new Error(result.error.message);
      if (lo === start) {
        if (start === 0 && result.count == null)
          throw new Error(
            "No se pudo comprobar el total de registros. Reintenta la descarga.",
          );
        if (result.count != null) total = result.count;
      }
      const batch = result.data ?? [];
      data.push(...batch);
      if (batch.length < 1000 || data.length >= maxRows || data.length >= total)
        break;
    }

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
        gallerosUnidos: p.galleros_unidos === true,
        otherAssocName: p.other_assoc_name ?? undefined,
        otherAssocContact: p.other_assoc_contact ?? undefined,
        createdAt: String(p.created_at).slice(0, 10),
      };
    });
    return NextResponse.json({ rows, total, truncated: total > start + rows.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error exportando." },
      { status: 500 },
    );
  }
}
