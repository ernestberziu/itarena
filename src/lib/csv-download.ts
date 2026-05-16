/** RFC 4180-style CSV field (quotes + escape quotes). */
function csvField(value: string | number | boolean | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildClientsCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]) {
  const header = columns.map((c) => csvField(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => csvField(row[c.key] as string | number | boolean | null | undefined)).join(",")
  );
  return [header, ...lines].join("\r\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
