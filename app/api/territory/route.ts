import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Solo nombres y códigos públicos. Las escrituras requieren sesión en /api/admin.
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const kind =
      sp.get("kind") === "departments" ? "departments" : "municipalities";
    const rawPage = Number(sp.get("page") ?? 1);
    const page = Number.isInteger(rawPage)
      ? Math.min(1000, Math.max(1, rawPage))
      : 1;
    const sb = await createServiceClient();
    const { data, count, error } = await sb
      .from(kind)
      .select(
        kind === "departments" ? "code,name" : "code,name,department_code",
        { count: "exact" },
      )
      .order("code")
      .range((page - 1) * 1000, page * 1000 - 1)
      .abortSignal(req.signal);
    if (error) throw new Error();
    const rows = (data ?? []).map((row) => {
      const r = row as unknown as {
        code: string;
        name: string;
        department_code?: string;
      };
      return {
        id: r.code,
        divipola: r.code,
        name: r.name,
        departmentId: r.department_code,
      };
    });
    return NextResponse.json({ rows, total: count ?? 0 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el catálogo territorial." },
      { status: 500 },
    );
  }
}
