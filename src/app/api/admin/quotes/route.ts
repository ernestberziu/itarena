import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";
import { adminQuotesListWhere, mapQuoteToAdminRow } from "@/lib/admin-quotes-list-dto";

const quoteInclude = {
  requestedBy: { select: { firstName: true, lastName: true } },
  company: { select: { name: true } },
} as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);

  const denied = await assertAdminApiAcl(session.user.id, "quotes", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);
  const where = adminQuotesListWhere({
    q: searchParams.get("q"),
    status: searchParams.get("status"),
  });

  const [quotes, total] = await Promise.all([
    db.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: quoteInclude,
      skip,
      take: pageSize,
    }),
    db.quote.count({ where }),
  ]);

  const items = quotes.map(mapQuoteToAdminRow);
  return NextResponse.json(paginatedResponse(items, total, page, pageSize));
}
