import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { ReportsOverviewPayload } from "./types";
import { getKpiLabel, getSectionTitle, type ReportLocale } from "./labels";
import type { ReportSectionId } from "./types";

const theme = {
  primary: "#5B21B6",
  primaryDark: "#4C1D95",
  accent: "#7C3AED",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  white: "#FFFFFF",
  positive: "#059669",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: theme.white,
    color: theme.text,
  },
  headerBand: {
    backgroundColor: theme.primary,
    paddingVertical: 28,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  brand: {
    fontSize: 11,
    color: "#C4B5FD",
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.white,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: "#DDD6FE",
  },
  body: {
    paddingHorizontal: 40,
  },
  sectionLabel: {
    fontSize: 8,
    color: theme.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  kpiCard: {
    width: "31%",
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    minWidth: 140,
  },
  kpiLabel: {
    fontSize: 8,
    color: theme.muted,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.primaryDark,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: theme.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontWeight: "bold",
    color: theme.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tableRowAlt: {
    backgroundColor: theme.surface,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: theme.text,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: theme.muted,
  },
  emptyNote: {
    fontSize: 10,
    color: theme.muted,
    fontStyle: "italic",
    padding: 16,
    textAlign: "center",
  },
});

function ReportPdfDoc({
  sectionTitle,
  rangeLabel,
  generatedAt,
  locale,
  kpis,
  tableHeaders,
  tableRows,
}: {
  sectionTitle: string;
  rangeLabel: string;
  generatedAt: string;
  locale: ReportLocale;
  kpis: { label: string; value: string }[];
  tableHeaders: string[];
  tableRows: string[][];
}) {
  const generatedLabel =
    locale === "en"
      ? `Generated ${generatedAt}`
      : `Gjeneruar më ${generatedAt}`;
  const confidential =
    locale === "en" ? "Confidential — IT Arena" : "Konfidencial — IT Arena";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.brand}>IT Arena</Text>
          <Text style={styles.title}>{sectionTitle}</Text>
          <Text style={styles.subtitle}>{rangeLabel}</Text>
        </View>

        <View style={styles.body}>
          {kpis.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>
                {locale === "en" ? "Key metrics" : "Metrikat kryesore"}
              </Text>
              <View style={styles.kpiGrid}>
                {kpis.map((k) => (
                  <View key={k.label} style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>{k.label}</Text>
                    <Text style={styles.kpiValue}>{k.value}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.sectionLabel}>
            {locale === "en" ? "Detail" : "Detaje"}
          </Text>
          {tableRows.length === 0 ? (
            <Text style={styles.emptyNote}>
              {locale === "en" ? "No data for this period." : "Nuk ka të dhëna për këtë periudhë."}
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                {tableHeaders.map((h) => (
                  <Text key={h} style={styles.tableHeaderCell}>
                    {h}
                  </Text>
                ))}
              </View>
              {tableRows.map((row, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  {row.map((cell, j) => (
                    <Text key={j} style={styles.tableCell}>
                      {cell}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{confidential}</Text>
          <Text style={styles.footerText}>{generatedLabel}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function buildPdfBuffer(
  section: ReportSectionId,
  rangeLabel: string,
  data: ReportsOverviewPayload,
  locale: ReportLocale,
  tableHeaders: string[],
  tableRows: string[][]
): Promise<Buffer> {
  const sectionTitle = getSectionTitle(section, locale);
  const generatedAt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(data.generatedAt));

  const kpis = data.kpis.slice(0, 6).map((k) => ({
    label: getKpiLabel(k.key, locale),
    value: k.formatted,
  }));

  const doc = (
    <ReportPdfDoc
      sectionTitle={sectionTitle}
      rangeLabel={rangeLabel}
      generatedAt={generatedAt}
      locale={locale}
      kpis={kpis}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
    />
  );
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
