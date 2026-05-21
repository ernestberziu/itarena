/**
 * Extract t("Sq text", "En text") pairs into admin.ui / portal.ui message keys and rewrite sources.
 * Run: npx tsx scripts/migrate-inline-t.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = [join(ROOT, "src/components/admin"), join(ROOT, "src/components/portal"), join(ROOT, "src/app/[locale]/admin"), join(ROOT, "src/app/[locale]/portal")];

const PAIR_RE = /\bt\s*\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/g;
const TH_RE = /\bth\s*\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/g;
const HELPER_RE = /const\s+t\s*=\s*\([^)]*\)\s*=>\s*\([^)]*\?\s*[^:]+\s*:\s*[^)]+\)/;
const TH_HELPER_RE = /const\s+th\s*=\s*\([^)]*\)\s*=>\s*\([^)]*\?\s*[^:]+\s*:\s*[^)]+\)/;

function slugify(en: string): string {
  const base = en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join("_");
  return base || "key";
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!statSync(dir, { throwIfNoMatch: false })) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx?)$/.test(name)) acc.push(p);
  }
  return acc;
}

type Pair = { sq: string; en: string; slug: string };
const pairs = new Map<string, Pair>();

function register(sq: string, en: string) {
  const slugBase = slugify(en);
  let slug = slugBase;
  let n = 2;
  while (pairs.has(slug) && pairs.get(slug)!.en !== en) {
    slug = `${slugBase}_${n++}`;
  }
  if (!pairs.has(slug)) pairs.set(slug, { sq, en, slug });
}

function namespaceFor(path: string): "admin.ui" | "portal.ui" {
  return path.includes("/portal/") || path.includes("[locale]/portal") ? "portal.ui" : "admin.ui";
}

const fileChanges: { path: string; ns: string }[] = [];

for (const dir of SCAN) {
  for (const file of walk(dir)) {
    let text = readFileSync(file, "utf8");
    if (!HELPER_RE.test(text) && !text.includes("t(\"") && !text.includes("th(\"")) continue;

    const ns = namespaceFor(file);
    let changed = false;

    text = text.replace(PAIR_RE, (_, sq, en) => {
      register(sq, en);
      const p = pairs.get(slugify(en)) ?? pairs.get([...pairs.keys()].find((k) => pairs.get(k)!.en === en)!)!;
      const key = [...pairs.entries()].find(([, v]) => v.sq === sq && v.en === en)?.[0] ?? slugify(en);
      register(sq, en);
      const finalKey = [...pairs.entries()].find(([, v]) => v.sq === sq && v.en === en)![0];
      changed = true;
      return `tUi("${finalKey}")`;
    });

    // Re-scan for th(
    const text2 = text;
    text = text2.replace(TH_RE, (_, sq, en) => {
      register(sq, en);
      const finalKey = [...pairs.entries()].find(([, v]) => v.sq === sq && v.en === en)![0];
      changed = true;
      return `thUi("${finalKey}")`;
    });

    if (!changed) continue;

    if (HELPER_RE.test(text)) {
      text = text.replace(HELPER_RE, 'const tUi = useUiT()');
    }
    if (TH_HELPER_RE.test(text)) {
      text = text.replace(TH_HELPER_RE, 'const thUi = useUiT()');
    }

    if (!text.includes("useUiT")) {
      if (text.includes('"use client"')) {
        text = text.replace(
          /"use client";\n/,
          '"use client";\nimport { useUiT } from "@/hooks/use-ui-t";\n'
        );
      } else {
        text = `import { useUiT } from "@/hooks/use-ui-t";\n${text}`;
      }
    }

    // Remove unused locale param patterns in component - skip for safety

    writeFileSync(file, text);
    fileChanges.push({ path: file, ns });
  }
}

const adminUi: Record<string, string> = {};
const portalUi: Record<string, string> = {};
const adminUiEn: Record<string, string> = {};
const portalUiEn: Record<string, string> = {};

for (const [, { sq, en, slug }] of pairs) {
  adminUi[slug] = sq;
  adminUiEn[slug] = en;
}

// Split pairs by which namespace files referenced - simplified: all in both for now use admin
for (const [, { sq, en, slug }] of pairs) {
  portalUi[slug] = sq;
  portalUiEn[slug] = en;
}

function mergeMessages(path: string, ns: string, sqKeys: Record<string, string>, enKeys: Record<string, string>) {
  const sq = JSON.parse(readFileSync(join(ROOT, "messages/sq.json"), "utf8")) as Record<string, unknown>;
  const en = JSON.parse(readFileSync(join(ROOT, "messages/en.json"), "utf8")) as Record<string, unknown>;
  const [top, sub] = ns.split(".");
  const sqRoot = sq[top] as Record<string, unknown>;
  const enRoot = en[top] as Record<string, unknown>;
  sqRoot[sub] = { ...(sqRoot[sub] as Record<string, string>), ...sqKeys };
  enRoot[sub] = { ...(enRoot[sub] as Record<string, string>), ...enKeys };
  writeFileSync(join(ROOT, "messages/sq.json"), JSON.stringify(sq, null, 2) + "\n");
  writeFileSync(join(ROOT, "messages/en.json"), JSON.stringify(en, null, 2) + "\n");
}

// Only add keys that were collected
const adminPairs: Record<string, { sq: string; en: string }> = {};
const portalPairs: Record<string, { sq: string; en: string }> = {};
for (const [, p] of pairs) {
  adminPairs[p.slug] = { sq: p.sq, en: p.en };
  portalPairs[p.slug] = { sq: p.sq, en: p.en };
}

mergeMessages(
  "admin",
  "ui",
  Object.fromEntries(Object.entries(adminPairs).map(([k, v]) => [k, v.sq])),
  Object.fromEntries(Object.entries(adminPairs).map(([k, v]) => [k, v.en]))
);
mergeMessages(
  "portal",
  "ui",
  Object.fromEntries(Object.entries(portalPairs).map(([k, v]) => [k, v.sq])),
  Object.fromEntries(Object.entries(portalPairs).map(([k, v]) => [k, v.en]))
);

console.log(`Pairs: ${pairs.size}, files touched: ${fileChanges.length}`);
