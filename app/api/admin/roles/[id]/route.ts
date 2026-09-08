import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";

async function guard() {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { label?: string; active?: boolean };
  const patch: Record<string, unknown> = {};
  if (typeof body.label === "string" && body.label.trim()) patch.label = body.label.trim();
  if (typeof body.active === "boolean") patch.active = body.active;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });

  const sb = await createServiceClient();
  const { error } = await sb.from("roles").update(patch).eq("id", id);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ese nombre ya está en uso." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const { id } = await params;
  const sb = await createServiceClient();
  const used = await sb.from("person_roles").select("person_id").eq("role_id", id).limit(1);
  if (used.data?.length) {
    return NextResponse.json({ error: "Tiene registros, desactívalo en vez de eliminarlo." }, { status: 409 });
  }
  const { error } = await sb.from("roles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
