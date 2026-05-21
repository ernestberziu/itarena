import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PasscodeGate } from "@/components/public-share/passcode-gate";
import { PublicTicketView } from "@/components/public-share/public-ticket-view";
import { loadShareByToken } from "@/lib/public-share/assert-share-access";
import { checkShareAvailability } from "@/lib/public-share/share-status";
import {
  getShareSessionFromCookies,
  sessionMatchesShare,
} from "@/lib/public-share/session-cookie";
import { loadPublicShareTicket } from "@/lib/public-share/load-ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicShareTicketPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const t = await getTranslations("publicShare");

  const share = await loadShareByToken(token);
  const availability = checkShareAvailability(share);
  if (!availability.ok) {
    const key = `errors.${availability.reason}` as "errors.expired";
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>{t("unavailableTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t(key)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (share!.resourceType !== "TICKET" || !share!.ticketId) notFound();

  const session = await getShareSessionFromCookies();
  if (!sessionMatchesShare(session, share!)) {
    return <PasscodeGate token={token} clientName={share!.clientName} locale={locale} />;
  }

  const ticket = await loadPublicShareTicket(share!.ticketId);
  if (!ticket) notFound();

  return (
    <PublicTicketView
      token={token}
      clientName={share!.clientName}
      locale={locale}
      ticket={{
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        comments: ticket.comments.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        })),
        history: ticket.history.map((h) => ({
          ...h,
          createdAt: h.createdAt,
        })),
      }}
    />
  );
}
