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
import type { TemplateSettingsConfig } from "@/lib/templates/types";
import { orderStatusLabel } from "@/lib/admin-order-status";
import { parseFulfillmentItems, type OrderLineItem } from "@/lib/order-fulfillment";
import { formatDate } from "@/lib/utils";

const brand = {
  cobalt: "#1400D4",
  charcoal: "#2D2D38",
  text: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  strip: "#1400D4",
  tableHead: "#F1F5F9",
};

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
      <Rect x={pillX} y={pillY} width={pillW} height={pillH} rx={pillW / 2} fill={brand.cobalt} />
    </Svg>
  );
}

function formatPdfPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted = Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formatted} Lekë`;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 52,
    paddingLeft: 52,
    paddingRight: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: brand.text,
    backgroundColor: "#FFFFFF",
  },
  accentStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: brand.strip,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 14,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  wordmark: { fontSize: 20, fontWeight: "bold", color: brand.cobalt, letterSpacing: -0.3 },
  brandSub: { fontSize: 8, color: brand.muted, marginTop: 2 },
  headerRight: { alignItems: "flex-end", maxWidth: 220 },
  companyName: { fontSize: 9, fontWeight: "bold", color: brand.text, textAlign: "right" },
  companyMeta: { fontSize: 8, color: brand.muted, textAlign: "right", marginTop: 2 },
  docTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: brand.cobalt,
    marginBottom: 4,
  },
  docMeta: { fontSize: 9, color: brand.body, marginBottom: 16 },
  twoCol: { flexDirection: "row", gap: 24, marginBottom: 18 },
  col: { flex: 1 },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: brand.muted,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  sectionText: { fontSize: 9, color: brand.text, marginBottom: 2 },
  table: { marginTop: 4, marginBottom: 12 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: brand.tableHead,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: brand.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  th: { fontSize: 8, fontWeight: "bold", color: brand.muted },
  td: { fontSize: 9, color: brand.body },
  colProduct: { flex: 3 },
  colSku: { flex: 1.2 },
  colQty: { flex: 0.6, textAlign: "right" },
  colUnit: { flex: 1.2, textAlign: "right" },
  colLine: { flex: 1.2, textAlign: "right" },
  totals: { marginTop: 8, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", gap: 24, marginBottom: 4 },
  totalLabel: { fontSize: 9, color: brand.muted, width: 100, textAlign: "right" },
  totalValue: { fontSize: 9, color: brand.text, width: 90, textAlign: "right" },
  grandTotal: { fontSize: 12, fontWeight: "bold", color: brand.cobalt },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 52,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingTop: 6,
    fontSize: 7.5,
    color: brand.muted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export type OrderInvoicePdfInput = {
  orderNumber: string;
  status: string;
  createdAt: Date;
  subtotal: string;
  total: string;
  itemsJson: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string | null;
  contactPhone: string;
  user: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
  company: { name: string } | null;
  language: "sq" | "en";
  settings: TemplateSettingsConfig;
};

function lineName(item: OrderLineItem, en: boolean): string {
  if (en && item.nameEn?.trim()) return item.nameEn.trim();
  return item.name;
}

function OrderInvoicePdfDocument(props: OrderInvoicePdfInput) {
  const en = props.language === "en";
  const items = parseFulfillmentItems(props.itemsJson);
  const clientName = `${props.user.firstName} ${props.user.lastName}`.trim();
  const status = orderStatusLabel(props.status, props.language);
  const { settings } = props;

  const labels = {
    invoice: en ? "INVOICE" : "FATURË",
    invoiceNo: en ? "Invoice no." : "Nr. faturës",
    date: en ? "Date" : "Data",
    status: en ? "Status" : "Statusi",
    billTo: en ? "Bill to" : "Klienti",
    delivery: en ? "Delivery" : "Dërgesa",
    product: en ? "Product" : "Produkti",
    sku: en ? "SKU" : "SKU",
    qty: en ? "Qty" : "Sasía",
    unit: en ? "Unit price" : "Çmimi",
    line: en ? "Line total" : "Totali",
    subtotal: en ? "Subtotal" : "Nëntotali",
    total: en ? "Total" : "Totali",
    phone: en ? "Phone" : "Telefoni",
    email: en ? "Email" : "Email",
    company: en ? "Company" : "Kompania",
    notes: en ? "Notes" : "Shënime",
    generated: en ? "Generated by IT Arena" : "Gjeneruar nga IT Arena",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentStrip} fixed />

        <View style={styles.header} fixed>
          <View>
            <View style={styles.logoRow}>
              <LogoMark />
              <Text style={styles.wordmark}>arena</Text>
            </View>
            <Text style={styles.brandSub}>{en ? "Digital solutions" : "Zgjidhje dixhitale"}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{settings.companyLegalName}</Text>
            <Text style={styles.companyMeta}>{settings.companyAddress}</Text>
            {settings.companyNuis ? (
              <Text style={styles.companyMeta}>
                {en ? "VAT" : "NIPT"}: {settings.companyNuis}
              </Text>
            ) : null}
            {settings.companyPhone ? (
              <Text style={styles.companyMeta}>{settings.companyPhone}</Text>
            ) : null}
            {settings.companyEmail ? (
              <Text style={styles.companyMeta}>{settings.companyEmail}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.docTitle}>{labels.invoice}</Text>
        <Text style={styles.docMeta}>
          {labels.invoiceNo}: {props.orderNumber} · {labels.date}:{" "}
          {formatDate(props.createdAt, en ? "en-GB" : "sq-AL")} · {labels.status}: {status}
        </Text>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>{labels.billTo}</Text>
            <Text style={styles.sectionText}>{clientName}</Text>
            {props.company?.name ? (
              <Text style={styles.sectionText}>
                {labels.company}: {props.company.name}
              </Text>
            ) : null}
            {props.user.email ? (
              <Text style={styles.sectionText}>
                {labels.email}: {props.user.email}
              </Text>
            ) : null}
            <Text style={styles.sectionText}>
              {labels.phone}: {props.contactPhone || props.user.phone || "—"}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>{labels.delivery}</Text>
            <Text style={styles.sectionText}>
              {props.deliveryAddress}, {props.deliveryCity}
            </Text>
            {props.deliveryNotes ? (
              <Text style={styles.sectionText}>
                {labels.notes}: {props.deliveryNotes}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colProduct]}>{labels.product}</Text>
            <Text style={[styles.th, styles.colSku]}>{labels.sku}</Text>
            <Text style={[styles.th, styles.colQty]}>{labels.qty}</Text>
            <Text style={[styles.th, styles.colUnit]}>{labels.unit}</Text>
            <Text style={[styles.th, styles.colLine]}>{labels.line}</Text>
          </View>
          {items.map((item, i) => (
            <View key={`${item.sku ?? item.name}-${i}`} style={styles.tableRow}>
              <Text style={[styles.td, styles.colProduct]}>{lineName(item, en)}</Text>
              <Text style={[styles.td, styles.colSku]}>{item.sku ?? "—"}</Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colUnit]}>{formatPdfPrice(item.price)}</Text>
              <Text style={[styles.td, styles.colLine]}>
                {formatPdfPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{labels.subtotal}</Text>
            <Text style={styles.totalValue}>{formatPdfPrice(props.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>{labels.total}</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>{formatPdfPrice(props.total)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {settings.companyLegalName} · {settings.companyAddress}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${en ? "Page" : "Faqe"} ${pageNumber} / ${totalPages} · ${labels.generated}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function buildOrderInvoicePdfBuffer(
  input: OrderInvoicePdfInput
): Promise<{ buffer: Buffer; filename: string }> {
  const doc = <OrderInvoicePdfDocument {...input} />;
  const blob = await pdf(doc).toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  return { buffer, filename: `${input.orderNumber}-invoice.pdf` };
}
