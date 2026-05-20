"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { TemplatesSubnav } from "./templates-subnav";
import { PartnerContractTermsEditor } from "./partner-contract-terms-editor";
import { ContractMarkdownEditor } from "./contract-markdown-editor";
import { ContractPreviewPanel } from "./contract-preview-panel";
import type { PartnerPayload, TemplateLanguage, TemplateSettingsConfig } from "@/lib/templates/types";
import { DEFAULT_TEMPLATE_SETTINGS } from "@/lib/templates/types";
import {
  composePartnerBody,
  defaultPartnerPayload,
  partnerPartyFromPayload,
} from "@/lib/templates/compose-body";
import {
  getPartnerLocalized,
  migratePartnerPayload,
  patchPartnerLocalized,
} from "@/lib/templates/localized";

type DocRow = {
  id: string;
  documentNumber: string;
  language: string;
  payloadJson: PartnerPayload;
  pdfUrl: string | null;
};

export function PartnerContractWorkspace({
  locale,
  lp,
  documentId,
}: {
  locale: string;
  lp: string;
  documentId?: string;
}) {
  const t = useTranslations("admin.templatesPage");
  const router = useRouter();
  const [docId, setDocId] = useState(documentId);
  const [docNumber, setDocNumber] = useState<string>();
  const [language, setLanguage] = useState<TemplateLanguage>(locale === "en" ? "en" : "sq");
  const [payload, setPayload] = useState<PartnerPayload>(() => defaultPartnerPayload());
  const [settings, setSettings] = useState<TemplateSettingsConfig>(DEFAULT_TEMPLATE_SETTINGS);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const skipNextAutosaveRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/templates/settings")
      .then((r) => r.json())
      .then((s) => {
        if (!cancelled) setSettings({ ...DEFAULT_TEMPLATE_SETTINGS, ...s });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!documentId) return;

    let cancelled = false;
    void fetch(`/api/admin/templates/documents/${documentId}`)
      .then((r) => r.json())
      .then((d: DocRow) => {
        if (cancelled) return;
        skipNextAutosaveRef.current = true;
        setDocId(d.id);
        setDocNumber(d.documentNumber);
        setLanguage(d.language as TemplateLanguage);
        setPayload(
          migratePartnerPayload(
            d.payloadJson as unknown as Record<string, unknown>,
            d.language as TemplateLanguage
          )
        );
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const party = useMemo(() => partnerPartyFromPayload(payload), [payload]);
  const activeText = useMemo(() => getPartnerLocalized(payload, language), [payload, language]);
  const previewMarkdown = useMemo(
    () => composePartnerBody(party, payload, language, settings, docNumber),
    [party, payload, language, settings, docNumber]
  );

  const save = useCallback(async (): Promise<string | null> => {
    setSaveState("saving");
    const body = { partyJson: party, payloadJson: payload, language };
    try {
      if (docId) {
        const res = await fetch(`/api/admin/templates/documents/${docId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const d = (await res.json()) as DocRow;
        setDocNumber(d.documentNumber);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
        return d.id;
      }
      const res = await fetch("/api/admin/templates/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PARTNER_CONTRACT", ...body }),
      });
      if (!res.ok) throw new Error();
      const d = (await res.json()) as DocRow;
      setDocId(d.id);
      setDocNumber(d.documentNumber);
      router.replace(`${lp}/admin/templates/contracts/partner/${d.id}`);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      return d.id;
    } catch {
      toast.error("Save failed");
      setSaveState("idle");
      return null;
    }
  }, [docId, party, payload, language, lp, router]);

  useEffect(() => {
    if (!docId) return;
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      void save();
    }, 2500);
    return () => clearTimeout(timer);
  }, [payload, language, docId, save]);

  async function ensureGenerated(): Promise<string | null> {
    const id = await save();
    if (!id) return null;
    const res = await fetch(`/api/admin/templates/documents/${id}/generate`, { method: "POST" });
    if (!res.ok) {
      toast.error("PDF failed");
      return null;
    }
    return id;
  }

  async function generatePdf() {
    const id = await ensureGenerated();
    if (!id) return;
    toast.success("PDF generated");
    window.open(
      `/api/admin/templates/documents/${id}/pdf?lang=${language}`,
      "_blank"
    );
  }

  return (
    <div>
      <TemplatesSubnav lp={lp} />
      <AdminPageHeader
        title={t("partnerContract")}
        description={docNumber ?? t("newPartner")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void save()}>
              {saveState === "saving"
                ? t("saving")
                : saveState === "saved"
                  ? t("savedStatus")
                  : t("saveDraft")}
            </Button>
            <Button type="button" size="sm" onClick={() => void generatePdf()}>
              {t("generate")}
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant={language === "sq" ? "default" : "outline"}
          onClick={() => setLanguage("sq")}
        >
          {t("langSq")}
        </Button>
        <Button
          size="sm"
          variant={language === "en" ? "default" : "outline"}
          onClick={() => setLanguage("en")}
        >
          {t("langEn")}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <PartnerContractTermsEditor
            payload={payload}
            onChange={(patch) => setPayload((p) => ({ ...p, ...patch }))}
            localizedContent={activeText}
            onLocalizedChange={(patch) =>
              setPayload((p) => patchPartnerLocalized(p, language, patch))
            }
            labels={{
              title: t("partnerTermsTitle"),
              hint: t("partnerTermsHint"),
              sectionPartner: t("sectionPartner"),
              firstName: t("firstName"),
              lastName: t("lastName"),
              idNumber: t("idNumber"),
              sectionPartnership: t("sectionPartnership"),
              role: t("partnerRole"),
              contractType: t("contractType"),
              territory: t("partnerTerritory"),
              contractDate: t("contractDate"),
              startDate: t("startDate"),
              endDate: t("endDate"),
              endDateHint: t("endDateHint"),
              sectionCommercial: t("sectionCommercial"),
              commission: t("partnerCommission"),
              commissionTerms: t("partnerCommissionTerms"),
              commissionTermsHint: t("partnerCommissionTermsHint"),
              sectionPartnerObligations: t("sectionPartnerObligations"),
              partnerObligations: t("partnerObligations"),
              partnerObligationsHint: t("partnerObligationsHint"),
              sectionItarenaObligations: t("sectionItarenaObligations"),
              itarenaObligations: t("itarenaObligations"),
              itarenaObligationsHint: t("itarenaObligationsHint"),
              sectionBrand: t("sectionBrand"),
              brandUsage: t("brandUsage"),
              brandUsageHint: t("brandUsageHint"),
              sectionTermination: t("sectionTermination"),
              noticePeriod: t("noticePeriod"),
              noticePeriodHint: t("noticePeriodHint"),
            }}
          />
          <ContractMarkdownEditor
            value={activeText.bodyMarkdown}
            onChange={(v) =>
              setPayload((p) => patchPartnerLocalized(p, language, { bodyMarkdown: v }))
            }
            title={language === "en" ? t("contractBodyEn") : t("contractBodySq")}
            fullscreenLabel={t("editorFullscreen")}
          />
        </div>
        <div className="xl:sticky xl:top-20 xl:self-start">
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t("preview")}</p>
          <ContractPreviewPanel
            markdown={previewMarkdown}
            party={party}
            settings={settings}
            documentNumber={docNumber}
            variant="partner"
          />
        </div>
      </div>
    </div>
  );
}
