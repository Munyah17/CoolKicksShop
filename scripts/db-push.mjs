// Apply Supabase migrations via the Management API (no DB password needed).
// Usage: node scripts/db-push.mjs [migrationFile ...]
// Reads SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF from .env.local.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}

const env = loadEnv();
const token = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF || env.SUPABASE_PROJECT_REF;
if (!token || !ref) {
  console.error("Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF in .env.local");
  process.exit(1);
}

const dir = "supabase/migrations";
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => join(dir, f));

const url = `https://api.supabase.com/v1/projects/${ref}/database/query`;

for (const file of files) {
  const sql = readFileSync(file, "utf8");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAIL ${file}: ${res.status} ${text}`);
    process.exit(1);
  }
  console.log(`OK   ${file}`);
}
console.log("Done.");
