#!/usr/bin/env node
// Direito ao esquecimento (LGPD): apaga os dados de um titular do D1.
// Gera os comandos wrangler (não executa sozinho — você revê e roda).
// Uso:
//   node apagar-dados.mjs --click_id abc123
//   node apagar-dados.mjs --ip 200.1.2.3 --salt "$IP_SALT"   (recalcula o hash)
import crypto from "node:crypto";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), [])
);

let where;
if (args.click_id) {
  where = `click_id = '${esc(args.click_id)}'`;
} else if (args.ip) {
  const salt = args.salt || process.env.IP_SALT || "";
  if (!salt) { console.error("Para apagar por IP, passe --salt ou defina IP_SALT (o mesmo do Worker)."); process.exit(2); }
  const hash = crypto.createHash("sha256").update(args.ip + salt).digest("hex");
  where = `ip_hash = '${hash}'`;
} else {
  console.error("Informe --click_id <id>  OU  --ip <ip> [--salt <salt>]");
  process.exit(2);
}

// events e conversions casam pelo click_id dos cliques do titular; clicks pelo próprio filtro.
const sub = `click_id IN (SELECT click_id FROM clicks WHERE ${where})`;
const cmd = (sql) => `npx wrangler d1 execute noma_tracking --remote --command "${sql}"`;

console.log("\n# Revise e rode na pasta infra/cloudflare/tracker:\n");
console.log("# 1) confira quem será apagado:");
console.log(cmd(`SELECT click_id, channel, created_at FROM clicks WHERE ${where};`));
console.log("\n# 2) apague (events e conversions primeiro, depois clicks):");
console.log(cmd(`DELETE FROM events WHERE ${sub};`));
console.log(cmd(`DELETE FROM conversions WHERE ${sub};`));
console.log(cmd(`DELETE FROM clicks WHERE ${where};`));
console.log("");

function esc(s) { return String(s).replace(/'/g, "''"); }
