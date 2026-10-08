// Verifica los ceros, la unión por código y el orden de las cuatro hojas.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(fs.readFileSync("lib/export-excel.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(code, { exports, require: () => ({}) });
const catalog = {
  departments: [{ id: "05", name: "Antioquia" }, { id: "08", name: "Atlántico" }],
  municipalities: [{ id: "05001", name: "Medellín", departmentId: "05" }, { id: "05001001", name: "Pueblo", departmentId: "05" }, { id: "08001", name: "Barranquilla", departmentId: "08" }],
};
const stats = { by_dept: [{ id: "05", value: 5 }], by_muni: [{ id: "05001", value: 5 }], generated_at: "2026-10-08" };
const sheets = exports.territorySheets(catalog, stats, ["08"]);
assert.equal(sheets.length, 4);
assert.equal(sheets[0].rows.length, 2);
assert.equal(sheets[1].rows.length, 3);
assert.equal(sheets[0].rows[0].Registrados, 5);
assert.equal(sheets[0].rows[1].Registrados, 0);
assert.equal(sheets[0].rows[0]["Municipios y pueblos"], 2);
assert.equal(sheets[1].rows.filter((r) => r.Registrados === 0).length, 2);
assert.equal(sheets[1].rows[0].Código, "05001");
assert.equal(sheets[3].rows[1].Tipo, "Pueblo");
assert.equal(sheets[2].rows[1]["Visible en formulario"], "No");
assert.equal(sheets[3].rows[1].Departamento, "Antioquia");
const fallback = exports.territorySheets(catalog, null);
assert.equal(fallback.length, 2);
assert.ok(!Object.hasOwn(fallback[0].rows[0], "Registrados"));
console.log("Territorio: cuatro hojas completas, ceros, orden, visibilidad y exportación sin estadísticas correctos.");
