import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminTicketsListWhere } from "@/lib/admin-tickets-list-query";
import { mapTicketToAdminRow } from "@/lib/admin-tickets-list-dto";

const STAFF_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"] as const;

const ticketInclude = {
  createdBy: { select: { firstName: true, lastName: true, email: true } },
  assignedTo: { select: { firstName: true, lastName: true } },
  company: { select: { name: true } },
} as const;

const listOrderBy = [
  { slaBreached: "desc" as const },
  { priority: "desc" as const },
  { updatedAt: "desc" as const },
];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!STAFF_ROLES.includes(session.user.role as (typeof STAFF_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawSize = Number.parseInt(searchParams.get("pageSize") ?? "25", 10) || 25;
  const pageSize = Math.min(50, Math.max(1, rawSize));

  const where = adminTicketsListWhere({
    q: searchParams.get("q"),
    status: searchParams.get("status"),
    priority: searchParams.get("priority"),
    filter: searchParams.get("filter"),
    assignee: searchParams.get("assignee"),
  });

  const [rows, total] = await Promise.all([
    db.ticket.findMany({
      where,
      orderBy: listOrderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: ticketInclude,
    }),
    db.ticket.count({ where }),
  ]);

  const items = rows.map(mapTicketToAdminRow);
  const hasMore = page * pageSize < total;

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    hasMore,
  });
}
