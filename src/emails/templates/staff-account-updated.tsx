import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout, PasswordBox } from "@/emails/components/email-layout";
import { loginUrl, type EmailLocale } from "@/lib/email/brand";

export type StaffAccountUpdatedEmailProps = {
  locale: EmailLocale;
  firstName: string;
  signInEmail: string;
  temporaryPassword: string;
  emailChanged: boolean;
  previousEmail?: string;
};

export function StaffAccountUpdatedEmail({
  locale,
  firstName,
  signInEmail,
  temporaryPassword,
  emailChanged,
  previousEmail,
}: StaffAccountUpdatedEmailProps) {
  const en = locale === "en";
  const signIn = loginUrl(locale);

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "Your staff account was updated" : "Llogaria juaj e stafit u përditësua"}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${firstName},` : `Përshëndetje ${firstName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Staff account updated" : "Llogaria e stafit u përditësua"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {emailChanged
          ? en
            ? "An administrator updated your staff account."
            : "Administratori përditësoi llogarinë tuaj të stafit."
          : en
            ? "An administrator reset your staff account password."
            : "Administratori rivendosi fjalëkalimin e llogarisë suaj të stafit."}
      </Text>
      {emailChanged && previousEmail ? (
        <Text style={{ margin: "0 0 12px" }}>
          {en
            ? `Sign-in email changed from ${previousEmail} to ${signInEmail}.`
            : `Emaili për hyrje u ndryshua nga ${previousEmail} në ${signInEmail}.`}
        </Text>
      ) : null}
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Sign-in email:" : "Email për hyrje:"}</strong> {signInEmail}
      </Text>
      <PasswordBox password={temporaryPassword} />
      <EmailButton href={signIn} label={en ? "Sign in" : "Hyr"} />
    </EmailLayout>
  );
}

export function staffAccountUpdatedSubject(locale: EmailLocale): string {
  return locale === "en" ? "Your IT Arena staff account was updated" : "Llogaria juaj e stafit u përditësua";
}
