import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "@/emails/components/email-layout";
import type { EmailLocale } from "@/lib/email/brand";

export type QuoteClientSummaryEmailProps = {
  locale: EmailLocale;
  contactName: string;
  quoteNumber: string;
  status: string;
  summary: string;
  portalQuoteUrl?: string;
};

export function QuoteClientSummaryEmail({
  locale,
  contactName,
  quoteNumber,
  status,
  summary,
  portalQuoteUrl,
}: QuoteClientSummaryEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? `Quote ${quoteNumber}` : `Oferta ${quoteNumber}`}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${contactName},` : `Përshëndetje ${contactName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? `Quote ${quoteNumber}` : `Oferta ${quoteNumber}`}
      </Heading>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Status:" : "Statusi:"}</strong> {status}
      </Text>
      {summary ? (
        <Text style={{ margin: "12px 0 0", whiteSpace: "pre-wrap" as const }}>{summary}</Text>
      ) : null}
      {portalQuoteUrl ? (
        <EmailButton href={portalQuoteUrl} label={en ? "View quote" : "Shiko ofertën"} />
      ) : null}
    </EmailLayout>
  );
}

export function quoteClientSummarySubject(locale: EmailLocale, quoteNumber: string): string {
  return locale === "en" ? `Your quote ${quoteNumber}` : `Oferta juaj ${quoteNumber}`;
}
