"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { SiteSettingsProvider, useSiteSettings } from "./site-settings-context";
import { SiteSettingsNav } from "./site-settings-nav";
import { SiteSettingsStickyBar } from "./site-settings-sticky-bar";
import { SiteSettingsPreviewPanel } from "./site-settings-preview-panel";
import { SiteSettingsSectionForm } from "./sections/site-settings-sections";

function WorkspaceInner({ locale }: { locale: string }) {
  const t = useTranslations("admin.siteSettingsPage");
  const {
    activeSection,
    setActiveSection,
    previewLocale,
    setPreviewLocale,
    loading,
  } = useSiteSettings();

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t("title")} description={t("subtitle")} />

      {activeSection !== "services" && activeSection !== "hero" && (
        <LocaleToggle previewLocale={previewLocale} setPreviewLocale={setPreviewLocale} />
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <div
          className={
            activeSection === "services" || activeSection === "hero"
              ? "grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr] lg:gap-6"
              : "grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_280px] lg:gap-6"
          }
        >
          <SiteSettingsNav active={activeSection} onChange={setActiveSection} />
          <div className="min-w-0 space-y-4">
            <SiteSettingsSectionForm section={activeSection} />
            <SiteSettingsStickyBar />
          </div>
          {activeSection !== "services" && activeSection !== "hero" && <SiteSettingsPreviewPanel />}
        </div>
      )}
    </div>
  );
}

function LocaleToggle({
  previewLocale,
  setPreviewLocale,
}: {
  previewLocale: "sq" | "en";
  setPreviewLocale: (l: "sq" | "en") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Preview:</span>
      {(["sq", "en"] as const).map((l) => (
        <Button
          key={l}
          type="button"
          size="sm"
          variant={previewLocale === l ? "default" : "outline"}
          onClick={() => setPreviewLocale(l)}
        >
          {l.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}

export function SiteSettingsWorkspace({ locale }: { locale: string }) {
  return (
    <SiteSettingsProvider>
      <WorkspaceInner locale={locale} />
    </SiteSettingsProvider>
  );
}
