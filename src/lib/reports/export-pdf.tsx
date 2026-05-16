import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { ReportsOverviewPayload } from "./types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 8, fontWeight: "bold" },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 6 },
  cell: { flex: 1 },
  header: { fontWeight: "bold", backgroundColor: "#f5f5f5" },
});

function ReportPdfDoc({
  title,
  rangeLabel,
  kpis,
  tableHeaders,
  tableRows,
}: {
  title: string;
  rangeLabel: string;
  kpis: { label: string; value: string }[];
  tableHeaders: string[];
  tableRows: string[][];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>ITArena — {title}</Text>
        <Text style={styles.subtitle}>{rangeLabel}</Text>
        <View style={{ marginBottom: 16 }}>
          {kpis.map((k) => (
            <Text key={k.label}>
              {k.label}: {k.value}
            </Text>
          ))}
        </View>
        <View style={[styles.row, styles.header]}>
          {tableHeaders.map((h) => (
            <Text key={h} style={styles.cell}>
              {h}
            </Text>
          ))}
        </View>
        {tableRows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((cell, j) => (
              <Text key={j} style={styles.cell}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function buildPdfBuffer(
  sectionTitle: string,
  rangeLabel: string,
  data: ReportsOverviewPayload,
  tableHeaders: string[],
  tableRows: string[][]
): Promise<Buffer> {
  const kpis = data.kpis.slice(0, 6).map((k) => ({
    label: k.key,
    value: k.formatted,
  }));
  const doc = (
    <ReportPdfDoc
      title={sectionTitle}
      rangeLabel={rangeLabel}
      kpis={kpis}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
    />
  );
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
