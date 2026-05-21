/**
 * Rewrite t("sq","en") -> tUi("key") using pair map from messages.
 * Run after extract-inline-t-pairs.ts
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

function buildReverseMap(sqUi: Record<string, string>, enUi: Record<string, string>) {
  const map = new Map<string, string>();
  for (const [slug, sq] of Object.entries(sqUi)) {
    const en = enUi[slug];
    if (en) map.set(`${sq}\0${en}`, slug);
  }
  return map;
}

const sqAll = JSON.parse(readFileSync(join(ROOT, "messages/sq.json"), "utf8"));
const enAll = JSON.parse(readFileSync(join(ROOT, "messages/en.json"), "utf8"));
const adminMap = buildReverseMap(sqAll.admin.ui ?? {}, enAll.admin.ui ?? {});
const portalMap = buildReverseMap(sqAll.portal.ui ?? {}, enAll.portal.ui ?? {});

const RE = /\b(t|th|tUi|thUi)\s*\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/g;

function walk(dir: string, acc: string[] = []): string[] {
  try {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, acc);
      else if (/\.tsx?$/.test(name)) acc.push(p);
    }
  } catch {
    /* */
  }
  return acc;
}

let files = 0;
for (const dir of SCAN_DIRS) {
  const isPortal = dir.includes("portal");
  const map = isPortal ? portalMap : adminMap;
  for (const file of walk(dir)) {
    let text = readFileSync(file, "utf8");
    if (
      !text.includes('t("') &&
      !text.includes('t(\'') &&
      !text.includes('th("') &&
      !text.includes("th('") &&
      !text.includes('thUi("') &&
      !text.includes('tUi("')
    )
      continue;
    let changed = false;
    text = text.replace(RE, (full, fn, sqRaw, enRaw) => {
      const sq = sqRaw.replace(/\\"/g, '"');
      const en = enRaw.replace(/\\"/g, '"');
      const slug = map.get(`${sq}\0${en}`);
      if (!slug) return full;
      changed = true;
      const call = fn === "th" || fn === "thUi" ? "thUi" : "tUi";
      return `${call}("${slug}")`;
    });
    if (!changed) continue;

    text = text.replace(
      /const\s+t\s*=\s*\(\s*\w+\s*:\s*string\s*,\s*\w+\s*:\s*string\s*\)\s*=>\s*\(\s*\w+\s*\?\s*\w+\s*:\s*\w+\s*\)\s*;?/g,
      "const tUi = useUiT();"
    );
    text = text.replace(
      /const\s+th\s*=\s*\(\s*\w+\s*:\s*string\s*,\s*\w+\s*:\s*string\s*\)\s*=>\s*\(\s*\w+\s*\?\s*\w+\s*:\s*\w+\s*\)\s*;?/g,
      "const thUi = useUiT();"
    );
    text = text.replace(
      /const\s+th\s*=\s*\(\s*\w+\s*:\s*string\s*,\s*\w+\s*:\s*string\s*\)\s*=>\s*\(\s*locale\s*===\s*"en"\s*\?\s*\w+\s*:\s*\w+\s*\)\s*;?/g,
      "const thUi = useUiT();"
    );
    text = text.replace(
      /const\s+en\s*=\s*locale\s*===\s*"en"\s*;?\s*\n\s*const\s+t\s*=\s*\(\s*\w+\s*:\s*string\s*,\s*\w+\s*:\s*string\s*\)\s*=>\s*\(\s*en\s*\?\s*\w+\s*:\s*\w+\s*\)\s*;?/g,
      "const tUi = useUiT();"
    );

    if (!text.includes("useUiT")) {
      if (text.startsWith('"use client"')) {
        text = text.replace(
          '"use client";\n',
          '"use client";\nimport { useUiT } from "@/hooks/use-ui-t";\n'
        );
      } else if (/^export function/.test(text) || /^function/.test(text)) {
        text = `import { useUiT } from "@/hooks/use-ui-t";\n${text}`;
      }
    }

    writeFileSync(file, text);
    files++;
  }
}

console.log(`Rewrote ${files} files.`);
