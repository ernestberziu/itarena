import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { absoluteUrl } from "@/lib/email/brand";
import { sendQuoteClientSummaryEmail } from "@/lib/email/transactional";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "quotes", "read");
  if (denied) return denied;

  const { id } = await params;
  const quote = await db.quote.findUnique({ where: { id } });

  if (!quote?.contactEmail) {
    return NextResponse.json({ error: "Quote has no contact email" }, { status: 400 });
  }

  const locale = session.user.language === "en" ? "en" : "sq";
  const summary = [
    quote.title,
    quote.description?.slice(0, 500),
    quote.total != null ? `Total: ${Number(quote.total).toFixed(2)} ALL` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const mail = await sendQuoteClientSummaryEmail({
    to: quote.contactEmail,
    contactName: quote.contactName,
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    summary,
    locale,
    portalQuoteUrl: absoluteUrl(`/${locale}/portal/quotes`),
  });

  return NextResponse.json({ ok: true, emailSent: mail.sent });
}
