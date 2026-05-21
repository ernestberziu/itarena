import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout, PasswordBox } from "@/emails/components/email-layout";
import type { EmailLocale } from "@/lib/email/brand";

export type PublicShareAccessEmailProps = {
  locale: EmailLocale;
  clientName: string;
  resourceLabel: string;
  shareUrl: string;
  passcode: string;
};

export function PublicShareAccessEmail({
  locale,
  clientName,
  resourceLabel,
  shareUrl,
  passcode,
}: PublicShareAccessEmailProps) {
  const en = locale === "en";

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "Your secure IT Arena link" : "Lidhja juaj e sigurt në IT Arena"}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${clientName},` : `Përshëndetje ${clientName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Secure access link" : "Lidhje me akses të sigurt"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {en
          ? `IT Arena shared access to: ${resourceLabel}. Open the link and enter the passcode below.`
          : `IT Arena ndau aksesin për: ${resourceLabel}. Hapni lidhjen dhe vendosni kodin më poshtë.`}
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
        {en ? "Passcode:" : "Kodi i aksesit:"}
      </Text>
      <PasswordBox password={passcode} />
      <EmailButton href={shareUrl} label={en ? "Open link" : "Hap lidhjen"} />
      <Text style={{ margin: "16px 0 0", fontSize: "13px", color: "#64748b" }}>
        {en
          ? "Do not share this passcode with anyone else."
          : "Mos e ndani këtë kod me persona të tjerë."}
      </Text>
    </EmailLayout>
  );
}

export function publicShareAccessSubject(locale: EmailLocale, resourceLabel: string): string {
  return locale === "en"
    ? `IT Arena access: ${resourceLabel}`
    : `Akses IT Arena: ${resourceLabel}`;
}
