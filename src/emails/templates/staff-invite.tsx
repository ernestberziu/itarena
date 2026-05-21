import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout, PasswordBox } from "@/emails/components/email-layout";
import { loginUrl, type EmailLocale } from "@/lib/email/brand";

export type StaffInviteEmailProps = {
  locale: EmailLocale;
  firstName: string;
  email: string;
  tempPassword: string;
};

export function StaffInviteEmail({ locale, firstName, email, tempPassword }: StaffInviteEmailProps) {
  const en = locale === "en";
  const signIn = loginUrl(locale);

  return (
    <EmailLayout
      locale={locale}
      previewText={en ? "Your IT Arena staff account" : "Llogaria juaj e stafit në IT Arena"}
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${firstName},` : `Përshëndetje ${firstName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Staff account created" : "Llogaria e stafit u krijua"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {en
          ? "You have been added to the IT Arena admin portal."
          : "Jeni shtuar në portalin e administrimit të IT Arena."}
      </Text>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Email:" : "Email:"}</strong> {email}
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
        {en ? "Temporary password:" : "Fjalëkalimi i përkohshëm:"}
      </Text>
      <PasswordBox password={tempPassword} />
      <Text style={{ margin: "16px 0 0", fontSize: "13px", color: "#64748b" }}>
        {en
          ? "Sign in and change your password from your profile settings."
          : "Hyni dhe ndryshoni fjalëkalimin nga cilësimet e profilit."}
      </Text>
      <EmailButton href={signIn} label={en ? "Sign in" : "Hyr"} />
    </EmailLayout>
  );
}

export function staffInviteSubject(locale: EmailLocale): string {
  return locale === "en" ? "Your IT Arena staff account" : "Llogaria juaj e stafit në IT Arena";
}
