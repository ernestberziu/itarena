import { Heading, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "@/emails/components/email-layout";
import type { EmailLocale } from "@/lib/email/brand";
import { notificationCategoryLabel } from "@/lib/email/notification-categories";
import type { NotificationEventType } from "@/lib/notifications/types";

export type NotificationEmailProps = {
  locale: EmailLocale;
  type: NotificationEventType;
  title: string;
  body: string;
  absoluteLink: string | null;
  recipientName?: string | null;
};

export function NotificationEmail({
  locale,
  type,
  title,
  body,
  absoluteLink,
  recipientName,
}: NotificationEmailProps) {
  const en = locale === "en";
  const category = notificationCategoryLabel(type, locale);
  const ctaLabel = en ? "Open in portal" : "Hap në portal";

  return (
    <EmailLayout locale={locale} previewText={title}>
      {recipientName ? (
        <Text style={{ margin: "0 0 16px" }}>
          {en ? `Hello ${recipientName},` : `Përshëndetje ${recipientName},`}
        </Text>
      ) : null}
      <Text
        style={{
          margin: "0 0 8px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#64748b",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {category}
      </Text>
      <Heading as="h1" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
        {title}
      </Heading>
      {body ? <Text style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" as const }}>{body}</Text> : null}
      {absoluteLink ? <EmailButton href={absoluteLink} label={ctaLabel} /> : null}
    </EmailLayout>
  );
}
