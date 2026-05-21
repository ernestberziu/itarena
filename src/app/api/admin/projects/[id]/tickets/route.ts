import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { assertProjectAccess, revalidateProjectPaths } from "@/lib/projects";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "read");
  if (accessDenied) return accessDenied;

  const tickets = await db.ticket.findMany({
    where: { projectId },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      priority: true,
      slaDeadline: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const ticketId = (body as { ticketId?: string })?.ticketId?.trim();
  if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });

  const ticket = await db.ticket.update({
    where: { id: ticketId },
    data: { projectId },
    select: { id: true, number: true, title: true, projectId: true },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json(ticket);
}
