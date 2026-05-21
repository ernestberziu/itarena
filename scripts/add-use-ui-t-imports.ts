import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.tsx$/.test(name)) acc.push(p);
  }
  return acc;
}

let n = 0;
for (const file of walk(join(ROOT, "components"))) {
  const text = readFileSync(file, "utf8");
  if (!text.includes("useUiT()") || text.includes("use-ui-t")) continue;
  let updated = text;
  if (text.includes('"use client"')) {
    updated = text.replace(
      '"use client";\n',
      '"use client";\nimport { useUiT } from "@/hooks/use-ui-t";\n'
    );
  } else {
    updated = `import { useUiT } from "@/hooks/use-ui-t";\n${text}`;
  }
  if (updated !== text) {
    writeFileSync(file, updated);
    n++;
  }
}
console.log(`Added import to ${n} files.`);
