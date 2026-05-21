import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "@/emails/components/email-layout";
import type { EmailLocale } from "@/lib/email/brand";

export type VerifyEmailProps = {
  locale: EmailLocale;
  firstName: string;
  verifyUrl: string;
};

export function VerifyEmail({ locale, firstName, verifyUrl }: VerifyEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "Confirm your email address" : "Konfirmoni adresën e emailit"}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${firstName},` : `Përshëndetje ${firstName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Confirm your email" : "Konfirmoni emailin"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {en
          ? "Thank you for registering with IT Arena. Click the button below to verify your email address."
          : "Faleminderit që u regjistruat në IT Arena. Klikoni butonin më poshtë për të verifikuar adresën e emailit."}
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
        {en
          ? "If you did not create an account, you can ignore this message."
          : "Nëse nuk keni krijuar llogari, mund ta injoroni këtë mesazh."}
      </Text>
      <EmailButton
        href={verifyUrl}
        label={en ? "Verify email address" : "Verifiko adresën e emailit"}
      />
    </EmailLayout>
  );
}

export function verifyEmailSubject(locale: EmailLocale): string {
  return locale === "en" ? "Confirm your IT Arena email" : "Konfirmoni emailin tuaj në IT Arena";
}
