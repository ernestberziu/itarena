import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { db } from "@/lib/db";
import { serviceReorderSchema } from "@/lib/site-content/schemas";
import { revalidateSitePaths } from "@/lib/site-content/revalidate";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const parsed = serviceReorderSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await db.$transaction(
    parsed.data.items.map((item) =>
      db.marketingService.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  revalidateSitePaths();
  return NextResponse.json({ ok: true });
}
