"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useSiteSettings, type SiteSectionId } from "./site-settings-context";
import type { SiteSettingsSectionKey } from "@/lib/site-content/types";

const SECTION_TO_KEY: Partial<Record<SiteSectionId, SiteSettingsSectionKey>> = {
  hero: "hero",
  social: "social",
  contact: "contact",
  footer: "footer",
};

export function SiteSettingsStickyBar() {
  const t = useTranslations("admin.siteSettingsPage");
  const { activeSection, saveState, lastSavedAt, saveSection, discardSection } = useSiteSettings();
  const sectionKey = SECTION_TO_KEY[activeSection];

  const statusLabel =
    saveState === "saving"
      ? t("status.saving")
      : saveState === "unsaved"
        ? t("status.unsaved")
        : t("status.saved");

  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/60 bg-[var(--admin-canvas,hsl(var(--background)))]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SaveStatus statusLabel={statusLabel} lastSavedAt={lastSavedAt} t={t} />
        {sectionKey ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => discardSection(sectionKey)}>
              {t("discard")}
            </Button>
            <Button type="button" size="sm" disabled={saveState === "saving"} onClick={() => void saveSection(sectionKey)}>
              {t("save")}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("entityAutoSave")}</p>
        )}
      </div>
    </div>
  );
}

function SaveStatus({
  statusLabel,
  lastSavedAt,
  t,
}: {
  statusLabel: string;
  lastSavedAt: Date | null;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={
          statusLabel === t("status.unsaved")
            ? "rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
            : "rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
        }
      >
        {statusLabel}
      </span>
      {lastSavedAt ? (
        <span className="text-xs text-muted-foreground">
          {t("lastSaved", { time: lastSavedAt.toLocaleTimeString() })}
        </span>
      ) : null}
    </div>
  );
}
