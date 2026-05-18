"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TemplatesSubnav } from "./templates-subnav";
import { DEFAULT_TEMPLATE_SETTINGS, type TemplateSettingsConfig } from "@/lib/templates/types";

export function TemplateSettingsForm({ lp }: { lp: string }) {
  const t = useTranslations("admin.templatesPage");
  const [config, setConfig] = useState<TemplateSettingsConfig>(DEFAULT_TEMPLATE_SETTINGS);

  useEffect(() => {
    void fetch("/api/admin/templates/settings")
      .then((r) => r.json())
      .then((c) => setConfig({ ...DEFAULT_TEMPLATE_SETTINGS, ...c }));
  }, []);

  async function save() {
    const res = await fetch("/api/admin/templates/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) toast.success(t("savedStatus"));
  }

  const fields: {
    key: keyof TemplateSettingsConfig;
    labelKey:
      | "settingsAuthorizedRepresentative"
      | "settingsRepresentativeTitle"
      | "settingsCompanyLegalName"
      | "settingsCompanyNipt"
      | "settingsCompanyAddress"
      | "settingsCompanyPhone"
      | "settingsCompanyEmail"
      | "settingsCompanyBank";
  }[] = [
    { key: "authorizedRepresentative", labelKey: "settingsAuthorizedRepresentative" },
    { key: "representativeTitle", labelKey: "settingsRepresentativeTitle" },
    { key: "companyLegalName", labelKey: "settingsCompanyLegalName" },
    { key: "companyNuis", labelKey: "settingsCompanyNipt" },
    { key: "companyAddress", labelKey: "settingsCompanyAddress" },
    { key: "companyPhone", labelKey: "settingsCompanyPhone" },
    { key: "companyEmail", labelKey: "settingsCompanyEmail" },
    { key: "companyBank", labelKey: "settingsCompanyBank" },
  ];

  return (
    <div>
      <TemplatesSubnav lp={lp} />
      <h1 className="mb-6 text-2xl font-bold">{t("settings")}</h1>
      <div className="max-w-xl space-y-4 rounded-2xl border border-border/50 p-6">
        <div>
          <Label>{t("settingsDefaultLanguage")}</Label>
          <select
            className="mt-1 h-9 w-full rounded-lg border px-2 text-sm"
            value={config.defaultLanguage}
            onChange={(e) => setConfig((c) => ({ ...c, defaultLanguage: e.target.value as "sq" | "en" }))}
          >
            <option value="sq">{t("langSq")}</option>
            <option value="en">{t("langEn")}</option>
          </select>
        </div>
        {fields.map(({ key, labelKey }) => (
          <div key={key}>
            <Label>{t(labelKey)}</Label>
            <Input
              value={String(config[key] ?? "")}
              onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div>
          <Label>{t("settingsLegalDisclaimer")}</Label>
          <Textarea
            value={config.legalDisclaimer ?? ""}
            onChange={(e) => setConfig((c) => ({ ...c, legalDisclaimer: e.target.value }))}
          />
        </div>
        <Button type="button" onClick={() => void save()}>
          {t("settingsSave")}
        </Button>
      </div>
    </div>
  );
}
