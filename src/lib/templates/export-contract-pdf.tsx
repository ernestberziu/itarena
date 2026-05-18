import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Svg,
  Circle,
  Rect,
} from "@react-pdf/renderer";
import { MarkdownPdfBlocks } from "./markdown-to-pdf";
import type { ContractParty, TemplateLanguage, TemplateSettingsConfig } from "./types";

// Brand colours — must match the live preview and ItArenaLogo component
const brand = {
  cobalt: "#1400D4",
  charcoal: "#2D2D38",
  text: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  strip: "#1400D4", // left accent bar
};

// ─── Logo mark (SVG primitives) ───────────────────────────────────────────────
// Mirrors ItArenaLogo geometry at mark size m=30
const M = 30;
const dotR = M * 0.13;
const dotCY = dotR;
const cx = M / 2;
const dotSpacing = M * 0.36;
const leftCX = cx - dotSpacing;
const rightCX = cx + dotSpacing;
const pillW = M * 0.24;
const pillH = M * 0.52;
const pillX = cx - pillW / 2;
const pillY = dotCY + dotR + M * 0.06;
const markH = Math.ceil(pillY + pillH);

function LogoMark() {
  return (
    <Svg width={M} height={markH} viewBox={`0 0 ${M} ${markH}`}>
      <Circle cx={leftCX} cy={dotCY} r={dotR} fill={brand.charcoal} />
      <Circle cx={cx} cy={dotCY} r={dotR} fill={brand.cobalt} />
      <Circle cx={rightCX} cy={dotCY} r={dotR} fill={brand.charcoal} />
      <Rect
        x={pillX}
        y={pillY}
        width={pillW}
        height={pillH}
        rx={pillW / 2}
        fill={brand.cobalt}
      />
    </Svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingLeft: 52,   // room for the left strip
    paddingRight: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: brand.text,
    backgroundColor: "#FFFFFF",
  },
  // Left accent strip spanning full page height
  accentStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: brand.strip,
  },
  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: "bold",
    color: brand.cobalt,
    letterSpacing: -0.3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 9,
    fontWeight: "bold",
    color: brand.text,
    textAlign: "right",
  },
  companyAddress: {
    fontSize: 8,
    color: brand.muted,
    textAlign: "right",
    marginTop: 2,
  },
  // ── Signature block ──
  signatures: {
    marginTop: 36,
    flexDirection: "row",
    gap: 32,
  },
  sigCol: { flex: 1 },
  sigLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: brand.text,
  },
  sigName: {
    fontSize: 9,
    color: brand.body,
    marginTop: 3,
  },
  sigTitle: {
    fontSize: 8,
    color: brand.muted,
    marginTop: 1,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: brand.charcoal,
    height: 36,
    marginTop: 10,
    marginBottom: 4,
  },
  sigCaption: {
    fontSize: 8,
    color: brand.muted,
  },
  sigDate: {
    fontSize: 8,
    marginTop: 8,
  },
  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 20,
    left: 52,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingTop: 6,
    fontSize: 7.5,
    color: brand.muted,
  },
});

// ─── Document ─────────────────────────────────────────────────────────────────

type PdfDocProps = {
  title: string;
  documentNumber: string;
  markdown: string;
  party: ContractParty;
  settings: TemplateSettingsConfig;
  language: TemplateLanguage;
  variant: "service" | "employment";
  employeeName?: string;
};

function ContractPdfDocument({
  markdown,
  party,
  settings,
  language,
  variant,
  employeeName,
}: PdfDocProps) {
  const en = language === "en";
  const leftLabel =
    variant === "employment"
      ? en ? "Employee" : "Punonjësi"
      : en ? "Client" : "Klienti";
  const leftName =
    variant === "employment" ? employeeName ?? party.fullName : party.fullName;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left accent strip */}
        <View style={styles.accentStrip} fixed />

        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.logoRow}>
            <LogoMark />
            <Text style={styles.wordmark}>arena</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{settings.companyLegalName}</Text>
            <Text style={styles.companyAddress}>{settings.companyAddress}</Text>
          </View>
        </View>

        {/* Body */}
        <MarkdownPdfBlocks markdown={markdown} />

        {/* Signature block */}
        <View style={styles.signatures} wrap={false}>
          <View style={styles.sigCol}>
            <Text style={styles.sigLabel}>{leftLabel}</Text>
            <Text style={styles.sigName}>{leftName}</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigCaption}>
              {en ? "Signature" : "Nënshkrimi"}
            </Text>
            <Text style={styles.sigDate}>
              {en ? "Date" : "Data"}: _______________
            </Text>
          </View>
          <View style={styles.sigCol}>
            <Text style={styles.sigLabel}>IT Arena</Text>
            <Text style={styles.sigName}>
              {settings.authorizedRepresentative}
            </Text>
            <Text style={styles.sigTitle}>{settings.representativeTitle}</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigCaption}>
              {en ? "Signature" : "Nënshkrimi"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            {settings.companyLegalName} · {settings.companyAddress}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${en ? "Page" : "Faqe"} ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function buildContractPdfBuffer(props: PdfDocProps): Promise<Buffer> {
  const doc = <ContractPdfDocument {...props} />;
  const blob = await pdf(doc).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
