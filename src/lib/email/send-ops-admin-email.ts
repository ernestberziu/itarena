import "server-only";
import { absoluteUrl } from "@/lib/email/brand";
import { getOpsNotifyEmail } from "@/lib/email/ops-notify-email";
import { sendRenderedEmail, type SendResult } from "@/lib/email/send-helpers";
import {
  QuoteSubmittedAdminEmail,
  quoteSubmittedAdminSubject,
} from "@/emails/templates/quote-submitted-admin";

export async function sendQuoteSubmittedOpsEmail(params: {
  quoteId: string;
  quoteNumber: string;
  title: string;
  companyName?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  vatNumber?: string | null;
  services: string[];
  description: string;
  timeline?: string | null;
  locale?: "sq" | "en";
}): Promise<SendResult> {
  const to = getOpsNotifyEmail();
  if (!to) return { sent: false };

  const locale = params.locale === "en" ? "en" : "sq";
  const adminQuoteUrl = absoluteUrl(`/sq/admin/quotes/${params.quoteId}`);

  return sendRenderedEmail({
    to,
    subject: quoteSubmittedAdminSubject(locale, params.quoteNumber),
    element: QuoteSubmittedAdminEmail({
      locale,
      quoteNumber: params.quoteNumber,
      title: params.title,
      companyName: params.companyName,
      contactName: params.contactName,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      vatNumber: params.vatNumber,
      services: params.services,
      description: params.description,
      timeline: params.timeline,
      adminQuoteUrl,
    }),
  });
}
