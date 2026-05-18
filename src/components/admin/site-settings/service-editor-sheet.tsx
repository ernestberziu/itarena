"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPicker } from "./shared/icon-picker";
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
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function FeaturesEditor({
  features,
  onChange,
}: {
  features: ServiceFeature[];
  onChange: (f: ServiceFeature[]) => void;
}) {
  const t = useTranslations("admin.siteSettingsPage.serviceEditor");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{t("features")}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...features, { sq: "", en: "" }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {t("addFeature")}
        </Button>
      </div>
      {features.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          {t("noFeatures")}
        </p>
      ) : (
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="rounded-lg border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  #{i + 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onChange(features.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <Input
                placeholder="Shqip"
                value={f.sq}
                onChange={(e) => {
                  const next = [...features];
                  next[i] = { ...f, sq: e.target.value };
                  onChange(next);
                }}
              />
              <Input
                placeholder="English"
                value={f.en}
                onChange={(e) => {
                  const next = [...features];
                  next[i] = { ...f, en: e.target.value };
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
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
  const [draft, setDraft] = useState<Partial<MarketingServiceRecord>>(emptyDraft);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(serviceId);

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
      const url = isEdit
        ? `/api/admin/site/services/${serviceId}`
        : "/api/admin/site/services";
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

  const Icon = getLucideIcon(draft.iconKey ?? "Monitor");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 border-l p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                draft.colorClass || "bg-muted"
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg">
                {isEdit ? tRoot("editService") : tRoot("addService")}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {isEdit && draft.slug ? (
                  <span className="font-mono text-xs">/sherbime/{draft.slug}</span>
                ) : (
                  t("addDescription")
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-5 grid w-full grid-cols-3 h-10">
                <TabsTrigger value="basic">{t("tabBasic")}</TabsTrigger>
                <TabsTrigger value="display">{t("tabDisplay")}</TabsTrigger>
                <TabsTrigger value="seo">{t("tabSeo")}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-0 space-y-5">
                {!isEdit && (
                  <FormField
                    label={t("slug")}
                    hint={t("slugHint")}
                    value={draft.slug ?? ""}
                    onChange={(slug) => setDraft({ ...draft, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  />
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label={t("nameSq")}
                    value={draft.nameSq ?? ""}
                    onChange={(nameSq) => setDraft({ ...draft, nameSq })}
                  />
                  <FormField
                    label={t("nameEn")}
                    value={draft.nameEn ?? ""}
                    onChange={(nameEn) => setDraft({ ...draft, nameEn })}
                  />
                </div>
                <IconPicker
                  label={t("icon")}
                  value={draft.iconKey ?? "Monitor"}
                  onChange={(iconKey) => setDraft({ ...draft, iconKey })}
                />
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">{t("shortDescSq")}</Label>
                  <Textarea
                    rows={3}
                    value={draft.shortDescSq ?? ""}
                    onChange={(e) => setDraft({ ...draft, shortDescSq: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">{t("shortDescEn")}</Label>
                  <Textarea
                    rows={3}
                    value={draft.shortDescEn ?? ""}
                    onChange={(e) => setDraft({ ...draft, shortDescEn: e.target.value })}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">{t("fullDescSq")}</Label>
                  <Textarea
                    rows={5}
                    value={draft.fullDescSq ?? ""}
                    onChange={(e) => setDraft({ ...draft, fullDescSq: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">{t("fullDescEn")}</Label>
                  <Textarea
                    rows={5}
                    value={draft.fullDescEn ?? ""}
                    onChange={(e) => setDraft({ ...draft, fullDescEn: e.target.value })}
                  />
                </div>
                <FeaturesEditor
                  features={(draft.featuresJson as ServiceFeature[]) ?? []}
                  onChange={(featuresJson) => setDraft({ ...draft, featuresJson })}
                />
              </TabsContent>

              <TabsContent value="display" className="mt-0 space-y-5">
                <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                  <ToggleRow
                    label={t("enabled")}
                    checked={draft.enabled ?? true}
                    onCheckedChange={(enabled) => setDraft({ ...draft, enabled })}
                  />
                  <ToggleRow
                    label={t("featured")}
                    checked={draft.featured ?? false}
                    onCheckedChange={(featured) => setDraft({ ...draft, featured })}
                  />
                  <ToggleRow
                    label={t("showOnHomepage")}
                    checked={draft.showOnHomepage ?? true}
                    onCheckedChange={(showOnHomepage) => setDraft({ ...draft, showOnHomepage })}
                  />
                </div>
                <FormField
                  label={t("colorClass")}
                  hint={t("colorClassHint")}
                  value={draft.colorClass ?? ""}
                  onChange={(colorClass) => setDraft({ ...draft, colorClass })}
                />
                <FormField
                  label={t("accentClass")}
                  value={draft.accentClass ?? ""}
                  onChange={(accentClass) => setDraft({ ...draft, accentClass })}
                />
                <FormField
                  label={t("gradientClass")}
                  value={draft.gradientClass ?? ""}
                  onChange={(gradientClass) => setDraft({ ...draft, gradientClass })}
                />
                <Separator />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("cta")}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label={t("ctaTextSq")}
                    value={draft.ctaTextSq ?? ""}
                    onChange={(ctaTextSq) => setDraft({ ...draft, ctaTextSq })}
                  />
                  <FormField
                    label={t("ctaTextEn")}
                    value={draft.ctaTextEn ?? ""}
                    onChange={(ctaTextEn) => setDraft({ ...draft, ctaTextEn })}
                  />
                </div>
                <FormField
                  label={t("ctaLink")}
                  value={draft.ctaLink ?? ""}
                  onChange={(ctaLink) => setDraft({ ...draft, ctaLink })}
                />
              </TabsContent>

              <TabsContent value="seo" className="mt-0 space-y-4">
                <FormField
                  label={t("metaTitleSq")}
                  value={draft.metaTitleSq ?? ""}
                  onChange={(metaTitleSq) => setDraft({ ...draft, metaTitleSq })}
                />
                <FormField
                  label={t("metaTitleEn")}
                  value={draft.metaTitleEn ?? ""}
                  onChange={(metaTitleEn) => setDraft({ ...draft, metaTitleEn })}
                />
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">{t("metaDescSq")}</Label>
                  <Textarea
                    rows={3}
                    value={draft.metaDescSq ?? ""}
                    onChange={(e) => setDraft({ ...draft, metaDescSq: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">{t("metaDescEn")}</Label>
                  <Textarea
                    rows={3}
                    value={draft.metaDescEn ?? ""}
                    onChange={(e) => setDraft({ ...draft, metaDescEn: e.target.value })}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <SheetFooter className="border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
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

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm font-medium">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
