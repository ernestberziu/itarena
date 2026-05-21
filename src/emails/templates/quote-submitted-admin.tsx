import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "@/emails/components/email-layout";
import { type EmailLocale } from "@/lib/email/brand";

export type QuoteSubmittedAdminEmailProps = {
  locale: EmailLocale;
  quoteNumber: string;
  title: string;
  companyName?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  vatNumber?: string | null;
  services: string[];
  description: string;
  timeline?: string | null;
  adminQuoteUrl: string;
};

export function QuoteSubmittedAdminEmail({
  locale,
  quoteNumber,
  title,
  companyName,
  contactName,
  contactEmail,
  contactPhone,
  vatNumber,
  services,
  description,
  timeline,
  adminQuoteUrl,
}: QuoteSubmittedAdminEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={
        en ? `New quote request ${quoteNumber}` : `Kërkesë e re oferte ${quoteNumber}`
      }
    >
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "New quote request" : "Kërkesë e re oferte"}
      </Heading>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Quote #:" : "Oferta #:"}</strong> {quoteNumber}
      </Text>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Title:" : "Titulli:"}</strong> {title}
      </Text>
      {companyName ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "Company:" : "Kompania:"}</strong> {companyName}
        </Text>
      ) : null}
      {vatNumber ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "VAT / NIPT:" : "NIPT:"}</strong> {vatNumber}
        </Text>
      ) : null}
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Contact:" : "Kontakti:"}</strong> {contactName}
      </Text>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>Email:</strong> {contactEmail}
      </Text>
      {contactPhone ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "Phone:" : "Telefoni:"}</strong> {contactPhone}
        </Text>
      ) : null}
      {services.length > 0 ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "Services:" : "Shërbimet:"}</strong> {services.join(", ")}
        </Text>
      ) : null}
      {timeline ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "Timeline:" : "Afati:"}</strong> {timeline}
        </Text>
      ) : null}
      <Text style={{ margin: "16px 0 0", whiteSpace: "pre-wrap" as const }}>{description}</Text>
      <EmailButton
        href={adminQuoteUrl}
        label={en ? "Open in admin" : "Hap në administrim"}
      />
    </EmailLayout>
  );
}

export function quoteSubmittedAdminSubject(locale: EmailLocale, quoteNumber: string): string {
  return locale === "en"
    ? `New quote request ${quoteNumber} — IT Arena`
    : `Kërkesë e re oferte ${quoteNumber} — IT Arena`;
}
