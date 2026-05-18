"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useSiteSettings } from "../site-settings-context";
import { SettingsGlassCard } from "../shared/settings-glass-card";
import { BilingualInput } from "../shared/bilingual-input";
import { ServiceEditorSheet } from "../service-editor-sheet";
import { getLucideIcon } from "@/lib/site-content/icons";
import { cn } from "@/lib/utils";
import type { SiteSettingsSectionKey } from "@/lib/site-content/types";
import type { SiteSectionId } from "../site-settings-context";

export function SiteSettingsSectionForm({ section }: { section: SiteSectionId }) {
  if (section === "services") return <ServicesSection />;
  if (section === "testimonials") return <TestimonialsSection />;
  return <JsonSection section={section as SiteSettingsSectionKey} />;
}

function JsonSection({ section }: { section: SiteSettingsSectionKey }) {
  const { settings, updateSection } = useSiteSettings();

  if (section === "hero") {
    const h = settings.hero;
    return (
      <div className="space-y-4">
        <SettingsGlassCard title="Hero copy">
          <div className="space-y-4">
            <BilingualInput label="Badge" value={h.badge} onChange={(badge) => updateSection("hero", { ...h, badge })} />
            <BilingualInput label="Title line 1" value={h.titleLine1} onChange={(titleLine1) => updateSection("hero", { ...h, titleLine1 })} />
            <BilingualInput label="Highlight" value={h.titleHighlight} onChange={(titleHighlight) => updateSection("hero", { ...h, titleHighlight })} />
            <BilingualInput label="Title line 2" value={h.titleLine2} onChange={(titleLine2) => updateSection("hero", { ...h, titleLine2 })} />
            <BilingualInput label="Subtitle" value={h.subtitle} onChange={(subtitle) => updateSection("hero", { ...h, subtitle })} multiline />
            <BilingualInput label="Primary CTA" value={h.ctaPrimaryText} onChange={(ctaPrimaryText) => updateSection("hero", { ...h, ctaPrimaryText })} />
            <Field label="Primary CTA link" value={h.ctaPrimaryLink} onChange={(ctaPrimaryLink) => updateSection("hero", { ...h, ctaPrimaryLink })} />
            <BilingualInput label="Secondary CTA" value={h.ctaSecondaryText} onChange={(ctaSecondaryText) => updateSection("hero", { ...h, ctaSecondaryText })} />
            <Field label="Secondary link" value={h.ctaSecondaryLink} onChange={(ctaSecondaryLink) => updateSection("hero", { ...h, ctaSecondaryLink })} />
            <BilingualInput label="Tertiary CTA" value={h.ctaTertiaryText} onChange={(ctaTertiaryText) => updateSection("hero", { ...h, ctaTertiaryText })} />
            <Field label="Tertiary link" value={h.ctaTertiaryLink} onChange={(ctaTertiaryLink) => updateSection("hero", { ...h, ctaTertiaryLink })} />
            <Field label="Gradient class" value={h.gradientClass} onChange={(gradientClass) => updateSection("hero", { ...h, gradientClass })} />
          </div>
        </SettingsGlassCard>
      </div>
    );
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
    const s = settings.social;
    return (
      <SettingsGlassCard title="Social">
        <div className="space-y-3">
          {s.links.map((link, i) => (
            <div key={link.network} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
              <span className="w-24 text-sm font-medium capitalize">{link.network}</span>
              <Input className="flex-1 min-w-[200px]" value={link.url} onChange={(e) => {
                const links = [...s.links];
                links[i] = { ...link, url: e.target.value };
                updateSection("social", { links });
              }} />
              <Switch checked={link.enabled} onCheckedChange={(enabled) => {
                const links = [...s.links];
                links[i] = { ...link, enabled };
                updateSection("social", { links });
              }} />
            </div>
          ))}
        </div>
      </SettingsGlassCard>
    );
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
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
