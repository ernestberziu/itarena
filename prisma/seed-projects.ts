import type { PrismaClient } from "@prisma/client";

export async function seedProjects(prisma: PrismaClient) {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@itarena.al" },
    select: { id: true },
  });
  const engineer = await prisma.user.findUnique({
    where: { email: "engineer@itarena.al" },
    select: { id: true },
  });
  const company = await prisma.company.findUnique({
    where: { id: "demo-company-001" },
    select: { id: true },
  });
  const client = await prisma.user.findFirst({
    where: { email: { contains: "client" } },
    select: { id: true },
  });

  if (!admin) return;

  const partnerHash = await import("bcryptjs").then((b) => b.hash("Partner@123!", 12));
  const partner = await prisma.user.upsert({
    where: { email: "partner@itarena.al" },
    update: {
      role: "PARTNER",
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: "partner@itarena.al",
      passwordHash: partnerHash,
      firstName: "Partner",
      lastName: "Demo",
      role: "PARTNER",
      language: "sq",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const project = await prisma.project.upsert({
    where: { slug: "demo-projekt-infrastrukture" },
    update: { title: "Demo — Infrastrukturë IT" },
    create: {
      title: "Demo — Infrastrukturë IT",
      slug: "demo-projekt-infrastrukture",
      description: "Projekt demonstrues për testimin e modulit Projects.",
      status: "ACTIVE",
      createdById: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: partner.id } },
    update: { access: "write" },
    create: { projectId: project.id, userId: partner.id, access: "write" },
  });

  if (engineer) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: engineer.id } },
      update: { access: "read" },
      create: { projectId: project.id, userId: engineer.id, access: "read" },
    });
  }

  if (company) {
    const existingCompanyClient = await prisma.projectClient.findFirst({
      where: { projectId: project.id, companyId: company.id },
    });
    if (!existingCompanyClient) {
      await prisma.projectClient.create({
        data: { projectId: project.id, companyId: company.id },
      });
    }
  }

  if (client) {
    const existingUserClient = await prisma.projectClient.findFirst({
      where: { projectId: project.id, userId: client.id },
    });
    if (!existingUserClient) {
      await prisma.projectClient.create({
        data: { projectId: project.id, userId: client.id },
      });
    }
  }

  const existingTicket = await prisma.ticket.findFirst({
    where: { projectId: project.id },
  });
  if (!existingTicket && engineer) {
    await prisma.ticket.create({
      data: {
        number: `ITA-${new Date().getFullYear()}-PROJ01`,
        title: "Konfigurim serveri — projekt demo",
        description: "Biletë e lidhur me projektin demonstrues.",
        status: "OPEN",
        priority: "MEDIUM",
        division: "it_support",
        projectId: project.id,
        createdById: admin.id,
        assignedToId: engineer.id,
        companyId: company?.id ?? null,
        estimatedDays: 1,
        estimatedHours: 0,
      },
    });
  }

  const msgCount = await prisma.projectMessage.count({ where: { projectId: project.id } });
  if (msgCount === 0) {
    await prisma.projectMessage.createMany({
      data: [
        {
          projectId: project.id,
          authorId: admin.id,
          body: "Projekti u krijua. Mirë se vini në kanalin e projektit.",
          isInternal: false,
        },
        {
          projectId: project.id,
          authorId: partner.id,
          body: "Shënim i brendshëm: koordinim me klientin për javën e ardhshme.",
          isInternal: true,
        },
      ],
    });
  }

  console.log("✅ Projects seed:", project.slug, "| partner:", partner.email);
}
