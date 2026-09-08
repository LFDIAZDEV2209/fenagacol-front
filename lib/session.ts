// Sesión admin con cookie httpOnly firmada (HMAC-SHA256, WebCrypto: Edge + Node).
// Credenciales SOLO en env (ADMIN_EMAIL / ADMIN_PASSWORD). Nada hardcodeado.
export const COOKIE_NAME = "fenagacol_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function key(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_PASSWORD ?? "dev-only-secret";
  return crypto.subtle.importKey("raw", new TextEncoder().encode(`fenagacol:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(email: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${email}.${exp}`;
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(payload)));
  return `${b64urlEncode(new TextEncoder().encode(payload))}.${b64urlEncode(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [p, s] = token.split(".");
  if (!p || !s) return null;
  try {
    // Copias con ArrayBuffer propio (TS 5.7+ exige BufferSource exacto)
    const payloadBytes = new Uint8Array(b64urlDecode(p));
    const sigBytes = new Uint8Array(b64urlDecode(s));
    const ok = await crypto.subtle.verify("HMAC", await key(), sigBytes, payloadBytes);
    if (!ok) return null;
    const payload = new TextDecoder().decode(payloadBytes);
    const [email, expStr] = payload.split(".");
    if (!email || !expStr || Number(expStr) < Math.floor(Date.now() / 1000)) return null;
    return email;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
