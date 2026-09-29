// Temp: polling del deploy en producción — busca "Galleros Unidos de Colombia" en los chunks servidos
const BASE = "https://fenagacol-front.vercel.app";
const NEEDLE = "Galleros Unidos de Colombia";

const get = (url) => fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });

for (let i = 0; i < 12; i++) {
  const html = await (await get(BASE + "/registro")).text();
  const chunks = [...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]);
  const uniq = [...new Set(chunks)];
  let found = false;
  for (const c of uniq) {
    const j = await (await get(BASE + c)).text();
    if (j.includes(NEEDLE) || j.includes("otherAssocName")) { found = true; break; }
  }
  const buildId = (html.match(/"buildId":"([^"]+)"/) ?? [])[1] ?? (html.match(/_next\/static\/([a-zA-Z0-9_-]+)\/_buildManifest\.js/) ?? [])[1] ?? "?";
  console.log(`[${i}] chunks=${uniq.length} buildId=${buildId} nuevo=${found ? "SÍ ✅" : "aún no"}`);
  if (found) {
    console.log("DEPLOY NUEVO EN PRODUCCIÓN ✅");
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 30000));
}
console.log("agotado el polling (12 intentos / 6 min)");
process.exit(2);
