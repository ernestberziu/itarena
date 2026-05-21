import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { db } from "@/lib/db";
import { listTestimonials } from "@/lib/site-content/db";
import { testimonialCreateSchema } from "@/lib/site-content/schemas";
import { revalidateSitePaths } from "@/lib/site-content/revalidate";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiErr("sq", "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "settings", "read");
  if (denied) return denied;

  const testimonials = await listTestimonials(true);
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const parsed = testimonialCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return apiErr(req, "invalidBody", 400, { details: parsed.error.flatten() });
  }

  const maxOrder = await db.testimonial.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const testimonial = await db.testimonial.create({
    data: { ...parsed.data, sortOrder },
  });

  revalidateSitePaths();
  return NextResponse.json({ testimonial }, { status: 201 });
}
