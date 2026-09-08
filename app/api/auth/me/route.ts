import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export async function GET() {
  const store = await cookies();
  const email = await verifySession(store.get(COOKIE_NAME)?.value);
  if (!email) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  return NextResponse.json({ email, name: "Administrador" });
}
