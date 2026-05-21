"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { SiteSectionId } from "./site-settings-context";

const SECTIONS: SiteSectionId[] = [
  "services",
  "hero",
  "testimonials",
  "social",
  "contact",
  "footer",
];

export function SiteSettingsNav({
  active,
  onChange,
}: {
  active: SiteSectionId;
  onChange: (id: SiteSectionId) => void;
}) {
  const t = useTranslations("admin.siteSettingsPage");

  return (
    <nav className="flex gap-1 overflow-x-auto overscroll-x-contain pb-1 lg:sticky lg:top-4 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory lg:snap-none">
      {SECTIONS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "shrink-0 snap-start rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors whitespace-nowrap lg:w-full lg:shrink lg:whitespace-normal",
            active === id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {t(`sections.${id}`)}
        </button>
      ))}
    </nav>
  );
}
