/**
 * One-off: replace common hardcoded API error strings with apiErrorResponse().
 * Run: node scripts/migrate-api-errors.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "api");

const REPLACEMENTS = [
  ['{ error: "Unauthorized" }', '{ errorKey: "apiErrors.unauthorized" }'],
  ['{ error: "Forbidden" }', '{ errorKey: "apiErrors.forbidden" }'],
  ['{ error: "Invalid JSON" }', '{ errorKey: "apiErrors.invalidJson" }'],
  ['{ error: "Invalid body", details:', '{ errorKey: "apiErrors.invalidBody", details:'],
  ['{ error: "Invalid data" }', '{ errorKey: "apiErrors.invalidData" }'],
  ['{ error: "Not found" }', '{ errorKey: "apiErrors.notFound" }'],
  ['{ error: "No fields to update" }', '{ errorKey: "apiErrors.noFieldsToUpdate" }'],
  ['{ error: "Email already in use" }', '{ errorKey: "apiErrors.emailInUse" }'],
  ['{ error: "Company not found" }', '{ errorKey: "apiErrors.notFound" }'],
  ['{ error: "Create failed" }', '{ errorKey: "apiErrors.createFailed" }'],
  ['{ error: "Update failed" }', '{ errorKey: "apiErrors.updateFailed" }'],
  ['{ error: "Delete failed" }', '{ errorKey: "apiErrors.deleteFailed" }'],
  ['{ error: "Të dhënat janë të pavlefshme" }', '{ errorKey: "apiErrors.shopInvalidData" }'],
  ['{ error: "Mungon sku (kodi ERP)" }', '{ errorKey: "apiErrors.shopMissingSku" }'],
  ['{ error: "Produkti nuk u gjet" }', '{ errorKey: "apiErrors.shopProductNotFound" }'],
  ['{ error: "Produkti nuk është aktiv" }', '{ errorKey: "apiErrors.shopProductInactive" }'],
  ['{ error: "Gabim i serverit" }', '{ errorKey: "apiErrors.serverError" }'],
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name === "route.ts") acc.push(p);
  }
  return acc;
}

function migrateFile(path) {
  let text = readFileSync(path, "utf8");
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed = true;
    }
  }
  if (!changed) return false;

  if (!text.includes("apiErrorResponse")) {
    const importLine =
      'import { apiErrorResponse } from "@/lib/i18n/api-response";\n';
    if (text.includes('from "next/server"')) {
      text = text.replace(
        /import \{([^}]+)\} from "next\/server";/,
        (m, inner) => {
          if (inner.includes("NextRequest")) {
            return `${m}\n${importLine}`;
          }
          return `import { NextRequest, ${inner.trim()} } from "next/server";\n${importLine}`;
        }
      );
    } else {
      text = importLine + text;
    }
  }

  text = text.replace(
    /return NextResponse\.json\(\{ errorKey: "(apiErrors\.[^"]+)"(?:, details: parsed\.error\.flatten\(\))?\s*\}, \{ status: (\d+) \}\)/g,
    (match, key, status, offset, whole) => {
      if (match.includes("details:")) {
        return `return apiErrorResponse(req, "${key}", ${status}, { details: parsed.error.flatten() })`;
      }
      const reqName = whole.includes("NextRequest") ? "req" : "request";
      return `return apiErrorResponse(${reqName}, "${key}", ${status})`;
    }
  );

  writeFileSync(path, text);
  return true;
}

console.log("Note: run manual fix for request param names after this script.");
for (const f of walk(API_ROOT)) {
  if (migrateFile(f)) console.log("updated", f);
}
