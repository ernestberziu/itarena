/**
 * i18n audit: message key parity (sq vs en) + heuristic scan for inline bilingual patterns.
 * Run: npm run i18n:audit
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES_DIR = join(ROOT, "messages");
const SCAN_DIRS = [join(ROOT, "src", "components"), join(ROOT, "src", "app")];

type FlatKeys = Map<string, string>;

function flatten(obj: unknown, prefix = ""): FlatKeys {
  const out: FlatKeys = new Map();
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.set(path, v);
    else {
      for (const [ek, ev] of flatten(v, path)) out.set(ek, ev);
    }
  }
  return out;
}

function loadLocale(locale: "sq" | "en"): FlatKeys {
  const raw = readFileSync(join(MESSAGES_DIR, `${locale}.json`), "utf8");
  return flatten(JSON.parse(raw) as unknown);
}

function walkTsFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walkTsFiles(p, acc);
    } else if (/\.(tsx?|jsx?)$/.test(name)) acc.push(p);
  }
  return acc;
}

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "locale === sq ternary", re: /locale\s*===\s*["']sq["']/ },
  { name: "inline t(sq, en)", re: /\bt\s*\(\s*["'][^"']+["']\s*,\s*["']/ },
  { name: "table th(sq, en)", re: /\bth\s*\(\s*["'][^"']+["']\s*,\s*["']/ },
  { name: "en ? e : sq helper", re: /\(en\s*\?\s*e\s*:\s*sq\)/ },
];

function main() {
  const sq = loadLocale("sq");
  const en = loadLocale("en");
  const sqKeys = new Set(sq.keys());
  const enKeys = new Set(en.keys());

  const onlySq = [...sqKeys].filter((k) => !enKeys.has(k)).sort();
  const onlyEn = [...enKeys].filter((k) => !sqKeys.has(k)).sort();

  console.log("=== Message key parity ===");
  console.log(`sq keys: ${sqKeys.size}, en keys: ${enKeys.size}`);
  if (onlySq.length) {
    console.log(`\nOnly in sq (${onlySq.length}):`);
    onlySq.slice(0, 30).forEach((k) => console.log(`  - ${k}`));
    if (onlySq.length > 30) console.log(`  ... +${onlySq.length - 30} more`);
  }
  if (onlyEn.length) {
    console.log(`\nOnly in en (${onlyEn.length}):`);
    onlyEn.slice(0, 30).forEach((k) => console.log(`  - ${k}`));
    if (onlyEn.length > 30) console.log(`  ... +${onlyEn.length - 30} more`);
  }
  if (!onlySq.length && !onlyEn.length) console.log("OK: key sets match.");

  const supportSq = sq.get("nav.createSupportTicket");
  const supportEn = en.get("nav.createSupportTicket");
  console.log("\n=== Support ticket exception ===");
  console.log(
    supportSq === "Support ticket" && supportEn === "Support ticket"
      ? 'OK: nav.createSupportTicket is "Support ticket" in both locales'
      : `WARN: expected "Support ticket", got sq="${supportSq}" en="${supportEn}"`
  );

  console.log("\n=== Inline pattern scan (heuristic) ===");
  const hits: { file: string; pattern: string; count: number }[] = [];
  for (const dir of SCAN_DIRS) {
    for (const file of walkTsFiles(dir)) {
      const text = readFileSync(file, "utf8");
      const rel = relative(ROOT, file);
      for (const { name, re } of PATTERNS) {
        const matches = text.match(new RegExp(re.source, "g"));
        if (matches?.length) hits.push({ file: rel, pattern: name, count: matches.length });
      }
    }
  }
  hits.sort((a, b) => b.count - a.count);
  const byPattern = new Map<string, number>();
  for (const h of hits) byPattern.set(h.pattern, (byPattern.get(h.pattern) ?? 0) + h.count);
  for (const [name, total] of byPattern) console.log(`  ${name}: ${total} occurrence(s) in ${hits.filter((h) => h.pattern === name).length} file(s)`);
  console.log("\nTop files:");
  const byFile = new Map<string, number>();
  for (const h of hits) byFile.set(h.file, (byFile.get(h.file) ?? 0) + h.count);
  [...byFile.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .forEach(([f, c]) => console.log(`  ${c}\t${f}`));

  const failed = onlySq.length + onlyEn.length;
  if (failed > 0) process.exit(1);
}

main();
