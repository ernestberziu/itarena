import { db } from "@/lib/db";
import type { TemplateSettingsConfig } from "./types";
import { DEFAULT_TEMPLATE_SETTINGS } from "./types";

export async function getTemplateSettings(): Promise<TemplateSettingsConfig> {
  const row = await db.templateSettings.findUnique({ where: { id: "default" } });
  if (!row?.configJson) return DEFAULT_TEMPLATE_SETTINGS;
  return { ...DEFAULT_TEMPLATE_SETTINGS, ...(row.configJson as TemplateSettingsConfig) };
}

export async function upsertTemplateSettings(config: TemplateSettingsConfig): Promise<TemplateSettingsConfig> {
  const row = await db.templateSettings.upsert({
    where: { id: "default" },
    create: { id: "default", configJson: config },
    update: { configJson: config },
  });
  return { ...DEFAULT_TEMPLATE_SETTINGS, ...(row.configJson as TemplateSettingsConfig) };
}
