"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Building2, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const baseSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  confirmPassword: z.string(),
});

const individualSchema = baseSchema.refine(
  (d) => d.password === d.confirmPassword,
  { message: "Fjalëkalimet nuk përputhen", path: ["confirmPassword"] }
);

const businessSchema = baseSchema
  .extend({
    companyName: z.string().min(2),
    vatNumber: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Fjalëkalimet nuk përputhen",
    path: ["confirmPassword"],
  });

type IndividualValues = z.infer<typeof individualSchema>;
type BusinessValues = z.infer<typeof businessSchema>;

function PasswordInput({
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} className="h-11 pr-10" {...props} />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShow((s) => !s)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function IndividualTab() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const lp = locale === "sq" ? "" : `/${locale}`;

  const form = useForm<IndividualValues>({
    resolver: zodResolver(individualSchema),
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: IndividualValues) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, type: "individual" }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Gabim gjatë regjistrimit");
      return;
    }

    toast.success("Llogaria u krijua! Kontrolloni emailin tuaj.");
    router.push(`${lp}/hyr`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("first_name")}</Label>
          <Input className="h-11" {...form.register("firstName")} />
          {form.formState.errors.firstName && (
            <p className="text-xs text-destructive">{t("errors.required")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("last_name")}</Label>
          <Input className="h-11" {...form.register("lastName")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">{t("email")}</Label>
        <Input className="h-11" type="email" placeholder="email@kompania.al" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{t("errors.required")}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">{t("phone")}</Label>
        <Input className="h-11" type="tel" placeholder="+355 6X XXX XXXX" {...form.register("phone")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("password")}</Label>
          <PasswordInput id="ind-password" {...form.register("password")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            {locale === "sq" ? "Konfirmo" : "Confirm"}
          </Label>
          <PasswordInput id="ind-confirm" {...form.register("confirmPassword")} />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("register_individual")}
      </Button>
    </form>
  );
}

function BusinessTab() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const lp = locale === "sq" ? "" : `/${locale}`;

  const form = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: BusinessValues) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, type: "business" }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Gabim gjatë regjistrimit");
      return;
    }

    toast.success(
      locale === "sq"
        ? "Kërkesa u dërgua! Do t'ju kontaktojmë për miratim."
        : "Request sent! We will contact you for approval."
    );
    router.push(`${lp}/hyr`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t("b2b_note")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("company_name")}</Label>
          <Input className="h-11" {...form.register("companyName")} />
          {form.formState.errors.companyName && (
            <p className="text-xs text-destructive">{t("errors.required")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("vat_number")}</Label>
          <Input className="h-11" placeholder="NIPT..." {...form.register("vatNumber")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("first_name")}</Label>
          <Input className="h-11" {...form.register("firstName")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("last_name")}</Label>
          <Input className="h-11" {...form.register("lastName")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("email")}</Label>
          <Input className="h-11" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("phone")}</Label>
          <Input className="h-11" type="tel" placeholder="+355 6X XXX XXXX" {...form.register("phone")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("password")}</Label>
          <PasswordInput id="biz-password" {...form.register("password")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            {locale === "sq" ? "Konfirmo" : "Confirm"}
          </Label>
          <PasswordInput id="biz-confirm" {...form.register("confirmPassword")} />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("register_business")}
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const [tab, setTab] = useState<"individual" | "business">("individual");

  return (
    <div className="space-y-6">
      {/* custom tab switcher */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-slate-100 p-1">
        {(["individual", "business"] as const).map((value) => {
          const Icon = value === "individual" ? User : Building2;
          const label = value === "individual" ? t("individual") : t("business");
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150",
                tab === value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          );
        })}
      </div>

      {/* form content */}
      {tab === "individual" ? <IndividualTab /> : <BusinessTab />}

      {/* divider + login link */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-muted-foreground">
            {locale === "sq" ? "Keni llogari?" : "Already have an account?"}
          </span>
        </div>
      </div>
      <Link
        href={`${lp}/hyr`}
        className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-border text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        {locale === "sq" ? "Hyni në llogari" : "Sign in to account"}
      </Link>
    </div>
  );
}
