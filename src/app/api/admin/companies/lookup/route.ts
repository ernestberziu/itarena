import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import type { CompanyLookupItem } from "@/types/admin-company";

function parseLimit(searchParams: URLSearchParams) {
  const raw = Number(searchParams.get("limit") ?? "20");
  if (!Number.isFinite(raw)) return 20;
  return Math.min(50, Math.max(5, Math.floor(raw)));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);

  const allowed = ["ADMIN", "SALES"];
  if (!allowed.includes(session.user.role ?? "")) {
    return apiErr(req, "forbidden", 403);
  }

  const denied = await assertAdminApiAcl(session.user.id, "companies", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = parseLimit(searchParams);

  const companies = await db.company.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { vatNumber: { contains: q } },
          ],
        }
      : {},
    select: { id: true, name: true, vatNumber: true, city: true },
    take: limit,
    orderBy: { name: "asc" },
  });

  const items: CompanyLookupItem[] = companies.map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: [c.vatNumber, c.city].filter(Boolean).join(" · ") || undefined,
  }));

  return NextResponse.json(items);
}
