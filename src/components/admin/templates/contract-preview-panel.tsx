"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslations } from "next-intl";
import { ItArenaLogo } from "@/components/brand/logo";
import type { ContractParty, TemplateSettingsConfig } from "@/lib/templates/types";

export function ContractPreviewPanel({
  markdown,
  party,
  settings,
  variant,
}: {
  markdown: string;
  party: ContractParty;
  settings: TemplateSettingsConfig;
  documentNumber?: string;
  variant: "service" | "employment" | "partner";
}) {
  const t = useTranslations("admin.templatesPage");

  const leftPartyLabel =
    variant === "employment"
      ? t("previewEmployee")
      : variant === "partner"
        ? t("previewPartner")
        : t("previewClient");
  return (
    <div className="contract-preview-panel min-h-[640px] rounded-2xl border border-border/50 bg-white text-slate-900 shadow-lg print:shadow-none">
      <div className="border-b border-slate-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <ItArenaLogo variant="light" size="md" />
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-800">{settings.companyLegalName}</p>
            <p>{settings.companyAddress}</p>
          </div>
        </div>
      </div>
      <article className="contract-preview-prose px-8 py-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
      <div className="grid grid-cols-2 gap-8 border-t border-slate-200 px-8 py-8 text-sm">
        <div>
          <p className="font-semibold text-slate-800">{leftPartyLabel}</p>
          <p className="mt-1">{party.fullName}</p>
          <div className="mt-8 border-b border-slate-400" />
          <p className="mt-2 text-xs text-slate-500">{t("previewSignature")}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800">IT Arena</p>
          <p className="mt-1">{settings.authorizedRepresentative}</p>
          <p className="text-xs text-slate-500">{settings.representativeTitle}</p>
          <div className="mt-8 border-b border-slate-400" />
        </div>
      </div>
    </div>
  );
}
