"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, ListChecks, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconPicker } from "./shared/icon-picker";
import { BilingualInput } from "./shared/bilingual-input";
import { adminWhiteDialogClassName, adminWhiteInputClassName } from "@/components/admin/admin-white-dialog";
import { getLucideIcon } from "@/lib/site-content/icons";
import { cn } from "@/lib/utils";
import type { MarketingServiceRecord, ServiceFeature } from "@/lib/site-content/types";

function emptyDraft(): Partial<MarketingServiceRecord> {
  return {
    slug: "",
    nameSq: "",
    nameEn: "",
    shortDescSq: "",
    shortDescEn: "",
    fullDescSq: "",
    fullDescEn: "",
    iconKey: "Monitor",
    enabled: true,
    featured: false,
    showOnHomepage: true,
    featuresJson: [],
    colorClass: "",
    accentClass: "",
    gradientClass: "",
    ctaTextSq: "",
    ctaTextEn: "",
    ctaLink: "",
    metaTitleSq: "",
    metaTitleEn: "",
    metaDescSq: "",
    metaDescEn: "",
    keywordsSq: "",
    keywordsEn: "",
  };
}

function serviceToDraft(service: MarketingServiceRecord): Partial<MarketingServiceRecord> {
  return {
    slug: service.slug,
    nameSq: service.nameSq,
    nameEn: service.nameEn,
    shortDescSq: service.shortDescSq,
    shortDescEn: service.shortDescEn,
    fullDescSq: service.fullDescSq ?? "",
    fullDescEn: service.fullDescEn ?? "",
    iconKey: service.iconKey,
    imageUrl: service.imageUrl,
    bannerUrl: service.bannerUrl,
    enabled: service.enabled,
    featured: service.featured,
    showOnHomepage: service.showOnHomepage,
    featuresJson: [...(service.featuresJson ?? [])],
    colorClass: service.colorClass ?? "",
    accentClass: service.accentClass ?? "",
    gradientClass: service.gradientClass ?? "",
    cardStyle: service.cardStyle ?? "",
    hoverEffect: service.hoverEffect ?? "",
    ctaTextSq: service.ctaTextSq ?? "",
    ctaTextEn: service.ctaTextEn ?? "",
    ctaLink: service.ctaLink ?? "",
    metaTitleSq: service.metaTitleSq ?? "",
    metaTitleEn: service.metaTitleEn ?? "",
    metaDescSq: service.metaDescSq ?? "",
    metaDescEn: service.metaDescEn ?? "",
    keywordsSq: service.keywordsSq ?? "",
    keywordsEn: service.keywordsEn ?? "",
  };
}

function EditorSection({
  eyebrow,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {(eyebrow || description) && (
        <div className="space-y-1 px-0.5">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
          ) : null}
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      )}
      <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] dark:bg-white">
        {children}
      </div>
    </section>
  );
}

function FormField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input className={adminWhiteInputClassName} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function LocaleColumnHeader({ code, label }: { code: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-5 shrink-0 items-center justify-center rounded-md bg-background px-1.5 text-[10px] font-bold tracking-wide text-muted-foreground ring-1 ring-inset ring-border/60">
        {code}
      </span>
      <span className="truncate text-xs font-medium text-foreground">{label}</span>
    </div>
  );
}

function FeatureCard({
  index,
  feature,
  inputClassName,
  onChange,
  onRemove,
  removeLabel,
}: {
  index: number;
  feature: ServiceFeature;
  inputClassName?: string;
  onChange: (next: ServiceFeature) => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <article className="group rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] transition-shadow hover:shadow-md dark:bg-white">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold tabular-nums text-primary">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            #{index + 1}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 bg-white opacity-80 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="space-y-2 rounded-xl border border-border/40 bg-muted/10 p-3">
          <LocaleColumnHeader code="SQ" label="Shqip" />
          <Input
            className={cn(inputClassName, "h-10 text-sm")}
            placeholder="P.sh. Monitorim 24/7"
            value={feature.sq}
            onChange={(e) => onChange({ ...feature, sq: e.target.value })}
          />
        </div>
        <div className="space-y-2 rounded-xl border border-border/40 bg-muted/10 p-3">
          <LocaleColumnHeader code="EN" label="English" />
          <Input
            className={cn(inputClassName, "h-10 text-sm")}
            placeholder="e.g. 24/7 monitoring"
            value={feature.en}
            onChange={(e) => onChange({ ...feature, en: e.target.value })}
          />
        </div>
      </div>
    </article>
  );
}

function FeaturesEditor({
  features,
  onChange,
  inputClassName,
}: {
  features: ServiceFeature[];
  onChange: (f: ServiceFeature[]) => void;
  inputClassName?: string;
}) {
  const t = useTranslations("admin.siteSettingsPage.serviceEditor");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="h-4 w-4" strokeWidth={2} />
          </span>
          <p className="text-sm font-medium">{t("featuresCount", { count: features.length })}</p>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 gap-1.5 shadow-sm"
          onClick={() => onChange([...features, { sq: "", en: "" }])}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addFeature")}
        </Button>
      </div>

      {features.length === 0 ? (
        <button
          type="button"
          onClick={() => onChange([{ sq: "", en: "" }])}
          className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-12 text-center transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
            <ListChecks className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{t("noFeatures")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("addFeature")}</p>
          </div>
        </button>
      ) : (
        <ul className="flex flex-col gap-3">
          {features.map((f, i) => (
            <li key={i} className="min-w-0">
              <FeatureCard
                index={i}
                feature={f}
                inputClassName={inputClassName}
                removeLabel={t("removeFeature")}
                onRemove={() => onChange(features.filter((_, j) => j !== i))}
                onChange={(next) => {
                  const updated = [...features];
                  updated[i] = next;
                  onChange(updated);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ServiceEditorSheet({
  open,
  onOpenChange,
  serviceId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  serviceId: string | null;
  onSaved: () => void;
}) {
  const t = useTranslations("admin.siteSettingsPage.serviceEditor");
  const tRoot = useTranslations("admin.siteSettingsPage");
  const tSections = useTranslations("admin.siteSettingsPage.sections");
  const [draft, setDraft] = useState<Partial<MarketingServiceRecord>>(emptyDraft);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(serviceId);
  const Icon = getLucideIcon(draft.iconKey ?? "Monitor");

  useEffect(() => {
    if (!open) return;

    if (!serviceId) {
      setDraft(emptyDraft());
      return;
    }

    let cancelled = false;
    setLoading(true);
    void fetch(`/api/admin/site/services/${serviceId}`)
      .then((r) => r.json())
      .then((data: { service?: MarketingServiceRecord; error?: string }) => {
        if (cancelled) return;
        if (data.service) {
          setDraft(serviceToDraft(data.service));
        } else {
          toast.error(data.error ?? "Failed to load service");
        }
      })
      .catch(() => toast.error("Failed to load service"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, serviceId]);

  const save = async () => {
    if (!draft.slug?.trim() && !isEdit) {
      toast.error(t("slugRequired"));
      return;
    }
    if (!draft.nameSq?.trim() || !draft.nameEn?.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/site/services/${serviceId}` : "/api/admin/site/services";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          fullDescSq: draft.fullDescSq || null,
          fullDescEn: draft.fullDescEn || null,
          ctaTextSq: draft.ctaTextSq || null,
          ctaTextEn: draft.ctaTextEn || null,
          ctaLink: draft.ctaLink || null,
          colorClass: draft.colorClass || null,
          accentClass: draft.accentClass || null,
          gradientClass: draft.gradientClass || null,
          metaTitleSq: draft.metaTitleSq || null,
          metaTitleEn: draft.metaTitleEn || null,
          metaDescSq: draft.metaDescSq || null,
          metaDescEn: draft.metaDescEn || null,
          keywordsSq: draft.keywordsSq || null,
          keywordsEn: draft.keywordsEn || null,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Save failed");
      }
      toast.success(tRoot("save"));
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden p-0",
          "data-[side=right]:!w-[min(48vw,40rem)] data-[side=right]:!max-w-[40rem]",
          adminWhiteDialogClassName
        )}
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 bg-white px-5 pb-4 pt-5 text-left sm:pr-14 dark:bg-white">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {tSections("services")}
          </p>
          <div className="mt-2 flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ring-1 ring-black/[0.04]",
                draft.colorClass || "bg-muted/30"
              )}
            >
              <Icon className="h-7 w-7" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <SheetTitle className="text-left text-lg font-semibold tracking-tight">
                {isEdit ? tRoot("editService") : tRoot("addService")}
              </SheetTitle>
              <SheetDescription className="text-left text-xs leading-relaxed">
                {isEdit && draft.slug ? (
                  <span className="inline-flex rounded-md bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-inset ring-border/50">
                    /sherbime/{draft.slug}
                  </span>
                ) : (
                  t("addDescription")
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white py-20 dark:bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 pb-8 dark:bg-white">
            <div className="space-y-5">
              <EditorSection eyebrow={t("sectionIdentity")}>
                {!isEdit && (
                  <FormField
                    label={t("slug")}
                    hint={t("slugHint")}
                    value={draft.slug ?? ""}
                    onChange={(slug) =>
                      setDraft({ ...draft, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "") })
                    }
                  />
                )}
                <div className={cn(!isEdit && "mt-4")}>
                  <IconPicker
                    label={t("icon")}
                    value={draft.iconKey ?? "Monitor"}
                    onChange={(iconKey) => setDraft({ ...draft, iconKey })}
                  />
                </div>
              </EditorSection>

              <EditorSection eyebrow={t("sectionCopy")}>
                <div className="space-y-5">
                  <BilingualInput
                    label={t("nameLabel")}
                    value={{ sq: draft.nameSq ?? "", en: draft.nameEn ?? "" }}
                    onChange={({ sq, en }) => setDraft({ ...draft, nameSq: sq, nameEn: en })}
                    inputClassName={adminWhiteInputClassName}
                  />
                  <BilingualInput
                    label={t("shortDescLabel")}
                    value={{ sq: draft.shortDescSq ?? "", en: draft.shortDescEn ?? "" }}
                    onChange={({ sq, en }) => setDraft({ ...draft, shortDescSq: sq, shortDescEn: en })}
                    multiline
                    rows={3}
                    inputClassName={adminWhiteInputClassName}
                  />
                  <BilingualInput
                    label={t("fullDescLabel")}
                    value={{ sq: draft.fullDescSq ?? "", en: draft.fullDescEn ?? "" }}
                    onChange={({ sq, en }) => setDraft({ ...draft, fullDescSq: sq, fullDescEn: en })}
                    multiline
                    rows={5}
                    inputClassName={adminWhiteInputClassName}
                  />
                </div>
              </EditorSection>

              <EditorSection eyebrow={t("features")} description={t("featuresHint")}>
                <FeaturesEditor
                  features={(draft.featuresJson as ServiceFeature[]) ?? []}
                  onChange={(featuresJson) => setDraft({ ...draft, featuresJson })}
                  inputClassName={adminWhiteInputClassName}
                />
              </EditorSection>
            </div>
          </div>
        )}

        <SheetFooter className="shrink-0 border-t border-border/60 bg-white px-5 py-4 sm:flex-row sm:justify-end gap-2 dark:bg-white">
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t("cancel")}
          </Button>
          <Button type="button" onClick={() => void save()} disabled={saving || loading}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {tRoot("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
