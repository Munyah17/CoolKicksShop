// Trigger a Vercel production deploy from the current git HEAD.
// Usage:
//   node scripts/deploy.mjs            -> prod deploy, normal build cache
//   node scripts/deploy.mjs --no-cache -> prod deploy, ignore build cache (--force)
// Reads VERCEL_TOKEN / VERCEL_ORG_ID / VERCEL_PROJECT_ID from .env.local.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const env = {};
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2];
  }
} catch {}

const token = process.env.VERCEL_TOKEN || env.VERCEL_TOKEN;
const orgId = process.env.VERCEL_ORG_ID || env.VERCEL_ORG_ID;
const projectId = process.env.VERCEL_PROJECT_ID || env.VERCEL_PROJECT_ID;
if (!token || !orgId || !projectId) {
  console.error("Missing VERCEL_TOKEN / VERCEL_ORG_ID / VERCEL_PROJECT_ID in .env.local");
  process.exit(1);
}

const noCache = process.argv.includes("--no-cache");
const args = ["vercel@latest", "deploy", "--prod", "--yes", "--token", token];
if (noCache) args.push("--force");

const r = spawnSync("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, VERCEL_ORG_ID: orgId, VERCEL_PROJECT_ID: projectId },
});
process.exit(r.status ?? 1);
