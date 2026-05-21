import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { adminClientsListWhere } from "@/lib/admin-clients-list-where";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }
  const denied = await assertAdminApiAcl(session.user.id, "pos_sale", "read");
  if (denied) return denied;

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const where = adminClientsListWhere({ q, active: "active" });

  const users = await db.user.findMany({
    where: { ...where, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      company: { select: { name: true } },
    },
    orderBy: { lastName: "asc" },
    take: 25,
  });

  return NextResponse.json({
    items: users.map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      phone: u.phone,
      companyName: u.company?.name ?? null,
    })),
  });
}
