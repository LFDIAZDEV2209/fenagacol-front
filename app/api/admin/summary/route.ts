import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseFilters, requireAdmin } from "../_lib";

// GET /api/admin/summary?from&to&departmentId&municipalityId&role&associationId
// Agregados calculados en Postgres (función gremial_summary). Sin límite de filas.
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const f = parseFilters(new URL(req.url).searchParams);
    const sb = await createServiceClient();
    const { data, error } = await sb.rpc("gremial_summary", {
      p_from: f.from || null,
      p_to: f.to || null,
      p_dept: f.departmentId || null,
      p_muni: f.municipalityId || null,
      p_role: f.role || null,
      p_assoc: f.associationId || null,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error calculando el resumen." },
      { status: 500 }
    );
  }
}
