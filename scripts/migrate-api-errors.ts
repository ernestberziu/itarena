/**
 * Bulk-replace common API error JSON with err(request, key, status).
 * Run: npx tsx scripts/migrate-api-errors.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "api");

const MAP: [string, string, number][] = [
  ['{ error: "Unauthorized" }', "unauthorized", 401],
  ['{ error: "Forbidden" }', "forbidden", 403],
  ['{ error: "Invalid JSON" }', "invalidJson", 400],
  ['{ error: "Invalid data" }', "invalidData", 400],
  ['{ error: "Not found" }', "notFound", 404],
  ['{ error: "No fields to update" }', "noFieldsToUpdate", 400],
  ['{ error: "Email already in use" }', "emailInUse", 409],
  ['{ error: "Company not found" }', "notFound", 404],
  ['{ error: "Create failed" }', "createFailed", 500],
  ['{ error: "Update failed" }', "updateFailed", 500],
  ['{ error: "Delete failed" }', "deleteFailed", 500],
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name === "route.ts") acc.push(p);
  }
  return acc;
}

function detectRequestVar(text: string): string {
  const m =
    text.match(/export async function \w+\(\s*(\w+)\s*:\s*NextRequest/) ??
    text.match(/export async function \w+\(\s*(\w+)\s*,/);
  return m?.[1] ?? "request";
}

function migrate(path: string): boolean {
  let text = readFileSync(path, "utf8");
  let changed = false;
  const reqVar = detectRequestVar(text);

  for (const [from, key, status] of MAP) {
  const to = `return apiErr(${reqVar}, "${key}", ${status})`;
  const pattern = `return NextResponse.json(${from}, { status: ${status} })`;
    if (text.includes(pattern)) {
      text = text.split(pattern).join(to);
      changed = true;
    }
  }

  const invalidBody = 'return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 })';
  const invalidBodyTo = `return apiErr(${reqVar}, "invalidBody", 400, { details: parsed.error.flatten() })`;
  if (text.includes(invalidBody)) {
    text = text.split(invalidBody).join(invalidBodyTo);
    changed = true;
  }

  if (!changed) return false;

  if (!text.includes('@/lib/i18n/err')) {
    if (text.includes('from "next/server"')) {
      text = text.replace(
        /import \{([^}]+)\} from "next\/server";/,
        'import { $1 } from "next/server";\nimport { apiErr } from "@/lib/i18n/err";'
      );
    } else {
      text = `import { apiErr } from "@/lib/i18n/err";\n${text}`;
    }
  }

  writeFileSync(path, text);
  return true;
}

let n = 0;
for (const f of walk(API_ROOT)) {
  if (migrate(f)) {
    n++;
    console.log(f);
  }
}
console.log(`Updated ${n} route(s).`);
