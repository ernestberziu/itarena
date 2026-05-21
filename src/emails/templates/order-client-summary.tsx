import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "@/emails/components/email-layout";
import { type EmailLocale } from "@/lib/email/brand";

export type OrderClientSummaryEmailProps = {
  locale: EmailLocale;
  clientName: string;
  orderNumber: string;
  status: string;
  totalFormatted: string;
  itemSummary: string;
  portalOrderUrl?: string;
};

export function OrderClientSummaryEmail({
  locale,
  clientName,
  orderNumber,
  status,
  totalFormatted,
  itemSummary,
  portalOrderUrl,
}: OrderClientSummaryEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? `Order ${orderNumber}` : `Porosia ${orderNumber}`}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${clientName},` : `Përshëndetje ${clientName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? `Order ${orderNumber}` : `Porosia ${orderNumber}`}
      </Heading>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Status:" : "Statusi:"}</strong> {status}
      </Text>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Total:" : "Totali:"}</strong> {totalFormatted}
      </Text>
      {itemSummary ? (
        <Text style={{ margin: "12px 0 0", whiteSpace: "pre-wrap" as const }}>{itemSummary}</Text>
      ) : null}
      <Text style={{ margin: "16px 0 0", fontSize: "13px", color: "#64748b" }}>
        {en
          ? "This message was sent from IT Arena on your behalf."
          : "Ky mesazh u dërgua nga IT Arena në emrin tuaj."}
      </Text>
      {portalOrderUrl ? (
        <EmailButton href={portalOrderUrl} label={en ? "View in portal" : "Shiko në portal"} />
      ) : null}
    </EmailLayout>
  );
}

export function orderClientSummarySubject(locale: EmailLocale, orderNumber: string): string {
  return locale === "en" ? `Your order ${orderNumber}` : `Porosia juaj ${orderNumber}`;
}
