import { inngest } from "./client";
import { db } from "@/lib/db";
import { getSlaElapsedPercent } from "@/lib/sla";

// Inngest v4: trigger goes inside options as { triggers: [...] }
export const slaChecker = inngest.createFunction(
  {
    id: "sla-checker",
    name: "SLA Deadline Checker",
    triggers: [{ cron: "*/15 * * * *" }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ step }: any) => {
    const openTickets = await step.run("fetch-open-tickets", async () => {
      return db.ticket.findMany({
        where: {
          status: { notIn: ["RESOLVED", "CLOSED", "PAUSED"] },
          slaDeadline: { not: null },
          slaBreached: false,
        },
        include: {
          createdBy: { select: { email: true, firstName: true, language: true } },
          assignedTo: { select: { email: true, firstName: true } },
          company: { select: { name: true } },
        },
      });
    });

    const admins = await step.run("fetch-admins", async () => {
      return db.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, email: true, firstName: true },
      });
    });

    for (const ticket of openTickets) {
      if (!ticket.slaDeadline) continue;
      const percent = getSlaElapsedPercent(ticket.createdAt, ticket.slaDeadline);

      if (percent >= 100) {
        await step.run(`breach-${ticket.id}`, async () => {
          await db.ticket.update({ where: { id: ticket.id }, data: { slaBreached: true } });
          if (admins[0]) {
            await db.ticketHistory.create({
              data: {
                ticketId: ticket.id,
                changedById: admins[0].id,
                field: "slaBreached",
                oldValue: "false",
                newValue: "true",
              },
            });
          }
        });
      } else if (percent >= 75 && !ticket.slaWarned) {
        await step.run(`warn-${ticket.id}`, async () => {
          await db.ticket.update({ where: { id: ticket.id }, data: { slaWarned: true } });
        });
      }
    }

    return { processed: openTickets.length, timestamp: new Date().toISOString() };
  }
);

export const autoCloseResolved = inngest.createFunction(
  {
    id: "auto-close-resolved",
    name: "Auto-close resolved tickets after 48h",
    triggers: [{ cron: "0 * * * *" }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ step }: any) => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const toClose = await step.run("find-resolved-tickets", async () => {
      return db.ticket.findMany({
        where: { status: "RESOLVED", resolvedAt: { lte: fortyEightHoursAgo } },
        select: { id: true },
      });
    });

    if (toClose.length > 0) {
      await step.run("close-tickets", async () => {
        await db.ticket.updateMany({
          where: { id: { in: toClose.map((t: { id: string }) => t.id) } },
          data: { status: "CLOSED", closedAt: new Date() },
        });
      });
    }

    return { closed: toClose.length };
  }
);
