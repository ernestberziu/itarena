import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "@/emails/components/email-layout";
import type { EmailLocale } from "@/lib/email/brand";

export type ContactAdminNotifyEmailProps = {
  locale: EmailLocale;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  company?: string | null;
  message: string;
};

export function ContactAdminNotifyEmail({
  locale,
  name,
  email,
  phone,
  service,
  company,
  message,
}: ContactAdminNotifyEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "New contact form message" : "Mesazh i ri nga forma e kontaktit"}
    >
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Contact form" : "Forma e kontaktit"}
      </Heading>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Name:" : "Emri:"}</strong> {name}
      </Text>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>Email:</strong> {email}
      </Text>
      {phone ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "Phone:" : "Telefoni:"}</strong> {phone}
        </Text>
      ) : null}
      {company ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "Company:" : "Kompania:"}</strong> {company}
        </Text>
      ) : null}
      {service ? (
        <Text style={{ margin: "0 0 8px" }}>
          <strong>{en ? "Service:" : "Shërbimi:"}</strong> {service}
        </Text>
      ) : null}
      <Text style={{ margin: "16px 0 0", whiteSpace: "pre-wrap" as const }}>{message}</Text>
    </EmailLayout>
  );
}

export function contactAdminNotifySubject(locale: EmailLocale): string {
  return locale === "en" ? "New contact message — IT Arena" : "Mesazh i ri kontakti — IT Arena";
}

export type ContactClientConfirmEmailProps = {
  locale: EmailLocale;
  firstName: string;
};

export function ContactClientConfirmEmail({ locale, firstName }: ContactClientConfirmEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "We received your message" : "E morëm mesazhin tuaj"}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${firstName},` : `Përshëndetje ${firstName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Message received" : "Mesazhi u mor"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {en
          ? "Thank you for contacting IT Arena. We have received your message and will get back to you as soon as possible."
          : "Faleminderit që kontaktuat IT Arena. E morëm mesazhin tuaj dhe do t'ju përgjigjemi sa më shpejt të jetë e mundur."}
      </Text>
    </EmailLayout>
  );
}

export function contactClientConfirmSubject(locale: EmailLocale): string {
  return locale === "en" ? "We received your message — IT Arena" : "E morëm mesazhin tuaj — IT Arena";
}
