/**
 * Find t("sq","en") / t(`...`, `...`) in files using useUiT; rewrite via admin.ui map.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = [
  join(ROOT, "src/components/admin"),
  join(ROOT, "src/components/portal"),
];

const sqAll = JSON.parse(readFileSync(join(ROOT, "messages/sq.json"), "utf8"));
const enAll = JSON.parse(readFileSync(join(ROOT, "messages/en.json"), "utf8"));

function buildMap(sqUi: Record<string, string>, enUi: Record<string, string>) {
  const map = new Map<string, string>();
  for (const [slug, sq] of Object.entries(sqUi)) {
    const en = enUi[slug];
    if (en) map.set(`${sq}\0${en}`, slug);
  }
  return map;
}

const adminMap = buildMap(sqAll.admin.ui ?? {}, enAll.admin.ui ?? {});
const portalMap = buildMap(sqAll.portal.ui ?? {}, enAll.portal.ui ?? {});

const RE =
  /\bt\s*\(\s*(?:"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)\s*,\s*(?:"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)\s*\)/gs;

function walk(dir: string, acc: string[] = []): string[] {
  try {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, acc);
      else if (/\.tsx$/.test(name)) acc.push(p);
    }
  } catch {
    /* */
  }
  return acc;
}

let total = 0;
for (const dir of SCAN) {
  const map = dir.includes("portal") ? portalMap : adminMap;
  for (const file of walk(dir)) {
    let text = readFileSync(file, "utf8");
    if (!text.includes("useUiT") && !text.includes("use-ui-t")) continue;
    let changed = false;
    text = text.replace(RE, (full, sq1, sq2, en1, en2) => {
      const sq = (sq1 ?? sq2 ?? "").replace(/\\"/g, '"');
      const en = (en1 ?? en2 ?? "").replace(/\\"/g, '"');
      const slug = map.get(`${sq}\0${en}`);
      if (!slug) {
        console.warn(`[missing] ${file}\n  sq: ${sq.slice(0, 60)}\n  en: ${en.slice(0, 60)}`);
        return full;
      }
      changed = true;
      return `tUi("${slug}")`;
    });
    if (changed) {
      writeFileSync(file, text);
      total++;
      console.log("fixed:", file.replace(ROOT + "/", ""));
    }
  }
}
console.log(`Fixed ${total} files.`);
