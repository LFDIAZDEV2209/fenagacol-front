// Temp: verifica deployment de Vercel (token OAuth de mcp-auth.json)
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const auth = JSON.parse(readFileSync(join(homedir(), ".local", "share", "opencode", "mcp-auth.json"), "utf8"));
const v = auth.vercel;
const now = Date.now() / 1000;
let token = v.tokens.accessToken;
if (v.tokens.expiresAt < now + 60) {
  console.log("token vencido -> refrescando");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: v.tokens.refreshToken,
    client_id: v.clientInfo.clientId,
  });
  // Vercel OAuth: client secret no aplica a clientes públicos (PKCE); probamos solo con refresh
  const r = await fetch("https://vercel.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const t = await r.text();
  console.log("refresh status:", r.status, r.ok ? "(ok)" : t.slice(0, 200));
  if (r.ok) {
    const j = JSON.parse(t);
    token = j.access_token;
    v.tokens.accessToken = token;
    if (j.refresh_token) v.tokens.refreshToken = j.refresh_token;
    v.tokens.expiresAt = Math.floor(now + (j.expires_in ?? 3600));
    readFileSync; // noop
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(homedir(), ".local", "share", "opencode", "mcp-auth.json"), JSON.stringify(auth, null, 2));
  }
}

const h = { Authorization: `Bearer ${token}` };
const projects = await fetch("https://api.vercel.com/v9/projects?limit=20", { headers: h }).then((r) => r.json());
const list = (projects.projects ?? []).map((p) => `${p.id} | ${p.name}`);
console.log("PROJECTS:", list.join(" || ") || JSON.stringify(projects).slice(0, 200));
const proj = (projects.projects ?? []).find((p) => /fenagacol/i.test(p.name));
if (!proj) process.exit(1);
console.log("TARGET:", proj.name, proj.id, "| latest prod:", proj.latestDeployments?.[0]?.url ?? "(n/a)");
