import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseFilters, requireAdmin } from "./_lib";

type Kind = "departments" | "municipalities";
const invalid = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

function dbError(error: { code?: string }) {
  if (error.code === "23505")
    return invalid("Ese código ya existe. Usa uno diferente.", 409);
  if (error.code === "23503")
    return invalid(
      "El territorio tiene referencias o el departamento ya no existe. Actualiza la lista.",
      409,
    );
  return invalid("No se pudo guardar el territorio. Vuelve a intentar.", 500);
}

export async function listTerritory(req: Request, kind: Kind) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const sp = new URL(req.url).searchParams;
    const f = parseFilters(sp);
    const sb = await createServiceClient();
    const fields =
      kind === "departments"
        ? "code,name,municipalities(count)"
        : "code,name,department_code";
    let query = sb.from(kind).select(fields, { count: "exact" });
    if (f.q) query = query.or(`name.ilike.%${f.q}%,code.ilike.%${f.q}%`);
    if (kind === "municipalities" && f.departmentId)
      query = query.eq("department_code", f.departmentId);
    if (kind === "municipalities") {
      if (sp.get("type") === "municipio") query = query.like("code", "_____");
      if (sp.get("type") === "pueblo") query = query.like("code", "________");
    }
    const column = sp.get("sort") === "name" ? "name" : "code";
    query = query.order(column, { ascending: sp.get("dir") !== "desc" });
    if (column !== "code") query = query.order("code", { ascending: true });
    const lo = (f.page - 1) * f.pageSize;
    const { data, count, error } = await query
      .range(lo, lo + f.pageSize - 1)
      .abortSignal(req.signal);
    if (error)
      return invalid(
        "No se pudo cargar el territorio. Vuelve a intentar.",
        500,
      );
    const rows = (data ?? []).map((row) => {
      const r = row as unknown as {
        code: string;
        name: string;
        department_code?: string;
        municipalities?: { count: number }[];
      };
      return {
        id: r.code,
        divipola: r.code,
        name: r.name,
        departmentId: r.department_code,
        municipalityCount: r.municipalities?.[0]?.count ?? 0,
      };
    });
    return NextResponse.json({
      rows,
      total: count ?? 0,
      page: f.page,
      pageSize: f.pageSize,
    });
  } catch {
    return invalid(
      "No se pudo cargar el territorio. Comprueba la conexión y reintenta.",
      500,
    );
  }
}

export async function saveTerritory(req: Request, kind: Kind, id?: string) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      return invalid("Revisa los datos del formulario.");
  } catch {
    return invalid("El formulario no es válido.");
  }
  const code = typeof body.code === "string" ? body.code.trim() : (id ?? "");
  const name =
    typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const departmentId =
    typeof body.departmentId === "string" ? body.departmentId.trim() : "";
  const municipality = kind === "municipalities";
  // Los centros poblados existentes conservan sus códigos de ocho dígitos.
  const validCode = municipality
    ? id?.length === 8
      ? /^\d{8}$/
      : /^\d{5}$/
    : /^\d{2}$/;
  if (!validCode.test(code))
    return invalid(
      municipality
        ? "El código del municipio debe tener cinco dígitos."
        : "El código del departamento debe tener dos dígitos.",
    );
  if (id && code !== id)
    return invalid(
      "El código identifica registros existentes y no se puede cambiar. Edita el nombre.",
      409,
    );
  if (name.length < 2 || name.length > 100 || /[\u0000-\u001f]/.test(name))
    return invalid("Escribe un nombre entre 2 y 100 caracteres.");
  if (
    municipality &&
    (!/^\d{2}$/.test(departmentId) || !code.startsWith(departmentId))
  )
    return invalid(
      "Los primeros dos dígitos del municipio deben coincidir con el departamento.",
    );
  try {
    const sb = await createServiceClient();
    if (id) {
      const existing = await sb
        .from(kind)
        .select("code")
        .eq("code", id)
        .maybeSingle();
      if (existing.error) return dbError(existing.error);
      if (!existing.data)
        return invalid(
          "Este territorio ya no existe. Actualiza la lista.",
          404,
        );
    }
    if (municipality) {
      const department = await sb
        .from("departments")
        .select("code")
        .eq("code", departmentId)
        .maybeSingle();
      if (department.error) return dbError(department.error);
      if (!department.data)
        return invalid("Selecciona un departamento existente.");
    }
    let duplicate = sb
      .from(kind)
      .select("code")
      .ilike("name", name.replace(/[\\%_]/g, "\\$&"))
      .neq("code", code)
      .limit(1);
    if (municipality) duplicate = duplicate.eq("department_code", departmentId);
    const check = await duplicate;
    if (check.error) return dbError(check.error);
    if (check.data?.length)
      return invalid(
        "Ya existe ese nombre en este territorio. Revisa la lista o usa otro nombre.",
        409,
      );
    const values = {
      code,
      name,
      ...(municipality ? { department_code: departmentId } : {}),
    };
    const query = id
      ? sb.from(kind).update(values).eq("code", id)
      : sb.from(kind).insert(values);
    const { data, error } = await query.select("*").single();
    if (error) return dbError(error);
    return NextResponse.json(
      {
        id: data.code,
        divipola: data.code,
        name: data.name,
        departmentId: data.department_code,
      },
      { status: id ? 200 : 201 },
    );
  } catch {
    return invalid(
      "No se pudo guardar. Comprueba la conexión y reintenta.",
      500,
    );
  }
}

export async function deleteTerritory(kind: Kind, id: string) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const sb = await createServiceClient();
    const column = kind === "departments" ? "department_id" : "municipality_id";
    const checks = await Promise.all([
      sb
        .from("people")
        .select("id", { count: "exact", head: true })
        .eq(column, id),
      sb
        .from("associations")
        .select("id", { count: "exact", head: true })
        .eq(column, id),
      ...(kind === "departments"
        ? [
            sb
              .from("municipalities")
              .select("code", { count: "exact", head: true })
              .eq("department_code", id),
          ]
        : []),
    ]);
    if (checks.some((r) => r.error))
      return invalid("No se pudo comprobar el uso. Reintenta.", 500);
    if (checks.some((r) => (r.count ?? 0) > 0))
      return invalid(
        "No se puede eliminar: tiene personas, asociaciones o municipios vinculados.",
        409,
      );
    const { data, error } = await sb
      .from(kind)
      .delete()
      .eq("code", id)
      .select("code");
    if (error) return dbError(error);
    if (!data?.length) return invalid("El territorio ya no existe.", 404);
    return NextResponse.json({ ok: true });
  } catch {
    return invalid("No se pudo eliminar. Reintenta.", 500);
  }
}
