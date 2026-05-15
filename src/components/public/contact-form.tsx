"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DIVISION_LABELS } from "@/lib/sla";
import { cn } from "@/lib/utils";

const CONTACT_SERVICE_NONE = "__contact_service_none__";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;
  const serviceValue = form.watch("service") ?? "";
  const serviceSelectValue =
    serviceValue.length > 0 ? serviceValue : CONTACT_SERVICE_NONE;
  const servicePlaceholder =
    locale === "sq" ? "Zgjidhni shërbimin e interesit" : "Select a service of interest";
  const serviceTriggerLabel =
    serviceSelectValue !== CONTACT_SERVICE_NONE
      ? DIVISION_LABELS[serviceSelectValue]?.[locale as "sq" | "en"] ?? serviceSelectValue
      : servicePlaceholder;

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim gjatë dërgimit" : "Error sending message");
      return;
    }

    setSubmitted(true);
    toast.success(t("success"));
  }

  const divisions = Object.entries(DIVISION_LABELS);

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">{t("success")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("name")} *</Label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{locale === "sq" ? "E detyrueshme" : "Required"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("email")} *</Label>
              <Input type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{locale === "sq" ? "Email i pavlefshëm" : "Invalid email"}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("phone")}</Label>
              <Input type="tel" placeholder="+355..." {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>{t("company")}</Label>
              <Input {...form.register("company")} />
            </div>
          </div>
          <div
            className={cn(
              "rounded-xl border border-border/60 p-4 shadow-sm",
              "bg-gradient-to-b from-muted/40 via-muted/15 to-transparent",
              "ring-1 ring-black/[0.03] dark:from-muted/25 dark:via-muted/10 dark:ring-white/[0.06]"
            )}
          >
            <div className="space-y-2.5">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/60">
                  <Building2 className="h-3.5 w-3.5" aria-hidden />
                </span>
                {t("service")}
              </Label>
              <Select
                value={serviceSelectValue}
                onValueChange={(v) => {
                  if (typeof v !== "string") return;
                  form.setValue("service", v === CONTACT_SERVICE_NONE ? "" : v, {
                    shouldDirty: true,
                  });
                }}
              >
                <SelectTrigger
                  size="default"
                  className="h-10 w-full min-w-0 border-border/80 bg-background/90 shadow-sm hover:bg-background dark:bg-background/50"
                >
                  <SelectValue placeholder={servicePlaceholder}>
                    {serviceTriggerLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  alignItemWithTrigger={false}
                  className={cn(
                    "min-w-[var(--anchor-width)] max-h-72",
                    "rounded-xl border border-border/60 p-1.5 shadow-lg",
                    "bg-[hsl(var(--popover))] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
                  )}
                >
                  <SelectItem
                    value={CONTACT_SERVICE_NONE}
                    className="rounded-lg py-2.5 pl-2.5 text-muted-foreground focus:text-foreground"
                  >
                    {servicePlaceholder}
                  </SelectItem>
                  <SelectSeparator className="my-1 bg-border/80" />
                  {divisions.map(([key, labels]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="rounded-lg py-2.5 pl-2.5 text-sm font-medium"
                    >
                      {labels[locale as "sq" | "en"]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("message")} *</Label>
            <Textarea rows={5} {...form.register("message")} />
            {form.formState.errors.message && (
              <p className="text-xs text-destructive">{locale === "sq" ? "E detyrueshme" : "Required"}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("send")} →
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {locale === "sq"
              ? "Nuk ndajmë të dhënat tuaja me palë të treta."
              : "We do not share your data with third parties."}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
