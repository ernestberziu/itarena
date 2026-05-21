import {  NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/notification-count";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiErr("sq", "unauthorized", 401);

  const count = await countUnreadNotifications(session.user.id);
  return NextResponse.json({ count });
}
