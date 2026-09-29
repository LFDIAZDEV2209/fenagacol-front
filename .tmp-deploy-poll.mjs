// Temp: polling del deploy — busca "Repelón" y "esAbreviacion" en chunks servidos
const BASE = "https://fenagacol-front.vercel.app";
const NEEDLES = ["Repelón", "esAbreviacion"];

for (let i = 0; i < 12; i++) {
  const html = await (await fetch(BASE + "/registro")).text();
  const chunks = [...new Set([...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]))];
  let found = false;
  for (const c of chunks) {
    const j = await (await fetch(BASE + c)).text();
    if (NEEDLES.every((n) => j.includes(n))) { found = true; break; }
  }
  console.log(`[${i}] chunks=${chunks.length} nuevo=${found ? "SÍ ✅" : "aún no"}`);
  if (found) { console.log("DEPLOY bcf65c9 EN PRODUCCIÓN ✅"); process.exit(0); }
  await new Promise((r) => setTimeout(r, 30000));
}
process.exit(2);
