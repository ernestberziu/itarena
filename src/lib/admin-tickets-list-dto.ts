import { isSlaBreached } from "@/lib/sla";

export type AdminTicketRow = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  division: string;
  slaBreached: boolean;
  slaDeadline: string | null;
  resolvedAt: string | null;
  projectId: string | null;
  project: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
  externalRequesterName: string | null;
  createdBy: { firstName: string; lastName: string; email: string | null };
  assignedTo: { firstName: string; lastName: string } | null;
  company: { name: string } | null;
};

/** Prisma payload shape for admin ticket list rows. */
export type AdminTicketListDb = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  division: string;
  slaBreached: boolean;
  slaDeadline: Date | null;
  resolvedAt: Date | null;
  projectId: string | null;
  project: { id: string; title: string } | null;
  createdAt: Date;
  updatedAt: Date;
  externalRequesterName: string | null;
  createdBy: { firstName: string; lastName: string; email: string | null };
  assignedTo: { firstName: string; lastName: string } | null;
  company: { name: string } | null;
};

export function mapTicketToAdminRow(ticket: AdminTicketListDb): AdminTicketRow {
  return {
    id: ticket.id,
    number: ticket.number,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    division: ticket.division,
    slaBreached: isSlaBreached({
      slaDeadline: ticket.slaDeadline,
      status: ticket.status,
      resolvedAt: ticket.resolvedAt,
    }),
    slaDeadline: ticket.slaDeadline ? ticket.slaDeadline.toISOString() : null,
    resolvedAt: ticket.resolvedAt ? ticket.resolvedAt.toISOString() : null,
    projectId: ticket.projectId ?? null,
    project: ticket.project
      ? { id: ticket.project.id, title: ticket.project.title }
      : null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    externalRequesterName: ticket.externalRequesterName,
    createdBy: ticket.createdBy,
    assignedTo: ticket.assignedTo,
    company: ticket.company,
  };
}
