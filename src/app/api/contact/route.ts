import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  sendContactAdminNotifyEmail,
  sendContactClientConfirmEmail,
} from "@/lib/email/transactional";
import { getOpsNotifyEmail } from "@/lib/email/ops-notify-email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return apiErr(req, "invalidData", 400);
  }

  await db.auditLog.create({
    data: {
      action: "CONTACT_FORM",
      resource: "Contact",
      metadata: JSON.stringify(parsed.data),
    },
  });

  const { emitNotificationSafe } = await import("@/lib/notifications");
  const { excerpt } = await import("@/lib/notifications/helpers");
  emitNotificationSafe({
    type: "CONTACT_FORM_SUBMITTED",
    payload: {
      excerpt: excerpt(parsed.data.message),
      subject: parsed.data.service || parsed.data.company || parsed.data.name,
    },
    skipEmail: true,
  });

  const firstName = parsed.data.name.trim().split(/\s+/)[0] ?? parsed.data.name.trim();
  const notifyEmail = getOpsNotifyEmail();

  await Promise.all([
    notifyEmail
      ? sendContactAdminNotifyEmail({
          to: notifyEmail,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          service: parsed.data.service,
          company: parsed.data.company,
          message: parsed.data.message,
        })
      : Promise.resolve({ sent: false as const }),
    sendContactClientConfirmEmail({
      to: parsed.data.email,
      firstName,
    }),
  ]);

  return NextResponse.json({ success: true });
}
