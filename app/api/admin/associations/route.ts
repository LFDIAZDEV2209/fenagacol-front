import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";

async function guard() {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    departmentId?: string;
    municipalityId?: string;
  };
  const name = (body.name ?? "").trim();
  if (!name || !body.departmentId || !body.municipalityId) {
    return NextResponse.json({ error: "Completa nombre, departamento y municipio." }, { status: 400 });
  }

  const sb = await createServiceClient();
  const id = `c-${Date.now().toString(36)}`;
  const { error } = await sb.from("associations").insert({
    id,
    name,
    department_id: body.departmentId,
    municipality_id: body.municipalityId,
    active: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}
