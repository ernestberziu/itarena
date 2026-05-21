import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { BRAND_NAME, emailColors, type EmailLocale } from "@/lib/email/brand";
import { getPublicAppBaseUrl } from "@/lib/shop-url";

type EmailLayoutProps = {
  locale: EmailLocale;
  previewText?: string;
  children: ReactNode;
};

function BrandMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 30 30" style={{ display: "block" }}>
      <circle cx="15" cy="4" r="3.9" fill={emailColors.brand} />
      <rect x="11.4" y="10" width="7.2" height="15.6" rx="3.6" fill={emailColors.brand} />
    </svg>
  );
}

export function EmailLayout({ locale, previewText, children }: EmailLayoutProps) {
  const en = locale === "en";
  const footer =
    en
      ? "Automated message from IT Arena."
      : "Mesazh automatik nga IT Arena.";
  const baseUrl = getPublicAppBaseUrl();

  return (
    <Html lang={locale}>
      <Head />
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Body style={{ margin: 0, padding: 0, backgroundColor: emailColors.canvas, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "24px 12px", maxWidth: "600px" }}>
          <Section
            style={{
              backgroundColor: emailColors.card,
              borderRadius: "12px",
              border: `1px solid ${emailColors.cardBorder}`,
              overflow: "hidden",
            }}
          >
            <Section style={{ height: "4px", backgroundColor: emailColors.brand, lineHeight: "4px" }} />
            <Section style={{ padding: "24px 28px 8px" }}>
              <table cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle", paddingRight: "10px" }}>
                      <BrandMark />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Heading
                        as="h2"
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: 700,
                          color: emailColors.brand,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {BRAND_NAME}
                      </Heading>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
            <Section style={{ padding: "8px 28px 28px", color: emailColors.text, fontSize: "15px", lineHeight: "1.55" }}>
              {children}
            </Section>
            <Hr style={{ borderColor: emailColors.cardBorder, margin: 0 }} />
            <Section style={{ padding: "16px 28px 24px", backgroundColor: emailColors.insetBg }}>
              <Text style={{ margin: 0, fontSize: "11px", color: emailColors.muted, lineHeight: "1.55" }}>
                {footer}{" "}
                <Link href={baseUrl} style={{ color: emailColors.link }}>
                  {baseUrl.replace(/^https?:\/\//, "")}
                </Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Section style={{ margin: "24px 0 0" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          padding: "12px 22px",
          backgroundColor: emailColors.ctaBg,
          color: emailColors.ctaFg,
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        {label}
      </Link>
      <Text style={{ margin: "8px 0 0", fontSize: "12px", color: emailColors.muted, wordBreak: "break-all" }}>
        {href}
      </Text>
    </Section>
  );
}

export function PasswordBox({ password }: { password: string }) {
  return (
    <Section
      style={{
        margin: "16px 0 0",
        padding: "12px 16px",
        backgroundColor: emailColors.ctaBg,
        borderRadius: "8px",
      }}
    >
      <Text
        style={{
          margin: 0,
          fontFamily: "ui-monospace,Menlo,monospace",
          fontSize: "15px",
          color: emailColors.passwordAccent,
          letterSpacing: "0.03em",
          wordBreak: "break-all",
        }}
      >
        {password}
      </Text>
    </Section>
  );
}
