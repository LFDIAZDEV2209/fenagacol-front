import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "../_lib";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const sb = await createServiceClient();
    const { data, error } = await sb
      .rpc("territory_stats")
      .abortSignal(req.signal);
    if (error || !data) throw new Error();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudieron cargar los registrados por territorio. Reintenta.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
