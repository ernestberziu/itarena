import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout, PasswordBox } from "@/emails/components/email-layout";
import { loginUrl, type EmailLocale } from "@/lib/email/brand";

export type PortalInviteEmailProps = {
  locale: EmailLocale;
  firstName: string;
  email: string;
  tempPassword: string;
  ticketNumber?: string;
};

export function PortalInviteEmail({
  locale,
  firstName,
  email,
  tempPassword,
  ticketNumber,
}: PortalInviteEmailProps) {
  const en = locale === "en";
  const signIn = loginUrl(locale);

  return (
    <EmailLayout
      locale={locale}
      previewText={
        en ? "Your IT Arena portal account is ready" : "Llogaria juaj në IT Arena është gati"
      }
    >
      <Text style={{ margin: "0 0 16px" }}>
        {en ? `Hello ${firstName},` : `Përshëndetje ${firstName},`}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {en ? "Your portal account" : "Llogaria juaj në portal"}
      </Heading>
      <Text style={{ margin: "0 0 12px" }}>
        {en
          ? "An IT Arena portal account was created for you."
          : "Ju është krijuar një llogari në portalin IT Arena."}
      </Text>
      {ticketNumber ? (
        <Text style={{ margin: "0 0 12px" }}>
          {en ? (
            <>
              A ticket was opened for you: <strong>{ticketNumber}</strong>.
            </>
          ) : (
            <>
              Është hapur një bilete për ju: <strong>{ticketNumber}</strong>.
            </>
          )}
        </Text>
      ) : null}
      <Text style={{ margin: "0 0 8px" }}>
        <strong>{en ? "Email:" : "Email:"}</strong> {email}
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
        {en ? "Temporary password (change after sign-in):" : "Fjalëkalimi i përkohshëm (ndryshojeni pas hyrjes):"}
      </Text>
      <PasswordBox password={tempPassword} />
      <Text style={{ margin: "16px 0 0", fontSize: "13px", color: "#64748b" }}>
        {en
          ? "Please sign in and change your password as soon as you can."
          : "Ju lutemi hyni dhe ndryshoni fjalëkalimin sa më shpejt të jetë e mundur."}
      </Text>
      <EmailButton href={signIn} label={en ? "Sign in to the portal" : "Hyr në portal"} />
    </EmailLayout>
  );
}

export function portalInviteSubject(locale: EmailLocale): string {
  return locale === "en" ? "Your IT Arena portal account" : "Llogaria juaj në IT Arena";
}
