import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { adminCompaniesListWhere } from "@/lib/admin-companies-list-where";
import { mapCompanyToAdminRow } from "@/lib/admin-companies-list-dto";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";

const companyInclude = {
  _count: { select: { users: true, tickets: true, orders: true } },
} as const;

const postSchema = z
  .object({
    name: z.string().min(1).max(200),
    vatNumber: z.string().max(80).optional().nullable(),
    address: z.string().max(300).optional().nullable(),
    city: z.string().max(120).optional().nullable(),
    country: z.string().max(120).optional().default("Albania"),
    tier: z.enum(["RETAIL", "B2B"]).optional().default("B2B"),
    isApproved: z.boolean().optional().default(true),
    notes: z.string().max(5000).optional().nullable(),
  })
  .strict();

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "companies", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);
  const where = adminCompaniesListWhere({
    q: searchParams.get("q"),
  });

  const [companies, total] = await Promise.all([
    db.company.findMany({
      where,
      include: companyInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.company.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(companies.map(mapCompanyToAdminRow), total, page, pageSize));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "companies", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const company = await db.company.create({
    data: {
      name: data.name.trim(),
      vatNumber: data.vatNumber?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      country: data.country?.trim() || "Albania",
      tier: data.tier,
      isApproved: data.isApproved ?? false,
      notes: data.notes?.trim() || null,
    },
    include: companyInclude,
  });

  return NextResponse.json(mapCompanyToAdminRow(company), { status: 201 });
}
