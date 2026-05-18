import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { db } from "@/lib/db";
import { serviceUpdateSchema } from "@/lib/site-content/schemas";
import { revalidateSitePaths } from "@/lib/site-content/revalidate";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "read");
  if (denied) return denied;

  const { id } = await params;
  const service = await db.marketingService.findUnique({ where: { id } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ service });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const { id } = await params;
  const parsed = serviceUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.marketingService.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const service = await db.marketingService.update({
    where: { id },
    data: {
      ...parsed.data,
      featuresJson: parsed.data.featuresJson,
    },
  });

  revalidateSitePaths();
  return NextResponse.json({ service });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const { id } = await params;
  await db.marketingService.delete({ where: { id } }).catch(() => null);
  revalidateSitePaths();
  return NextResponse.json({ ok: true });
}
