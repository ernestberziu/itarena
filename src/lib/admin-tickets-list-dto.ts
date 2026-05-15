export type AdminTicketRow = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  division: string;
  slaBreached: boolean;
  slaDeadline: string | null;
  createdAt: string;
  updatedAt: string;
  externalRequesterName: string | null;
  createdBy: { firstName: string; lastName: string; email: string };
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
  createdAt: Date;
  updatedAt: Date;
  externalRequesterName: string | null;
  createdBy: { firstName: string; lastName: string; email: string };
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
    slaBreached: ticket.slaBreached,
    slaDeadline: ticket.slaDeadline ? ticket.slaDeadline.toISOString() : null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    externalRequesterName: ticket.externalRequesterName,
    createdBy: ticket.createdBy,
    assignedTo: ticket.assignedTo,
    company: ticket.company,
  };
}
