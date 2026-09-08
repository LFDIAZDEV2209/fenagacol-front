import { NextResponse } from "next/server";
import { sessionCookie, signSession } from "@/lib/session";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Credenciales de administrador no configuradas en el servidor (ADMIN_EMAIL / ADMIN_PASSWORD)." },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Completa correo y contraseña." }, { status: 400 });
  }

  if (!safeEqual(email, adminEmail.toLowerCase()) || !safeEqual(password, adminPassword)) {
    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  const token = await signSession(email);
  const res = NextResponse.json({ ok: true, email });
  res.headers.set("Set-Cookie", sessionCookie(token));
  return res;
}
