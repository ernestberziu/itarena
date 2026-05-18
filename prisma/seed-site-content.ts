import type { PrismaClient } from "@prisma/client";
import {
  DEFAULT_MARKETING_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
} from "../src/lib/site-content/defaults";

export async function seedSiteContent(prisma: PrismaClient): Promise<void> {
  const d = DEFAULT_SITE_SETTINGS;
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      generalJson: d.general,
      brandingJson: d.branding,
      heroJson: d.hero,
      contactJson: d.contact,
      socialJson: d.social,
      footerJson: d.footer,
      seoJson: d.seo,
      landingJson: d.landing,
    },
  });
  console.log("✅ Site settings seeded");

  const serviceCount = await prisma.marketingService.count();
  if (serviceCount === 0) {
    for (const svc of DEFAULT_MARKETING_SERVICES) {
      await prisma.marketingService.create({
        data: {
          ...svc,
          featuresJson: svc.featuresJson,
        },
      });
    }
    console.log(`✅ ${DEFAULT_MARKETING_SERVICES.length} marketing services seeded`);
  } else {
    console.log("⏭️  Marketing services already exist, skipping");
  }

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    for (const t of DEFAULT_TESTIMONIALS) {
      await prisma.testimonial.create({ data: t });
    }
    console.log(`✅ ${DEFAULT_TESTIMONIALS.length} testimonials seeded`);
  } else {
    console.log("⏭️  Testimonials already exist, skipping");
  }
}
