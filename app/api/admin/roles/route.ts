import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";

async function guard() {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "rol";

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { label?: string };
  const label = (body.label ?? "").trim();
  if (!label) return NextResponse.json({ error: "Nombre requerido." }, { status: 400 });

  const sb = await createServiceClient();
  const id = `${slug(label)}-${Date.now().toString(36)}`;
  const max = await sb.from("roles").select("sort").order("sort", { ascending: false }).limit(1).single();
  const { error } = await sb.from("roles").insert({
    id,
    label,
    active: true,
    is_other: false,
    sort: (max.data?.sort ?? 0) + 1,
  });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ese rol ya existe." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id });
}
