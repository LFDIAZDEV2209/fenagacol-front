// Seed DIVIPOLA -> Supabase. Idempotente (upsert por código), re-ejecutable en despliegue.
// Uso: yarn node supabase/seed-divipola.mjs (lee .env.local; requiere SUPABASE_SERVICE_ROLE_KEY)
// DDL + RLS en la migración divipola_reference_tables. Fuente: ../lib/divipola.json.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv(new URL("../.env.local", import.meta.url));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");

const data = JSON.parse(readFileSync(new URL("../lib/divipola.json", import.meta.url), "utf8"));
const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function upsert(table, rows, onConflict) {
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await sb.from(table).upsert(rows.slice(i, i + BATCH), { onConflict });
    if (error) throw new Error(`${table} [${i}]: ${error.message}`);
    console.log(`${table}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
}

await upsert("departments", data.departments.map((d) => ({ code: d.code, name: d.name })), "code");
await upsert("municipalities", data.municipalities.map((m) => ({ code: m.code, department_code: m.departmentCode, name: m.name })), "code");
console.log("DIVIPOLA seed OK");
