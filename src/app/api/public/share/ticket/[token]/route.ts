import { NextRequest, NextResponse } from "next/server";
import { assertPublicShareAccess } from "@/lib/public-share/assert-share-access";
import { loadPublicShareTicket } from "@/lib/public-share/load-ticket";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const access = await assertPublicShareAccess(token);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: 404 });

  const { share } = access;
  if (share.resourceType !== "TICKET" || !share.ticketId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ticket = await loadPublicShareTicket(share.ticketId);
  if (!ticket) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    clientName: share.clientName,
    ticket,
  });
}
