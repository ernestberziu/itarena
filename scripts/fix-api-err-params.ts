/**
 * Fix apiErr(firstArg) to match handler parameter name (req vs _req vs request).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "api");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name === "route.ts") acc.push(p);
  }
  return acc;
}

function fixFile(path: string): boolean {
  let text = readFileSync(path, "utf8");
  const original = text;
  const handlerRe =
    /export async function (GET|POST|PUT|PATCH|DELETE)\s*\(\s*(\w+)(?::[^)]*)?/g;
  let m: RegExpExecArray | null;
  const handlers: { start: number; param: string }[] = [];
  while ((m = handlerRe.exec(text)) !== null) {
    handlers.push({ start: m.index, param: m[2] });
  }
  if (!handlers.length) return false;

  for (let i = handlers.length - 1; i >= 0; i--) {
    const start = handlers[i].start;
    const end = i + 1 < handlers.length ? handlers[i + 1].start : text.length;
    const param = handlers[i].param;
    const chunk = text.slice(start, end);
    const fixed = chunk.replace(/apiErr\(\s*\w+\s*,/g, `apiErr(${param},`);
    text = text.slice(0, start) + fixed + text.slice(end);
  }

  // Standalone helpers at top of file (no request param)
  text = text.replace(
    /(function forbidIfNotStaff[\s\S]*?return )apiErr\(\s*\w+\s*,\s*"forbidden"/g,
    '$1apiErr("sq", "forbidden"'
  );
  text = text.replace(
    /(function assertStaff[\s\S]*?return )apiErr\(\s*\w+\s*,\s*"forbidden"/g,
    '$1apiErr("sq", "forbidden"'
  );

  if (text === original) return false;
  writeFileSync(path, text);
  return true;
}

let n = 0;
for (const f of walk(API_ROOT)) {
  if (fixFile(f)) {
    n++;
    console.log(f);
  }
}
console.log(`Fixed ${n} files.`);
