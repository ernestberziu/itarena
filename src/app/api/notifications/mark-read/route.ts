import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { isStaff } from "@/types/domain";

const bodySchema = z.object({
  id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);

  let notificationId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    notificationId = parsed.success ? parsed.data.id : undefined;
  } catch {
    notificationId = undefined;
  }

  if (isStaff(session.user.role)) {
    const denied = await assertAdminApiAcl(session.user.id, "notifications", "write");
    if (denied) return denied;
  }

  if (notificationId) {
    await db.notification.updateMany({
      where: { id: notificationId, userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
  } else {
    await db.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
