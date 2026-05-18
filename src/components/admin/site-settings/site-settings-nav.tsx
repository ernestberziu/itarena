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
    <nav className="sticky top-4 space-y-1">
      {SECTIONS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
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
