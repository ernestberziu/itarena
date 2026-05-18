import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { db } from "@/lib/db";
import { listMarketingServices } from "@/lib/site-content/db";
import { serviceCreateSchema } from "@/lib/site-content/schemas";
import { revalidateSitePaths } from "@/lib/site-content/revalidate";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "read");
  if (denied) return denied;

  const services = await listMarketingServices(true);
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const parsed = serviceCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.marketingService.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const maxOrder = await db.marketingService.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const service = await db.marketingService.create({
    data: {
      slug: parsed.data.slug,
      sortOrder,
      enabled: parsed.data.enabled ?? true,
      featured: parsed.data.featured ?? false,
      nameSq: parsed.data.nameSq,
      nameEn: parsed.data.nameEn,
      shortDescSq: parsed.data.shortDescSq,
      shortDescEn: parsed.data.shortDescEn,
      fullDescSq: parsed.data.fullDescSq ?? null,
      fullDescEn: parsed.data.fullDescEn ?? null,
      iconKey: parsed.data.iconKey,
      imageUrl: parsed.data.imageUrl ?? null,
      bannerUrl: parsed.data.bannerUrl ?? null,
      ctaTextSq: parsed.data.ctaTextSq ?? null,
      ctaTextEn: parsed.data.ctaTextEn ?? null,
      ctaLink: parsed.data.ctaLink ?? null,
      showOnHomepage: parsed.data.showOnHomepage ?? true,
      cardStyle: parsed.data.cardStyle ?? null,
      gradientClass: parsed.data.gradientClass ?? null,
      hoverEffect: parsed.data.hoverEffect ?? null,
      colorClass: parsed.data.colorClass ?? null,
      accentClass: parsed.data.accentClass ?? null,
      metaTitleSq: parsed.data.metaTitleSq ?? null,
      metaTitleEn: parsed.data.metaTitleEn ?? null,
      metaDescSq: parsed.data.metaDescSq ?? null,
      metaDescEn: parsed.data.metaDescEn ?? null,
      keywordsSq: parsed.data.keywordsSq ?? null,
      keywordsEn: parsed.data.keywordsEn ?? null,
      featuresJson: parsed.data.featuresJson ?? [],
    },
  });

  revalidateSitePaths();
  return NextResponse.json({ service }, { status: 201 });
}
