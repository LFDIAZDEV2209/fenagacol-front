// Regresión sin acceso a datos personales: simula Max Rows = 1000 y el
// payload de la función serverless (chunks de start/rows).
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const BASE = "http://localhost/api/admin/export";

let code;
function routeCode() {
  code ??= ts.transpileModule(
    fs.readFileSync("app/api/admin/export/route.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  return code;
}

// Simula PostgREST: Max Rows=1000 por petición y respeta el rango hi pedido.
async function run(total, url = BASE, failPage = -1, knownRole = true) {
  const calls = [];
  let current;
  class NextResponse {
    static json(body, opts) {
      return { body, status: opts?.status ?? 200 };
    }
  }
  const sb = {
    from(table) {
      if (table === "roles")
        return {
          select: async () => ({
            data: [{ id: "r1", label: "Gallero" }],
            error: null,
          }),
        };
      const query = {
        select(_fields, options) {
          current = { count: options.count, filters: [], order: null };
          return query;
        },
        or(value) {
          current.filters.push(["or", value]);
          return query;
        },
        gte(...args) {
          current.filters.push(["gte", ...args]);
          return query;
        },
        lt(...args) {
          current.filters.push(["lt", ...args]);
          return query;
        },
        eq(...args) {
          current.filters.push(["eq", ...args]);
          return query;
        },
        order(column, options) {
          current.order = [column, options.ascending];
          return query;
        },
        range(lo, hi) {
          current.lo = lo;
          current.hi = hi;
          return query;
        },
        abortSignal() {
          calls.push(current);
          if (current.lo / 1000 === failPage)
            return Promise.resolve({ error: { message: "Fallo simulado" } });
          const length = Math.min(
            1000,
            Math.max(0, total - current.lo),
            Math.max(0, current.hi - current.lo + 1),
          );
          return Promise.resolve({
            data: Array.from({ length }, (_, i) => ({
              id: String(current.lo + i),
              person_roles: [{ role_id: "r1" }],
              created_at: "2026-10-08",
            })),
            count: current.count ? total : null,
            error: null,
          });
        },
      };
      return query;
    },
  };
  const exports = {};
  vm.runInNewContext(routeCode(), {
    exports,
    require(name) {
      if (name === "next/server") return { NextResponse };
      if (name.endsWith("supabase/server"))
        return { createServiceClient: async () => sb };
      if (name === "../_lib")
        return {
          requireAdmin: async () => "admin",
          parseFilters: () => makeFilters(knownRole),
          parseExportPaging: (sp) => {
            const int = (raw) => {
              if (raw === null) return null;
              const parsed = Number(raw);
              return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
            };
            const start = Math.min(int(sp.get("start")) ?? 0, 19999);
            const paginated = sp.get("start") !== null || int(sp.get("rows")) !== null;
            const rows = paginated
              ? Math.max(1, Math.min(int(sp.get("rows")) ?? 5000, 5000))
              : 20000;
            return { start, rows: Math.max(0, Math.min(rows, 20000 - start)) };
          },
          toNextDay: () => "2026-10-09",
        };
      throw new Error(`Import inesperado: ${name}`);
    },
    URL,
    Request,
  });
  const result = await exports.GET(new Request(url));
  return { result, calls };
}

function makeFilters(knownRole) {
  return {
    q: "Luis",
    from: "2026-01-01",
    to: "2026-10-08",
    departmentId: "05",
    municipalityId: "05001",
    associationId: "a1",
    role: knownRole ? "Gallero" : "Inexistente",
  };
}

// Respuesta única legacy (sin start): internamente pagina de 1000 en 1000.
async function scenario(total, failPage = -1, knownRole = true) {  const { result, calls } = await run(
    total,
    BASE,
    failPage,
    knownRole,
  );
  if (failPage >= 0) {
    assert.equal(result.status, 500);
    return;
  }
  assert.equal(result.status, 200);
  assert.equal(result.body.total, knownRole ? total : 0);
  const length = knownRole ? Math.min(total, 20000) : 0;
  assert.equal(result.body.rows.length, length);
  assert.equal(new Set(result.body.rows.map((row) => row.id)).size, length);
  assert.equal(result.body.truncated, knownRole && total > 20000);
  calls.forEach((call, i) => {
    assert.equal(call.lo, i * 1000);
    assert.equal(call.hi - call.lo, 999);
    assert.equal(call.count, i === 0 ? "exact" : undefined);
    assert.deepEqual(Array.from(call.order), ["id", true]);
    assert.equal(call.filters.length, 7);
  });
}

// Export por chunks (payload serverless): el cliente pide start/rows.
async function chunkScenario(
  total,
  start,
  rows,
  expectedRows,
  expectedCalls,
) {
  const url = `${BASE}?start=${start}${rows ? `&rows=${rows}` : ""}`;
  const { result, calls } = await run(total, url);
  assert.equal(result.status, 200);
  assert.equal(result.body.rows.length, expectedRows);
  const ids = Array.from(result.body.rows, (row) => Number(row.id));
  assert.deepEqual(
    ids,
    Array.from({ length: expectedRows }, (_, i) => start + i),
  );
  assert.equal(result.body.truncated, total > start + result.body.rows.length);
  assert.equal(calls.length, expectedCalls);
  calls.forEach((call, i) => {
    assert.equal(call.lo, start + i * 1000);
    if (i === 0) assert.equal(call.count, "exact");
    assert.deepEqual(Array.from(call.order), ["id", true]);
    assert.equal(call.filters.length, 7);
  });
}

(async () => {
  for (const total of [0, 999, 1000, 1001, 16332, 20000, 20037])
    await scenario(total);
  await scenario(2001, 1);
  await scenario(16332, -1, false);
  // Chunks del cliente (5000 filas por respuesta y tope documentado 20.000):
  await chunkScenario(16332, 0, 5000, 5000, 5);
  await chunkScenario(16332, 5000, 5000, 5000, 5);
  await chunkScenario(16332, 10000, 5000, 5000, 5);
  await chunkScenario(16332, 15000, 5000, 1332, 2);
  await chunkScenario(16332, 15000, 100, 100, 1);
  await chunkScenario(20037, 15000, 5000, 5000, 5);
  console.log(
    "Export: 15 escenarios correctos (paginación 1000, chunks, unity, tope y errores).",
  );
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
