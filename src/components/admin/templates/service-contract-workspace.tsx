"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { TemplatesSubnav } from "./templates-subnav";
import { CustomerSelector } from "./customer-selector";
import { LineItemsEditor } from "./line-items-editor";
import { ServiceContractTermsEditor } from "./service-contract-terms-editor";
import { ContractMarkdownEditor } from "./contract-markdown-editor";
import { ContractPreviewPanel } from "./contract-preview-panel";
import type { ContractParty, ServiceContractPayload, TemplateLanguage, TemplateSettingsConfig } from "@/lib/templates/types";
import { DEFAULT_TEMPLATE_SETTINGS } from "@/lib/templates/types";
import { defaultServicePayload, composeServiceBody } from "@/lib/templates/compose-body";
import { computeContractTotals, formatMoney } from "@/lib/templates/calculate";
import { migrateServicePayload, getServiceLocalized, patchServiceLocalized } from "@/lib/templates/localized";
import { normalizeServicePayload } from "@/lib/templates/recurring";

type DocRow = {
  id: string;
  documentNumber: string;
  status: string;
  language: string;
  partyJson: ContractParty;
  payloadJson: ServiceContractPayload;
  pdfUrl: string | null;
};

export function ServiceContractWorkspace({
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
  const [party, setParty] = useState<ContractParty>({ mode: "manual", fullName: "" });
  const [payload, setPayload] = useState<ServiceContractPayload>(() => defaultServicePayload());
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
        setParty(d.partyJson);
        setPayload(
          normalizeServicePayload(
            migrateServicePayload(
              d.payloadJson as unknown as Record<string, unknown>,
              d.language as TemplateLanguage
            )
          )
        );
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const previewMarkdown = useMemo(
    () => composeServiceBody(party, payload, language, settings, docNumber),
    [party, payload, language, settings, docNumber]
  );

  const totals = useMemo(
    () => computeContractTotals(payload.services, payload.products, payload.vatEnabled),
    [payload]
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
        body: JSON.stringify({ type: "SERVICE_CONTRACT", ...body }),
      });
      if (!res.ok) throw new Error();
      const d = (await res.json()) as DocRow;
      setDocId(d.id);
      setDocNumber(d.documentNumber);
      router.replace(`${lp}/admin/templates/contracts/service/${d.id}`);
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
  }, [party, payload, language, docId, save]);

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

  const activeText = useMemo(() => getServiceLocalized(payload, language), [payload, language]);

  return (
    <div>
      <TemplatesSubnav lp={lp} />
      <AdminPageHeader
        title={t("serviceContract")}
        description={docNumber ?? t("newService")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void save()}>
              {saveState === "saving" ? t("saving") : saveState === "saved" ? t("savedStatus") : t("saveDraft")}
            </Button>
            <Button type="button" size="sm" onClick={() => void generatePdf()}>
              {t("generate")}
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={language === "sq" ? "default" : "outline"} onClick={() => setLanguage("sq")}>
          {t("langSq")}
        </Button>
        <Button size="sm" variant={language === "en" ? "default" : "outline"} onClick={() => setLanguage("en")}>
          {t("langEn")}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <CustomerSelector
            party={party}
            onChange={setParty}
            labels={{ portal: t("portalClient"), manual: t("manualClient"), customer: t("customer") }}
          />
          <LineItemsEditor
            services={payload.services}
            products={payload.products}
            onServicesChange={(s) => setPayload((p) => ({ ...p, services: s }))}
            onProductsChange={(pr) => setPayload((p) => ({ ...p, products: pr }))}
            currency={payload.currency}
            locale={language}
            vatEnabled={payload.vatEnabled}
            labels={{
              services: t("services"),
              products: t("products"),
              title: t("lineItemsTitle"),
              hint: t("lineItemsHint"),
              colName: t("colName"),
              colQty: t("colQty"),
              colUnitPrice: t("colUnitPrice"),
              colVat: t("colVat"),
              colLineTotal: t("colLineTotal"),
              addLine: t("addLine"),
              emptyLines: t("emptyLines"),
              emptyLinesHint: t("emptyLinesHint"),
              tabSubtotal: t("tabSubtotal"),
              descriptionOptional: t("descriptionOptional"),
              pickFromCatalog: t("pickFromCatalog"),
              catalogSearch: t("catalogSearch"),
              catalogEmpty: t("catalogEmpty"),
              catalogLoading: t("catalogLoading"),
              catalogError: t("catalogError"),
              vatSuffix: t("vatSuffix"),
              removeLine: t("removeLine"),
            }}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                {t("contractSubtotal")}:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatMoney(totals.subtotal, payload.currency, language)}
                </span>
              </span>
              {totals.vatAmount > 0 ? (
                <span>
                  {t("contractVat")}:{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatMoney(totals.vatAmount, payload.currency, language)}
                  </span>
                </span>
              ) : null}
            </div>
            <p className="text-sm font-semibold">
              {t("contractTotal")}:{" "}
              <span className="text-lg tabular-nums text-primary">
                {formatMoney(totals.total, payload.currency, language)}
              </span>
            </p>
          </div>
          <ServiceContractTermsEditor
            payload={payload}
            onChange={(patch) => setPayload((p) => ({ ...p, ...patch }))}
            localizedContent={activeText}
            onLocalizedChange={(patch) =>
              setPayload((p) => patchServiceLocalized(p, language, patch))
            }
            language={language}
            contractTotal={totals.total}
            labels={{
              title: t("termsTitle"),
              hint: t("termsHint"),
              sectionDates: t("sectionDates"),
              contractDate: t("contractDate"),
              startDate: t("startDate"),
              endDate: t("endDate"),
              endDateHint: t("endDateHint"),
              sectionCommercial: t("sectionCommercial"),
              currency: t("currency"),
              paymentTerms: t("paymentTerms"),
              deliveryTerms: t("deliveryTerms"),
              sectionTax: t("sectionTax"),
              vatEnabled: t("vatEnabled"),
              vatHint: t("vatHint"),
              sectionRecurring: t("sectionRecurring"),
              recurringHint: t("recurringHint"),
              recurringEnabled: t("recurringEnabled"),
              recurringServicesTitle: t("recurringServicesTitle"),
              recurringServicesHint: t("recurringServicesHint"),
              recurringStart: t("recurringStart"),
              colName: t("colName"),
              colQty: t("colQty"),
              colUnitPrice: t("colUnitPrice"),
              colVat: t("colVat"),
              colLineTotal: t("colLineTotal"),
              descriptionOptional: t("descriptionOptional"),
              addLine: t("addLine"),
              emptyLines: t("emptyLines"),
              emptyLinesHint: t("emptyLinesHint"),
              recurringItemFrequency: t("recurringItemFrequency"),
              recurringVatEnabled: t("recurringVatEnabled"),
              recurringVatHint: t("recurringVatHint"),
              sectionTermination: t("sectionTermination"),
              sectionTerminationOnetime: t("sectionTerminationOnetime"),
              noticePeriod: t("noticePeriod"),
              noticePeriodHint: t("noticePeriodHint"),
              noticePeriodHintOnetime: t("noticePeriodHintOnetime"),
              sectionNotes: t("sectionNotes"),
              notes: t("notes"),
              showPrices: t("showPrices"),
              showPricesHint: t("showPricesHint"),
              removeItem: t("removeItem"),
            }}
          />
          <ContractMarkdownEditor
            value={activeText.bodyMarkdown}
            onChange={(v) => setPayload((p) => patchServiceLocalized(p, language, { bodyMarkdown: v }))}
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
            variant="service"
          />
        </div>
      </div>
    </div>
  );
}
