import { NextResponse } from "next/server";
import { sessionCookie, signSession } from "@/lib/session";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Límite simple anti fuerza bruta: 10 intentos/min por IP (por instancia).
const attempts = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now > a.reset) {
    attempts.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  a.count += 1;
  return a.count > 10;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un minuto." }, { status: 429 });
  }
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

  attempts.delete(ip);
  const token = await signSession(email);
  const res = NextResponse.json({ ok: true, email });
  res.headers.set("Set-Cookie", sessionCookie(token));
  return res;
}
