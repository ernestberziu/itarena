import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { generateQuoteNumber } from "@/lib/utils";

const createSchema = z.object({
  companyName: z.string().min(2),
  vatNumber: z.string().optional(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  title: z.string().min(5),
  description: z.string().min(20),
  services: z.array(z.string()).min(1),
  timeline: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const data = parsed.data;

  const quote = await db.quote.create({
    data: {
      quoteNumber: generateQuoteNumber(),
      requestedById: session?.user.id ?? (await getOrCreateGuestUserId(data.contactEmail, data.contactName)),
      companyId: session?.user.companyId ?? undefined,
      companyName: data.companyName,
      vatNumber: data.vatNumber ?? null,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone ?? null,
      title: data.title,
      description: data.description,
      services: JSON.stringify(data.services),
      timeline: data.timeline ?? null,
      status: "PENDING",
    },
  });

  // Notify admins/sales team
  // TODO: Send email notification to sales team

  return NextResponse.json({ id: quote.id, number: quote.quoteNumber }, { status: 201 });
}

async function getOrCreateGuestUserId(email: string, name: string): Promise<string> {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing.id;

  const [firstName, ...rest] = name.split(" ");
  const user = await db.user.create({
    data: {
      email,
      firstName: firstName ?? name,
      lastName: rest.join(" ") || "-",
      role: "CLIENT",
      language: "sq",
    },
  });
  return user.id;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = ["ADMIN", "SALES"].includes(session.user.role);

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "quotes", "read");
    if (denied) return denied;
  }

  const quotes = await db.quote.findMany({
    where: isStaff ? {} : { requestedById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quotes);
}
