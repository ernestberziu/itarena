import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { db } from "@/lib/db";
import { testimonialUpdateSchema } from "@/lib/site-content/schemas";
import { revalidateSitePaths } from "@/lib/site-content/revalidate";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const { id } = await params;
  const parsed = testimonialUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const testimonial = await db.testimonial.update({
    where: { id },
    data: parsed.data,
  });

  revalidateSitePaths();
  return NextResponse.json({ testimonial });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const { id } = await params;
  await db.testimonial.delete({ where: { id } }).catch(() => null);
  revalidateSitePaths();
  return NextResponse.json({ ok: true });
}
