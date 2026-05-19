import { db } from "@/lib/db";
import { addToBucket, buildDailyBuckets, mapToDailyPoints } from "./helpers";
import type { DailyPoint, ProjectsSection } from "./types";

export async function fetchProjectMetrics(from: Date, to: Date): Promise<ProjectsSection> {
  const [
    projectsCreated,
    projectsByStatus,
    stepsByStatus,
    messagesInRange,
    ticketsInRange,
    projectsWithCounts,
  ] = await Promise.all([
    db.project.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    }),
    db.project.groupBy({
      by: ["status"],
      _count: true,
    }),
    db.projectStep.groupBy({
      by: ["status"],
      where: { updatedAt: { gte: from, lte: to } },
      _count: true,
    }),
    db.projectMessage.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    }),
    db.ticket.findMany({
      where: {
        projectId: { not: null },
        createdAt: { gte: from, lte: to },
      },
      select: { projectId: true },
    }),
    db.project.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            tickets: true,
            messages: true,
            steps: true,
          },
        },
        steps: {
          where: { status: "CLOSED" },
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  const createdMap = buildDailyBuckets(from, to);
  for (const p of projectsCreated) {
    addToBucket(createdMap, p.createdAt, 1);
  }

  const messagesMap = buildDailyBuckets(from, to);
  for (const m of messagesInRange) {
    addToBucket(messagesMap, m.createdAt, 1);
  }

  const ticketCountByProject = new Map<string, number>();
  for (const t of ticketsInRange) {
    if (!t.projectId) continue;
    ticketCountByProject.set(t.projectId, (ticketCountByProject.get(t.projectId) ?? 0) + 1);
  }

  const messageCountByProject = await db.projectMessage.groupBy({
    by: ["projectId"],
    where: { createdAt: { gte: from, lte: to } },
    _count: true,
  });
  const messagesByProject = new Map(
    messageCountByProject.map((m) => [m.projectId, m._count])
  );

  const topProjects = projectsWithCounts
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      tickets: ticketCountByProject.get(p.id) ?? 0,
      messages: messagesByProject.get(p.id) ?? 0,
      stepsClosed: p.steps.length,
      stepsTotal: p._count.steps,
    }))
    .sort((a, b) => b.tickets + b.messages - (a.tickets + a.messages))
    .slice(0, 12);

  const statusTotals = {
    active: projectsByStatus.find((s) => s.status === "ACTIVE")?._count ?? 0,
    completed: projectsByStatus.find((s) => s.status === "COMPLETED")?._count ?? 0,
    archived: projectsByStatus.find((s) => s.status === "ARCHIVED")?._count ?? 0,
    createdInRange: projectsCreated.length,
    messagesInRange: messagesInRange.length,
    ticketsInRange: ticketsInRange.length,
  };

  return {
    byStatus: projectsByStatus.map((s) => ({ status: s.status, count: s._count })),
    createdDaily: mapToDailyPoints(createdMap),
    stepByStatus: stepsByStatus.map((s) => ({ status: s.status, count: s._count })),
    messagesDaily: mapToDailyPoints(messagesMap),
    topProjects,
    totals: statusTotals,
  };
}
