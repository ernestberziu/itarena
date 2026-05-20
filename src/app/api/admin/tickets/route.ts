import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { adminTicketsListWhere } from "@/lib/admin-tickets-list-query";
import { mergeStaffTicketScope } from "@/lib/admin-tickets-scope";
import { mapTicketToAdminRow } from "@/lib/admin-tickets-list-dto";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";

const STAFF_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"] as const;

const ticketInclude = {
  createdBy: { select: { firstName: true, lastName: true, email: true } },
  assignedTo: { select: { firstName: true, lastName: true } },
  company: { select: { name: true } },
  project: { select: { id: true, title: true } },
} as const;

const listOrderBy = [
  { slaDeadline: "asc" as const },
  { priority: "desc" as const },
  { updatedAt: "desc" as const },
];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!STAFF_ROLES.includes(session.user.role as (typeof STAFF_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "tickets", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);

  const baseWhere = adminTicketsListWhere({
    q: searchParams.get("q"),
    status: searchParams.get("status"),
    priority: searchParams.get("priority"),
    filter: searchParams.get("filter"),
    assignee: searchParams.get("assignee"),
    requester: searchParams.get("requester"),
    projectId: searchParams.get("projectId"),
  });
  const where = await mergeStaffTicketScope(baseWhere, session.user.id);

  const [rows, total] = await Promise.all([
    db.ticket.findMany({
      where,
      orderBy: listOrderBy,
      skip,
      take: pageSize,
      include: ticketInclude,
    }),
    db.ticket.count({ where }),
  ]);

  const items = rows.map(mapTicketToAdminRow);
  return NextResponse.json(paginatedResponse(items, total, page, pageSize));
}
