import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import type { AdminCompanyDetail } from "@/types/admin-company";

const patchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    vatNumber: z.string().max(80).optional().nullable(),
    address: z.string().max(300).optional().nullable(),
    city: z.string().max(120).optional().nullable(),
    country: z.string().max(120).optional(),
    tier: z.enum(["RETAIL", "B2B"]).optional(),
    isApproved: z.boolean().optional(),
    notes: z.string().max(5000).optional().nullable(),
  })
  .strict();

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return apiErr("sq", "forbidden", 403);
  }
  return null;
}

function mapDetail(company: {
  id: string;
  name: string;
  vatNumber: string | null;
  address: string | null;
  city: string | null;
  country: string;
  tier: string;
  isApproved: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { users: number; tickets: number; orders: number; quotes: number };
  users: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    role: string;
  }[];
  tickets: { id: string; number: string; title: string; status: string; createdAt: Date }[];
  orders: { id: string; orderNumber: string; status: string; total: unknown; createdAt: Date }[];
}): AdminCompanyDetail {
  return {
    id: company.id,
    name: company.name,
    vatNumber: company.vatNumber,
    address: company.address,
    city: company.city,
    country: company.country,
    tier: company.tier,
    isApproved: company.isApproved,
    notes: company.notes,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
    _count: company._count,
    members: company.users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      role: u.role,
    })),
    recentTickets: company.tickets.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    recentOrders: company.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: String(o.total),
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "companies", "read");
  if (denied) return denied;

  const { id } = await ctx.params;
  const company = await db.company.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, tickets: true, orders: true, quotes: true } },
      users: {
        where: { role: { in: ["CLIENT", "COMPANY_ADMIN"] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          lastLoginAt: true,
          role: true,
        },
        orderBy: { createdAt: "asc" },
      },
      tickets: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, number: true, title: true, status: true, createdAt: true },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
      },
    },
  });

  if (!company) return apiErr(_req, "notFound", 404);
  return NextResponse.json(mapDetail(company));
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "companies", "write");
  if (denied) return denied;

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiErr(req, "invalidBody", 400, { details: parsed.error.flatten() });
  }

  const existing = await db.company.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return apiErr(req, "notFound", 404);

  const p = parsed.data;
  const company = await db.company.update({
    where: { id },
    data: {
      ...(p.name !== undefined ? { name: p.name.trim() } : {}),
      ...(p.vatNumber !== undefined ? { vatNumber: p.vatNumber?.trim() || null } : {}),
      ...(p.address !== undefined ? { address: p.address?.trim() || null } : {}),
      ...(p.city !== undefined ? { city: p.city?.trim() || null } : {}),
      ...(p.country !== undefined ? { country: p.country.trim() } : {}),
      ...(p.tier !== undefined ? { tier: p.tier } : {}),
      ...(p.isApproved !== undefined ? { isApproved: p.isApproved } : {}),
      ...(p.notes !== undefined ? { notes: p.notes?.trim() || null } : {}),
    },
    include: {
      _count: { select: { users: true, tickets: true, orders: true, quotes: true } },
      users: {
        where: { role: { in: ["CLIENT", "COMPANY_ADMIN"] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          lastLoginAt: true,
          role: true,
        },
        orderBy: { createdAt: "asc" },
      },
      tickets: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, number: true, title: true, status: true, createdAt: true },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
      },
    },
  });

  return NextResponse.json(mapDetail(company));
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "companies", "write");
  if (denied) return denied;

  const { id } = await ctx.params;
  const existing = await db.company.findUnique({
    where: { id },
    select: {
      id: true,
      _count: { select: { users: true, tickets: true, orders: true, quotes: true, projectClients: true } },
    },
  });
  if (!existing) return apiErr(_req, "notFound", 404);

  const blocked =
    existing._count.users +
    existing._count.tickets +
    existing._count.orders +
    existing._count.quotes +
    existing._count.projectClients;
  if (blocked > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot delete this company while users, tickets, orders, quotes, or project links still reference it.",
      },
      { status: 409 }
    );
  }

  await db.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
