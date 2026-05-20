"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useSiteSettings } from "../site-settings-context";
import { SettingsGlassCard } from "../shared/settings-glass-card";
import { BilingualInput } from "../shared/bilingual-input";
import { ServiceEditorSheet } from "../service-editor-sheet";
import { SocialNetworkIcon, SOCIAL_NETWORK_LABELS } from "@/components/public/social-network-icon";
import { getLucideIcon } from "@/lib/site-content/icons";
import { cn } from "@/lib/utils";
import type { SiteSettingsSectionKey } from "@/lib/site-content/types";
import type { SiteSectionId } from "../site-settings-context";

export function SiteSettingsSectionForm({ section }: { section: SiteSectionId }) {
  if (section === "services") return <ServicesSection />;
  if (section === "testimonials") return <TestimonialsSection />;
  return <JsonSection section={section as SiteSettingsSectionKey} />;
}

function HeroSection() {
  const t = useTranslations("admin.siteSettingsPage.heroEditor");
  const { settings, updateSection } = useSiteSettings();
  const h = settings.hero;

  return (
    <div className="space-y-4">
      <SettingsGlassCard title={t("titleHeading")}>
        <p className="mb-4 text-xs text-muted-foreground">{t("titleHint")}</p>
        <div className="space-y-4">
          <BilingualInput
            label={t("titleLine1")}
            value={h.titleLine1}
            onChange={(titleLine1) => updateSection("hero", { ...h, titleLine1 })}
          />
          <BilingualInput
            label={t("titleLine2")}
            value={h.titleLine2}
            onChange={(titleLine2) => updateSection("hero", { ...h, titleLine2 })}
          />
          <BilingualInput
            label={t("titleHighlight")}
            value={h.titleHighlight}
            onChange={(titleHighlight) => updateSection("hero", { ...h, titleHighlight })}
          />
        </div>
      </SettingsGlassCard>

      <SettingsGlassCard title={t("subtitleHeading")}>
        <BilingualInput
          label={t("subtitle")}
          value={h.subtitle}
          onChange={(subtitle) => updateSection("hero", { ...h, subtitle })}
          multiline
        />
      </SettingsGlassCard>

      <SettingsGlassCard title={t("ctaHeading")}>
        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border/50 bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("ctaPrimary")}</p>
            <BilingualInput
              label={t("ctaText")}
              value={h.ctaPrimaryText}
              onChange={(ctaPrimaryText) => updateSection("hero", { ...h, ctaPrimaryText })}
            />
            <Field
              label={t("ctaLink")}
              value={h.ctaPrimaryLink}
              onChange={(ctaPrimaryLink) => updateSection("hero", { ...h, ctaPrimaryLink })}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border/50 bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("ctaShop")}</p>
            <BilingualInput
              label={t("ctaText")}
              value={h.ctaSecondaryText}
              onChange={(ctaSecondaryText) => updateSection("hero", { ...h, ctaSecondaryText })}
            />
            <Field
              label={t("ctaLink")}
              value={h.ctaSecondaryLink}
              onChange={(ctaSecondaryLink) => updateSection("hero", { ...h, ctaSecondaryLink })}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border/50 bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("ctaServices")}</p>
            <BilingualInput
              label={t("ctaText")}
              value={h.ctaTertiaryText}
              onChange={(ctaTertiaryText) => updateSection("hero", { ...h, ctaTertiaryText })}
            />
            <Field
              label={t("ctaLink")}
              hint={t("ctaServicesLinkHint")}
              value={h.ctaTertiaryLink}
              onChange={(ctaTertiaryLink) => updateSection("hero", { ...h, ctaTertiaryLink })}
            />
          </div>
        </div>
      </SettingsGlassCard>
    </div>
  );
}

function JsonSection({ section }: { section: SiteSettingsSectionKey }) {
  const { settings, updateSection } = useSiteSettings();

  if (section === "hero") {
    return <HeroSection />;
  }

  if (section === "contact") {
    const c = settings.contact;
    return (
      <SettingsGlassCard title="Contact">
        <ContactFormFields c={c} updateSection={updateSection} />
      </SettingsGlassCard>
    );
  }

  if (section === "social") {
    return <SocialSection />;
  }

  if (section === "footer") {
    const f = settings.footer;
    return (
      <SettingsGlassCard title="Footer">
        <div className="space-y-4">
          <BilingualInput label="Description" value={f.description} onChange={(description) => updateSection("footer", { ...f, description })} multiline />
          <BilingualInput label="Copyright" value={f.copyright} onChange={(copyright) => updateSection("footer", { ...f, copyright })} />
          <BilingualInput label="CTA text" value={f.ctaText} onChange={(ctaText) => updateSection("footer", { ...f, ctaText })} />
          <Field label="CTA link" value={f.ctaLink} onChange={(ctaLink) => updateSection("footer", { ...f, ctaLink })} />
        </div>
      </SettingsGlassCard>
    );
  }

  return null;
}

function SocialSection() {
  const t = useTranslations("admin.siteSettingsPage.socialEditor");
  const { settings, updateSection } = useSiteSettings();
  const s = settings.social;

  const updateLink = (index: number, patch: Partial<(typeof s.links)[number]>) => {
    const links = [...s.links];
    links[index] = { ...links[index], ...patch };
    updateSection("social", { links });
  };

  return (
    <SettingsGlassCard title={t("title")}>
      <p className="mb-4 text-xs text-muted-foreground">{t("hint")}</p>
      <div className="space-y-3">
        {s.links.map((link, i) => (
          <SocialNetworkToggle
            key={link.network}
            link={link}
            onEnabledChange={(enabled) => updateLink(i, { enabled })}
            onUrlChange={(url) => updateLink(i, { url })}
            urlLabel={t("url")}
          />
        ))}
      </div>
    </SettingsGlassCard>
  );
}

function SocialNetworkToggle({
  link,
  onEnabledChange,
  onUrlChange,
  urlLabel,
}: {
  link: { network: keyof typeof SOCIAL_NETWORK_LABELS; url: string; enabled: boolean };
  onEnabledChange: (enabled: boolean) => void;
  onUrlChange: (url: string) => void;
  urlLabel: string;
}) {
  const id = `social-${link.network}`;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-all duration-200",
        link.enabled
          ? "border-primary/35 bg-primary/[0.06] shadow-sm ring-1 ring-primary/15"
          : "border-border/60 bg-muted/10 hover:border-border hover:bg-muted/20"
      )}
    >
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 p-4">
        <Checkbox
          id={id}
          checked={link.enabled}
          onCheckedChange={(v) => onEnabledChange(v === true)}
          className="mt-0.5 size-5 rounded-md border-2 data-checked:border-primary data-checked:bg-primary"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                link.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <SocialNetworkIcon network={link.network} className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold leading-snug">{SOCIAL_NETWORK_LABELS[link.network]}</span>
          </div>
        </div>
      </label>
      {link.enabled ? (
        <div className="space-y-4 border-t border-border/50 bg-background/50 px-4 pb-4 pt-4">
          <Field label={urlLabel} value={link.url} onChange={onUrlChange} />
        </div>
      ) : null}
    </div>
  );
}

function ContactFormFields({
  c,
  updateSection,
}: {
  c: ReturnType<typeof useSiteSettings>["settings"]["contact"];
  updateSection: ReturnType<typeof useSiteSettings>["updateSection"];
}) {
  return (
    <div className="space-y-4">
      <Field label="Company" value={c.companyName} onChange={(companyName) => updateSection("contact", { ...c, companyName })} />
      <Field label="Email" value={c.email} onChange={(email) => updateSection("contact", { ...c, email })} />
      <Field label="Phone" value={c.phone} onChange={(phone) => updateSection("contact", { ...c, phone })} />
      <BilingualInput label="Address" value={c.address} onChange={(address) => updateSection("contact", { ...c, address })} multiline />
      <Field label="Maps URL" value={c.mapsUrl} onChange={(mapsUrl) => updateSection("contact", { ...c, mapsUrl })} />
      <BilingualInput label="Business hours" value={c.businessHours} onChange={(businessHours) => updateSection("contact", { ...c, businessHours })} multiline />
    </div>
  );
}

function Field({
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
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ServicesSection() {
  const t = useTranslations("admin.siteSettingsPage");
  const { services, setServices, reloadAll } = useSiteSettings();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const move = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= services.length) return;
    const items = [...services];
    [items[index], items[next]] = [items[next], items[index]];
    const withOrder = items.map((s, i) => ({ ...s, sortOrder: i }));
    setServices(withOrder);
    await fetch("/api/admin/site/services/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: withOrder.map((s) => ({ id: s.id, sortOrder: s.sortOrder })) }),
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete service?")) return;
    await fetch(`/api/admin/site/services/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    await reloadAll();
  };

  return (
    <>
      <SettingsGlassCard title={t("servicesTitle")}>
        <div className="mb-4 flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> {t("addService")}
          </Button>
        </div>
        <div className="space-y-2">
          {services.map((s, i) => {
            const Icon = getLucideIcon(s.iconKey);
            return (
              <div
                key={s.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/30 hover:shadow-sm",
                  !s.enabled && "opacity-55"
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                    s.colorClass ?? "bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.nameSq}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.nameEn}</p>
                  <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {s.slug}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <div className="hidden flex-col gap-0.5 sm:flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={i === 0}
                      onClick={() => void move(i, -1)}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={i === services.length - 1}
                      onClick={() => void move(i, 1)}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(s.id);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    {t("editService")}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => void remove(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SettingsGlassCard>
      <ServiceEditorSheet
        open={open}
        onOpenChange={setOpen}
        serviceId={editingId}
        onSaved={() => void reloadAll()}
      />
    </>
  );
}

function TestimonialsSection() {
  const t = useTranslations("admin.siteSettingsPage");
  const { testimonials, setTestimonials, reloadAll } = useSiteSettings();

  const move = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= testimonials.length) return;
    const items = [...testimonials];
    [items[index], items[next]] = [items[next], items[index]];
    const withOrder = items.map((x, i) => ({ ...x, sortOrder: i }));
    setTestimonials(withOrder);
    await fetch("/api/admin/site/testimonials/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: withOrder.map((x) => ({ id: x.id, sortOrder: x.sortOrder })) }),
    });
  };

  const saveOne = async (item: typeof testimonials[0]) => {
    const isNew = item.id.startsWith("default");
    if (isNew) {
      await fetch("/api/admin/site/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } else {
      await fetch(`/api/admin/site/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    toast.success("Saved");
    await reloadAll();
  };

  const addNew = () => {
    setTestimonials([
      ...testimonials,
      {
        id: `new-${Date.now()}`,
        sortOrder: testimonials.length,
        enabled: true,
        featured: false,
        clientName: "New Client",
        roleSq: "CEO",
        roleEn: "CEO",
        companySq: null,
        companyEn: null,
        reviewSq: "",
        reviewEn: "",
        rating: 5,
        imageUrl: null,
        avatarColor: "bg-primary",
        initials: "NC",
      },
    ]);
  };

  return (
    <SettingsGlassCard title={t("testimonialsTitle")}>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={addNew}><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </div>
      <div className="space-y-4">
        {testimonials.map((item, i) => (
          <div key={item.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => void move(i, -1)}><ChevronUp className="h-4 w-4" /></Button>
              <Button type="button" variant="outline" size="icon" onClick={() => void move(i, 1)}><ChevronDown className="h-4 w-4" /></Button>
            </div>
            <Field label="Name" value={item.clientName} onChange={(clientName) => {
              const next = [...testimonials];
              next[i] = { ...item, clientName };
              setTestimonials(next);
            }} />
            <Textarea value={item.reviewSq} onChange={(e) => {
              const next = [...testimonials];
              next[i] = { ...item, reviewSq: e.target.value };
              setTestimonials(next);
            }} placeholder="Review SQ" rows={2} />
            <Textarea value={item.reviewEn} onChange={(e) => {
              const next = [...testimonials];
              next[i] = { ...item, reviewEn: e.target.value };
              setTestimonials(next);
            }} placeholder="Review EN" rows={2} />
            <Button size="sm" onClick={() => void saveOne(item)}>{t("save")}</Button>
          </div>
        ))}
      </div>
    </SettingsGlassCard>
  );
}
