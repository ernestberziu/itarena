"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "./site-settings-context";
import { pickLocale } from "@/lib/site-content/locale";
import { SocialLinks } from "@/components/public/social-links";

export function SiteSettingsPreviewPanel() {
  const t = useTranslations("admin.siteSettingsPage");
  const { activeSection, previewLocale, settings, testimonials } = useSiteSettings();
  const loc = previewLocale;
  const pl = (field: { sq: string; en: string }) => pickLocale(field, loc);

  return (
    <div className="sticky top-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t("preview")}
      </p>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg dark:bg-slate-950">
        <div className="border-b border-border/40 bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
          {t("previewHint")}
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4 text-sm">
          {activeSection === "testimonials" && (
            <PreviewTestimonials testimonials={testimonials} loc={loc} />
          )}

          {activeSection === "social" && (
            <SocialLinks links={settings.social.links} size="sm" variant="light" />
          )}

          {(activeSection === "contact" || activeSection === "footer") && (
            <footer className="rounded-lg bg-slate-900 p-4 text-slate-300 text-xs">
              <p>{pl(settings.footer.description)}</p>
              <p className="mt-3">{settings.contact.phone}</p>
              <p>{settings.contact.email}</p>
              <p className="mt-2 whitespace-pre-line">{pl(settings.contact.address)}</p>
            </footer>
          )}

        </div>
      </div>
    </div>
  );
}

function PreviewTestimonials({
  testimonials,
  loc,
}: {
  testimonials: ReturnType<typeof useSiteSettings>["testimonials"];
  loc: string;
}) {
  return (
    <div className="space-y-3">
      {testimonials
        .filter((t) => t.enabled)
        .slice(0, 3)
        .map((item) => (
          <div key={item.id} className="rounded-lg border bg-card p-3 shadow-sm">
            <PreviewStars rating={item.rating} />
            <p className="mt-2 text-xs italic">&ldquo;{loc === "en" ? item.reviewEn : item.reviewSq}&rdquo;</p>
            <div className="mt-2 flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white",
                  item.avatarColor ?? "bg-primary"
                )}
              >
                {item.initials ?? item.clientName.slice(0, 2)}
              </div>
              <PreviewClient item={item} loc={loc} />
            </div>
          </div>
        ))}
    </div>
  );
}

function PreviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function PreviewClient({
  item,
  loc,
}: {
  item: ReturnType<typeof useSiteSettings>["testimonials"][number];
  loc: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold">{item.clientName}</p>
      <p className="text-[10px] text-muted-foreground">
        {loc === "en" ? item.roleEn : item.roleSq}
      </p>
    </div>
  );
}
