import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout, PasswordBox } from "@/emails/components/email-layout";
import { loginUrl, type EmailLocale } from "@/lib/email/brand";

export type PortalAccountUpdatedEmailProps = {
  locale: EmailLocale;
  firstName: string;
  signInEmail: string;
  temporaryPassword: string;
  emailChanged: boolean;
  previousEmail?: string;
};

export function PortalAccountUpdatedEmail({
  locale,
  firstName,
  signInEmail,
  temporaryPassword,
  emailChanged,
  previousEmail,
}: PortalAccountUpdatedEmailProps) {
  const en = locale === "en";
  const signIn = loginUrl(locale);

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "Your IT Arena account was updated" : "Llogaria juaj në IT Arena u përditësua"}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${firstName},` : `Përshëndetje ${firstName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Account updated" : "Llogaria u përditësua"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {emailChanged
          ? en
            ? "An administrator updated your portal account."
            : "Administratori përditësoi llogarinë tuaj të portalit."
          : en
            ? "An administrator reset your portal account password."
            : "Administratori rivendosi fjalëkalimin e llogarisë suaj të portalit."}
      </Text>
      {emailChanged ? (
        <Text style={{ margin: "0 0 12px" }}>
          {previousEmail
            ? en
              ? `Sign-in email changed from ${previousEmail} to ${signInEmail}.`
              : `Emaili për hyrje u ndryshua nga ${previousEmail} në ${signInEmail}.`
            : en
              ? `Sign-in email updated to ${signInEmail}.`
              : `Emaili për hyrje u përditësua në ${signInEmail}.`}
        </Text>
      ) : null}
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Sign-in email:" : "Email për hyrje:"}</strong> {signInEmail}
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
        {en ? "Temporary password:" : "Fjalëkalimi i përkohshëm:"}
      </Text>
      <PasswordBox password={temporaryPassword} />
      <Text style={{ margin: "16px 0 0", fontSize: "13px", color: "#64748b" }}>
        {en
          ? "Please sign in and change your password as soon as you can."
          : "Ju lutemi hyni dhe ndryshoni fjalëkalimin sa më shpejt të jetë e mundur."}
      </Text>
      <EmailButton href={signIn} label={en ? "Sign in to the portal" : "Hyr në portal"} />
    </EmailLayout>
  );
}

export function portalAccountUpdatedSubject(locale: EmailLocale): string {
  return locale === "en" ? "Your IT Arena account was updated" : "Llogaria juaj në IT Arena u përditësua";
}
