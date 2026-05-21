import "server-only";
import { absoluteUrl, loginUrl, pickLocale, type EmailLocale } from "@/lib/email/brand";
import { sendRenderedEmail, type SendResult } from "@/lib/email/send-helpers";
import {
  ContactAdminNotifyEmail,
  ContactClientConfirmEmail,
  contactAdminNotifySubject,
  contactClientConfirmSubject,
} from "@/emails/templates/contact-form";
import {
  OrderClientSummaryEmail,
  orderClientSummarySubject,
} from "@/emails/templates/order-client-summary";
import {
  PortalAccountUpdatedEmail,
  portalAccountUpdatedSubject,
} from "@/emails/templates/portal-account-updated";
import {
  PortalInviteEmail,
  portalInviteSubject,
} from "@/emails/templates/portal-invite";
import {
  PublicShareAccessEmail,
  publicShareAccessSubject,
} from "@/emails/templates/public-share-access";
import {
  QuoteClientSummaryEmail,
  quoteClientSummarySubject,
} from "@/emails/templates/quote-client-summary";
import { ResetPasswordEmail, resetPasswordSubject } from "@/emails/templates/reset-password";
import {
  StaffAccountUpdatedEmail,
  staffAccountUpdatedSubject,
} from "@/emails/templates/staff-account-updated";
import { StaffInviteEmail, staffInviteSubject } from "@/emails/templates/staff-invite";
import { VerifyEmail, verifyEmailSubject } from "@/emails/templates/verify-email";

export async function sendPortalAccountInviteEmail(params: {
  to: string;
  firstName: string;
  tempPassword: string;
  locale: EmailLocale;
  ticketNumber?: string;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  return sendRenderedEmail({
    to: params.to,
    subject: portalInviteSubject(locale),
    element: PortalInviteEmail({
      locale,
      firstName: params.firstName,
      email: params.to,
      tempPassword: params.tempPassword,
      ticketNumber: params.ticketNumber,
    }),
  });
}

export async function sendAdminClientAccountUpdateEmail(params: {
  to: string;
  firstName: string;
  mailLocale: EmailLocale;
  temporaryPassword: string;
  signInEmail: string;
  emailChanged: boolean;
  previousEmail?: string;
}): Promise<SendResult> {
  const locale = pickLocale(params.mailLocale);
  return sendRenderedEmail({
    to: params.to,
    subject: portalAccountUpdatedSubject(locale),
    element: PortalAccountUpdatedEmail({
      locale,
      firstName: params.firstName,
      signInEmail: params.signInEmail,
      temporaryPassword: params.temporaryPassword,
      emailChanged: params.emailChanged,
      previousEmail: params.previousEmail,
    }),
  });
}

export async function sendStaffInviteEmail(params: {
  to: string;
  firstName: string;
  tempPassword: string;
  locale: EmailLocale;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  return sendRenderedEmail({
    to: params.to,
    subject: staffInviteSubject(locale),
    element: StaffInviteEmail({
      locale,
      firstName: params.firstName,
      email: params.to,
      tempPassword: params.tempPassword,
    }),
  });
}

export async function sendStaffAccountUpdateEmail(params: {
  to: string;
  firstName: string;
  mailLocale: EmailLocale;
  temporaryPassword: string;
  signInEmail: string;
  emailChanged: boolean;
  previousEmail?: string;
}): Promise<SendResult> {
  const locale = pickLocale(params.mailLocale);
  return sendRenderedEmail({
    to: params.to,
    subject: staffAccountUpdatedSubject(locale),
    element: StaffAccountUpdatedEmail({
      locale,
      firstName: params.firstName,
      signInEmail: params.signInEmail,
      temporaryPassword: params.temporaryPassword,
      emailChanged: params.emailChanged,
      previousEmail: params.previousEmail,
    }),
  });
}

export async function sendVerifyEmail(params: {
  to: string;
  firstName: string;
  locale: EmailLocale;
  verifyToken: string;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  const verifyUrl = absoluteUrl(`/${locale}/verify-email?token=${encodeURIComponent(params.verifyToken)}`);
  return sendRenderedEmail({
    to: params.to,
    subject: verifyEmailSubject(locale),
    element: VerifyEmail({ locale, firstName: params.firstName, verifyUrl }),
  });
}

export async function sendResetPasswordEmail(params: {
  to: string;
  firstName: string;
  locale: EmailLocale;
  resetToken: string;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  const resetUrl = absoluteUrl(`/${locale}/reset-password?token=${encodeURIComponent(params.resetToken)}`);
  return sendRenderedEmail({
    to: params.to,
    subject: resetPasswordSubject(locale),
    element: ResetPasswordEmail({ locale, firstName: params.firstName, resetUrl }),
  });
}

export async function sendPublicShareAccessEmail(params: {
  to: string;
  clientName: string;
  resourceLabel: string;
  shareUrl: string;
  passcode: string;
  locale?: EmailLocale;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  return sendRenderedEmail({
    to: params.to,
    subject: publicShareAccessSubject(locale, params.resourceLabel),
    element: PublicShareAccessEmail({
      locale,
      clientName: params.clientName,
      resourceLabel: params.resourceLabel,
      shareUrl: params.shareUrl,
      passcode: params.passcode,
    }),
  });
}

export async function sendOrderClientSummaryEmail(params: {
  to: string;
  clientName: string;
  orderNumber: string;
  status: string;
  totalFormatted: string;
  itemSummary: string;
  locale?: EmailLocale;
  portalOrderUrl?: string;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  return sendRenderedEmail({
    to: params.to,
    subject: orderClientSummarySubject(locale, params.orderNumber),
    element: OrderClientSummaryEmail({
      locale,
      clientName: params.clientName,
      orderNumber: params.orderNumber,
      status: params.status,
      totalFormatted: params.totalFormatted,
      itemSummary: params.itemSummary,
      portalOrderUrl: params.portalOrderUrl,
    }),
  });
}

export async function sendQuoteClientSummaryEmail(params: {
  to: string;
  contactName: string;
  quoteNumber: string;
  status: string;
  summary: string;
  locale?: EmailLocale;
  portalQuoteUrl?: string;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  return sendRenderedEmail({
    to: params.to,
    subject: quoteClientSummarySubject(locale, params.quoteNumber),
    element: QuoteClientSummaryEmail({
      locale,
      contactName: params.contactName,
      quoteNumber: params.quoteNumber,
      status: params.status,
      summary: params.summary,
      portalQuoteUrl: params.portalQuoteUrl,
    }),
  });
}

export async function sendContactAdminNotifyEmail(params: {
  to: string;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  company?: string | null;
  message: string;
  locale?: EmailLocale;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  return sendRenderedEmail({
    to: params.to,
    subject: contactAdminNotifySubject(locale),
    element: ContactAdminNotifyEmail({
      locale,
      name: params.name,
      email: params.email,
      phone: params.phone,
      service: params.service,
      company: params.company,
      message: params.message,
    }),
  });
}

export async function sendContactClientConfirmEmail(params: {
  to: string;
  firstName: string;
  locale?: EmailLocale;
}): Promise<SendResult> {
  const locale = pickLocale(params.locale);
  return sendRenderedEmail({
    to: params.to,
    subject: contactClientConfirmSubject(locale),
    element: ContactClientConfirmEmail({ locale, firstName: params.firstName }),
  });
}

export { loginUrl };
