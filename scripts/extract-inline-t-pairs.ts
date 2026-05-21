/**
 * Collect t("sq", "en") and th("sq", "en") pairs into messages (admin.ui / portal.ui).
 * Run: npx tsx scripts/extract-inline-t-pairs.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = [
  join(ROOT, "src/components/admin"),
  join(ROOT, "src/components/portal"),
  join(ROOT, "src/app/[locale]/admin"),
  join(ROOT, "src/app/[locale]/portal"),
];

const RE = /\b(?:t|th|tUi|thUi)\s*\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/g;

function slugify(en: string, used: Set<string>): string {
  let base = en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48) || "text";
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}_${n++}`;
  used.add(slug);
  return slug;
}

function walk(dir: string, acc: string[] = []): string[] {
  try {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, acc);
      else if (/\.tsx?$/.test(name)) acc.push(p);
    }
  } catch {
    /* missing dir */
  }
  return acc;
}

const adminSq: Record<string, string> = {};
const adminEn: Record<string, string> = {};
const portalSq: Record<string, string> = {};
const portalEn: Record<string, string> = {};
const usedAdmin = new Set<string>();
const usedPortal = new Set<string>();
const pairToKey = new Map<string, string>();

function pairKey(sq: string, en: string) {
  return `${sq}\0${en}`;
}

for (const dir of SCAN_DIRS) {
  const isPortal = dir.includes("portal");
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    RE.lastIndex = 0;
    while ((m = RE.exec(text)) !== null) {
      const sq = m[1].replace(/\\"/g, '"');
      const en = m[2].replace(/\\"/g, '"');
      const pk = pairKey(sq, en);
      let slug = pairToKey.get(pk);
      if (!slug) {
        slug = slugify(en, isPortal ? usedPortal : usedAdmin);
        pairToKey.set(pk, slug);
        if (isPortal) {
          portalSq[slug] = sq;
          portalEn[slug] = en;
        } else {
          adminSq[slug] = sq;
          adminEn[slug] = en;
        }
      }
    }
  }
}

function mergeNs(locale: "sq" | "en", top: string, sub: string, keys: Record<string, string>) {
  const path = join(ROOT, `messages/${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const root = data[top] as Record<string, unknown>;
  root[sub] = { ...(root[sub] as Record<string, string>), ...keys };
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

mergeNs("sq", "admin", "ui", adminSq);
mergeNs("en", "admin", "ui", adminEn);
mergeNs("sq", "portal", "ui", portalSq);
mergeNs("en", "portal", "ui", portalEn);

console.log(`admin.ui keys: ${Object.keys(adminSq).length}`);
console.log(`portal.ui keys: ${Object.keys(portalSq).length}`);
