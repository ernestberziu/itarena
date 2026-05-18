import React from "react";
import { Text, View, StyleSheet, type Styles } from "@react-pdf/renderer";

const cobalt = "#1400D4";
const body = "#334155";
const heading = "#0F172A";

const styles = StyleSheet.create({
  h1: {
    fontSize: 15,
    fontWeight: "bold",
    color: heading,
    marginBottom: 8,
    marginTop: 14,
  },
  h2: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: cobalt,
    marginBottom: 5,
    marginTop: 12,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DBEAFE",
  },
  h3: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: heading,
    marginBottom: 4,
    marginTop: 8,
  },
  p: {
    fontSize: 9.5,
    lineHeight: 1.65,
    marginBottom: 5,
    color: body,
  },
  li: {
    fontSize: 9.5,
    lineHeight: 1.6,
    marginBottom: 3,
    paddingLeft: 10,
    color: body,
  },
  bold: { fontWeight: "bold" },
  // Separator line (---)
  hr: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    marginVertical: 6,
  },
  table: {
    marginBottom: 8,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 4,
  },
  tableRow: { flexDirection: "row" },
  tableRowHeader: { flexDirection: "row", backgroundColor: "#F8FAFC" },
  tableRowEven: { flexDirection: "row", backgroundColor: "#FAFAFA" },
  tableCell: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    fontSize: 9,
    color: body,
    borderRightWidth: 0.5,
    borderRightColor: "#E2E8F0",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  tableCellHeader: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    fontSize: 8.5,
    fontWeight: "bold",
    color: heading,
    borderRightWidth: 0.5,
    borderRightColor: "#E2E8F0",
    borderBottomWidth: 0.5,
    borderBottomColor: "#CBD5E1",
  },
});

// ── Inline bold parsing ────────────────────────────────────────────────────────

type Chunk = { text: string; bold: boolean };

function splitBold(text: string): Chunk[] {
  const parts: Chunk[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts.length ? parts : [{ text, bold: false }];
}

function RichLine({ line }: { line: string }) {
  const chunks = splitBold(line);
  return (
    <Text style={styles.p}>
      {chunks.map((c, i) => (
        <Text key={i} style={c.bold ? styles.bold : undefined}>
          {c.text}
        </Text>
      ))}
    </Text>
  );
}

// ── Table helpers ─────────────────────────────────────────────────────────────

function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1) // strip leading/trailing empty segments from | ... |
    .map((c) => c.trim());
}

function isSeparatorRow(line: string): boolean {
  return /^\|[\s|:\-]+\|$/.test(line.trim());
}

function isTableLine(line: string): boolean {
  return line.trimStart().startsWith("|");
}

// Strip inline markdown so PDF table cells render plain text (no fake italics from _)
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\*(.+?)\*/g, "$1");
}

function renderInlineCell(text: string): React.ReactNode {
  const chunks = splitBold(stripInlineMarkdown(text));
  return chunks.map((c, i) => (
    <Text key={i} style={c.bold ? styles.bold : undefined}>
      {c.text}
    </Text>
  ));
}

function TableBlock({
  nodeKey,
  headers,
  rows,
}: {
  nodeKey: number;
  headers: string[];
  rows: string[][];
}) {
  const colCount = headers.length;
  return (
    <View key={nodeKey} style={styles.table} wrap={false}>
      {/* Header row */}
      <View style={styles.tableRowHeader}>
        {headers.map((h, ci) => (
          <View
            key={ci}
            style={[
              styles.tableCellHeader,
              ci === colCount - 1 ? { borderRightWidth: 0 } : {},
            ] as Styles[number][]}
          >
            <Text>{stripInlineMarkdown(h)}</Text>
          </View>
        ))}
      </View>
      {/* Data rows */}
      {rows.map((row, ri) => {
        const isLast = ri === rows.length - 1;
        const isEven = ri % 2 === 1;
        return (
          <View
            key={ri}
            style={isEven ? styles.tableRowEven : styles.tableRow}
          >
            {headers.map((_, ci) => {
              const cell = row[ci] ?? "";
              return (
                <View
                  key={ci}
                  style={[
                    styles.tableCell,
                    ci === colCount - 1 ? { borderRightWidth: 0 } : {},
                    isLast ? { borderBottomWidth: 0 } : {},
                  ] as Styles[number][]}
                >
                  <Text>{renderInlineCell(cell)}</Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ── Node types ────────────────────────────────────────────────────────────────

type Node =
  | { kind: "h1" | "h2" | "h3"; text: string }
  | { kind: "p"; line: string }
  | { kind: "li"; text: string }
  | { kind: "hr" }
  | { kind: "table"; headers: string[]; rows: string[][] };

function renderNode(node: Node, key: number): React.ReactNode {
  switch (node.kind) {
    case "h1": return <Text key={key} style={styles.h1}>{node.text}</Text>;
    case "h2": return <Text key={key} style={styles.h2}>{node.text}</Text>;
    case "h3": return <Text key={key} style={styles.h3}>{node.text}</Text>;
    case "li": return <Text key={key} style={styles.li}>• {node.text}</Text>;
    case "hr": return <View key={key} style={styles.hr} />;
    case "p": return <RichLine key={key} line={node.line} />;
    case "table":
      return (
        <TableBlock
          key={key}
          nodeKey={key}
          headers={node.headers}
          rows={node.rows}
        />
      );
  }
}

// ── Section grouping ──────────────────────────────────────────────────────────
//
// Each ## heading is grouped with its following content into a Section. Within
// each section the heading is anchored to the first body node via wrap={false},
// so the heading can never be left alone at the bottom of a page (orphan).
// The rest of the section flows normally.

type Section = {
  heading: Node | null; // h1 or h2
  body: Node[];
};

function groupSections(nodes: Node[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { heading: null, body: [] };

  for (const node of nodes) {
    if (node.kind === "h1" || node.kind === "h2") {
      sections.push(current);
      current = { heading: node, body: [] };
    } else {
      current.body.push(node);
    }
  }
  sections.push(current);
  return sections.filter((s) => s.heading !== null || s.body.length > 0);
}

// ── Line parser (single-line nodes) ──────────────────────────────────────────

function parseSingleLine(raw: string): Exclude<Node, { kind: "table" }> | null {
  const line = raw.trimEnd();
  if (!line.trim()) return null;
  if (line.startsWith("### ")) return { kind: "h3", text: line.slice(4).replace(/\*\*/g, "") };
  if (line.startsWith("## ")) return { kind: "h2", text: line.slice(3).replace(/\*\*/g, "") };
  if (line.startsWith("# ")) return { kind: "h1", text: line.slice(2).replace(/\*\*/g, "") };
  if (line.startsWith("- ")) return { kind: "li", text: line.slice(2) };
  if (/^-{3,}$/.test(line.trim())) return { kind: "hr" };
  return { kind: "p", line };
}

// ── Public component ──────────────────────────────────────────────────────────

export function MarkdownPdfBlocks({ markdown }: { markdown: string }) {
  const allNodes: Node[] = [];
  let nodeKey = 0;

  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    if (isTableLine(raw)) {
      // Collect contiguous table lines
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = parseTableRow(tableLines[0]);
        const dataLines = tableLines.slice(1).filter((l) => !isSeparatorRow(l));
        const rows = dataLines.map(parseTableRow);
        allNodes.push({ kind: "table", headers, rows });
      }
      continue;
    }
    const node = parseSingleLine(raw);
    if (node) allNodes.push(node);
    i++;
  }

  const sections = groupSections(allNodes);

  return (
    <View>
      {sections.map((section, si) => {
        const [first, ...rest] = section.body;

        return (
          <View key={si}>
            {/*
             * Anchor group: heading + first body node rendered together with
             * wrap={false}. This prevents the heading being alone at the bottom
             * of a page. If there is no first body node, just keep the heading.
             */}
            {section.heading && (
              <View wrap={false}>
                {renderNode(section.heading, nodeKey++)}
                {first && renderNode(first, nodeKey++)}
              </View>
            )}
            {!section.heading && first && renderNode(first, nodeKey++)}

            {/* Remaining body nodes flow naturally across pages */}
            {rest.map((node) => renderNode(node, nodeKey++))}
          </View>
        );
      })}
    </View>
  );
}
