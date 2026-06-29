#!/usr/bin/env node
// Validador do repo — roda local (`node scripts/validate.mjs`) e na CI.
// Checa: JSON parseável, skills com frontmatter (name+description+user_invocable),
// e que os arquivos referenciados pelo plugin/infra existem.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const errs = [];
const ok = (m) => console.log("  ✓ " + m);
const err = (m) => { errs.push(m); console.log("  ✗ " + m); };

function walk(dir, filter, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".wrangler") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, filter, acc);
    else if (filter(full)) acc.push(full);
  }
  return acc;
}

console.log("JSON válido:");
for (const f of walk(ROOT, (f) => f.endsWith(".json"))) {
  try { JSON.parse(readFileSync(f, "utf8")); ok(f.replace(ROOT + "/", "")); }
  catch (e) { err(`${f.replace(ROOT + "/", "")}: ${e.message}`); }
}

console.log("\nSkills com frontmatter:");
for (const dir of readdirSync(join(ROOT, "skills"))) {
  const p = join(ROOT, "skills", dir, "SKILL.md");
  if (!existsSync(p)) { err(`skills/${dir}: sem SKILL.md`); continue; }
  const txt = readFileSync(p, "utf8");
  const fm = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { err(`skills/${dir}: sem frontmatter`); continue; }
  for (const key of ["name:", "description:", "user_invocable:"]) {
    if (!fm[1].includes(key)) err(`skills/${dir}: falta '${key}' no frontmatter`);
  }
  if (fm) ok(`skills/${dir}`);
}

console.log("\nArquivos-chave da infra:");
for (const rel of [
  "infra/cloudflare/tracker/src/index.js",
  "infra/cloudflare/tracker/schema.sql",
  "infra/cloudflare/tracker/wrangler.toml",
  "infra/cloudflare/pages/index.html",
  "infra/n8n/shopee-reconciliacao-capi.json",
]) {
  existsSync(join(ROOT, rel)) ? ok(rel) : err(`faltando: ${rel}`);
}

console.log("\nSegredos não vazados (.dev.vars / *.secret no git):");
const leaked = walk(ROOT, (f) => /\.dev\.vars$|\.secret$|\.token$/.test(f) && !f.endsWith(".example"));
leaked.length ? leaked.forEach((f) => err(`arquivo sensível versionável: ${f}`)) : ok("nenhum");

console.log(errs.length ? `\n❌ ${errs.length} problema(s).` : "\n✅ Tudo válido.");
process.exit(errs.length ? 1 : 0);
