import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "@/emails/components/email-layout";
import type { EmailLocale } from "@/lib/email/brand";

export type ResetPasswordEmailProps = {
  locale: EmailLocale;
  firstName: string;
  resetUrl: string;
};

export function ResetPasswordEmail({ locale, firstName, resetUrl }: ResetPasswordEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "Reset your password" : "Rivendosni fjalëkalimin"}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${firstName},` : `Përshëndetje ${firstName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Reset your password" : "Rivendosni fjalëkalimin"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {en
          ? "We received a request to reset your IT Arena account password. This link expires in 24 hours."
          : "Kemi marrë një kërkesë për të rivendosur fjalëkalimin e llogarisë suaj IT Arena. Lidhja skadon pas 24 orësh."}
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
        {en
          ? "If you did not request this, you can safely ignore this email."
          : "Nëse nuk e keni kërkuar këtë, mund ta injoroni këtë email."}
      </Text>
      <EmailButton href={resetUrl} label={en ? "Reset password" : "Rivendos fjalëkalimin"} />
    </EmailLayout>
  );
}

export function resetPasswordSubject(locale: EmailLocale): string {
  return locale === "en" ? "Reset your IT Arena password" : "Rivendosni fjalëkalimin e IT Arena";
}
