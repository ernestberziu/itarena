"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DIVISION_LABELS } from "@/lib/sla";

const schema = z.object({
  companyName: z.string().max(200).optional(),
  vatNumber: z.string().optional(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  title: z.string().min(5),
  description: z.string().min(20),
  services: z.array(z.string()).min(1, "Zgjidhni të paktën një shërbim"),
  timeline: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export type QuoteRequestPrefill = {
  companyName: string;
  vatNumber?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
};

export function QuoteRequestForm({
  locale,
  prefilled,
  locked = false,
}: {
  locale: string;
  prefilled?: QuoteRequestPrefill | null;
  locked?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const divisions = Object.entries(DIVISION_LABELS);
  const lang: "sq" | "en" = locale === "en" ? "en" : "sq";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: prefilled
      ? {
          companyName: prefilled.companyName,
          vatNumber: prefilled.vatNumber ?? "",
          contactName: prefilled.contactName,
          contactEmail: prefilled.contactEmail,
          contactPhone: prefilled.contactPhone ?? "",
          services: [],
        }
      : { companyName: "", services: [] },
  });

  const { isSubmitting, errors } = form.formState;
  const selectedServices = form.watch("services");

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim gjatë dërgimit" : "Error submitting");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">
            {locale === "sq" ? "Kërkesa u Dërgua!" : "Request Sent!"}
          </h2>
          <p className="text-muted-foreground">
            {locale === "sq"
              ? "Ekipi ynë do t'ju kontaktojë brenda 24 orëve me një ofertë të personalizuar."
              : "Our team will contact you within 24 hours with a customized quote."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 min-w-0">
          {/* Company info */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              {locale === "sq" ? "Informacioni i Kompanisë" : "Company Information"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {locale === "sq" ? "Emri i Kompanisë" : "Company Name"}
                  <span className="font-normal text-muted-foreground">
                    {locale === "sq" ? " (opsional)" : " (optional)"}
                  </span>
                </Label>
                <Input
                  placeholder={
                    locale === "sq"
                      ? "P.sh. TechBuild SH.A. (opsional)"
                      : "E.g. TechBuild LLC (optional)"
                  }
                  readOnly={locked}
                  disabled={locked}
                  className={locked ? "bg-muted/50" : undefined}
                  {...form.register("companyName")}
                />
                {errors.companyName && <p className="text-xs text-destructive">{locale === "sq" ? "E detyrueshme" : "Required"}</p>}
              </div>
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Numri NIPT" : "NIPT Number"}</Label>
                <Input
                  placeholder="NIPTXXXXXXXX"
                  readOnly={locked}
                  disabled={locked}
                  className={locked ? "bg-muted/50" : undefined}
                  {...form.register("vatNumber")}
                />
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              {locale === "sq" ? "Personi i Kontaktit" : "Contact Person"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Emri e Mbiemri" : "Full Name"} *</Label>
                <Input
                  placeholder={locale === "sq" ? "Emri i plotë i personit të kontaktit" : "Contact person full name"}
                  readOnly={locked}
                  disabled={locked}
                  className={locked ? "bg-muted/50" : undefined}
                  {...form.register("contactName")}
                />
                {errors.contactName && <p className="text-xs text-destructive">{locale === "sq" ? "E detyrueshme" : "Required"}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder={locale === "sq" ? "emri@kompania.al" : "name@company.com"}
                  readOnly={locked}
                  disabled={locked}
                  className={locked ? "bg-muted/50" : undefined}
                  {...form.register("contactEmail")}
                />
                {errors.contactEmail && <p className="text-xs text-destructive">{locale === "sq" ? "Email i pavlefshëm" : "Invalid email"}</p>}
              </div>
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Telefoni" : "Phone"}</Label>
                <Input
                  type="tel"
                  placeholder="+355..."
                  readOnly={locked}
                  disabled={locked}
                  className={locked ? "bg-muted/50" : undefined}
                  {...form.register("contactPhone")}
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              {locale === "sq" ? "Shërbimet e Nevojshme" : "Required Services"} *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {divisions.map(([key, labels]) => {
                const checked = selectedServices.includes(key);
                return (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border bg-background px-3 py-3 text-left shadow-sm transition-colors",
                      checked
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/80 hover:border-primary/35 hover:bg-muted/30"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(isChecked) => {
                        const on = isChecked === true;
                        const current = form.getValues("services");
                        if (on) {
                          form.setValue("services", [...current, key], { shouldValidate: true, shouldDirty: true });
                        } else {
                          form.setValue("services", current.filter((s) => s !== key), { shouldValidate: true, shouldDirty: true });
                        }
                      }}
                      className="mt-0.5 border-foreground/25 bg-white data-checked:border-primary data-checked:bg-primary"
                    />
                    <span className="text-sm font-medium leading-snug text-foreground">{labels[lang]}</span>
                  </label>
                );
              })}
            </div>
            {errors.services && (
              <p className="text-xs text-destructive mt-2">{errors.services.message}</p>
            )}
          </div>

          {/* Project details */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              {locale === "sq" ? "Detajet e Projektit" : "Project Details"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Titulli i Projektit" : "Project Title"} *</Label>
                <Input
                  placeholder={locale === "sq" ? "P.sh. Infrastrukturë IT për zyrën e re..." : "E.g. IT Infrastructure for new office..."}
                  {...form.register("title")}
                />
                {errors.title && <p className="text-xs text-destructive">{locale === "sq" ? "E detyrueshme" : "Required"}</p>}
              </div>
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Përshkrim i Detajuar" : "Detailed Description"} *</Label>
                <Textarea
                  rows={5}
                  placeholder={locale === "sq"
                    ? "Përshkruani kërkesat tuaja, madhësinë e biznesit, numrin e punonjësve..."
                    : "Describe your requirements, business size, number of employees..."}
                  {...form.register("description")}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Afati Preferuar" : "Preferred Timeline"}</Label>
                <Input
                  placeholder={locale === "sq" ? "P.sh. 1 muaj, sa më shpejt..." : "E.g. 1 month, ASAP..."}
                  {...form.register("timeline")}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {locale === "sq" ? "Dërgo Kërkesën" : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
