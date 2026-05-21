import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/notification-count";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await countUnreadNotifications(session.user.id);
  return NextResponse.json({ count });
}
