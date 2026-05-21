import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { isStaff } from "@/types/domain";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isStaff(session.user.role)) {
    const denied = await assertAdminApiAcl(session.user.id, "notifications", "read");
    if (denied) return denied;
  }

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "1";
  const category = url.searchParams.get("category");
  const take = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 100);
  const cursor = url.searchParams.get("cursor");

  const where: {
    userId: string;
    readAt?: null | { not: null };
    category?: string;
    createdAt?: { lt: Date };
  } = { userId: session.user.id };

  if (unreadOnly) where.readAt = null;
  if (category) where.category = category;
  if (cursor) where.createdAt = { lt: new Date(cursor) };

  const items = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take + 1,
  });

  const hasMore = items.length > take;
  const page = hasMore ? items.slice(0, take) : items;
  const nextCursor = hasMore ? page[page.length - 1]?.createdAt.toISOString() : null;

  return NextResponse.json({
    items: page.map((n) => ({
      id: n.id,
      type: n.type,
      category: n.category,
      severity: n.severity,
      title: n.title,
      titleEn: n.titleEn,
      body: n.body,
      bodyEn: n.bodyEn,
      link: n.link,
      entityType: n.entityType,
      entityId: n.entityId,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor,
  });
}
