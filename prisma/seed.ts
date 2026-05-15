import "./ensure-database-url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminHash = await bcrypt.hash("Admin@123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@itarena.al" },
    update: {
      passwordHash: adminHash,
      firstName: "Admin",
      lastName: "IT Arena",
      role: "ADMIN",
      language: "sq",
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: "admin@itarena.al",
      passwordHash: adminHash,
      firstName: "Admin",
      lastName: "IT Arena",
      role: "ADMIN",
      language: "sq",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Engineer user
  const engineerHash = await bcrypt.hash("Engineer@123!", 12);
  const engineer = await prisma.user.upsert({
    where: { email: "engineer@itarena.al" },
    update: {
      passwordHash: engineerHash,
      firstName: "Inxhinier",
      lastName: "Demo",
      role: "ENGINEER",
      language: "sq",
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: "engineer@itarena.al",
      passwordHash: engineerHash,
      firstName: "Inxhinier",
      lastName: "Demo",
      role: "ENGINEER",
      language: "sq",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Engineer user:", engineer.email);

  // Demo B2B company + user
  const company = await prisma.company.upsert({
    where: { id: "demo-company-001" },
    update: {},
    create: {
      id: "demo-company-001",
      name: "Demo Kompania SH.P.K",
      vatNumber: "K12345678A",
      address: "Rruga Demo, Nr. 1",
      city: "Tiranë",
      tier: "B2B",
      isApproved: true,
    },
  });
  console.log("✅ Demo company:", company.name);

  const clientHash = await bcrypt.hash("Client@123!", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@demo.al" },
    update: {
      passwordHash: clientHash,
      firstName: "Klient",
      lastName: "Demo",
      role: "COMPANY_ADMIN",
      companyId: company.id,
      language: "sq",
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: "client@demo.al",
      passwordHash: clientHash,
      firstName: "Klient",
      lastName: "Demo",
      role: "COMPANY_ADMIN",
      companyId: company.id,
      language: "sq",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Demo B2B client:", client.email);

  console.log("\n🎉 Seeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin: admin@itarena.al / Admin@123!");
  console.log("  Engineer: engineer@itarena.al / Engineer@123!");
  console.log("  B2B Client: client@demo.al / Client@123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
