"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Building2, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    showCompany: z.boolean().optional(),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Fjalëkalimet nuk përputhen",
    path: ["confirmPassword"],
  })
  .refine(
    (d) => {
      if (!d.showCompany) return true;
      return Boolean(d.companyName?.trim());
    },
    { message: "Emri i kompanisë është i detyrueshëm", path: ["companyName"] }
  );

type RegisterValues = z.infer<typeof registerSchema>;

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
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setShow((s) => !s)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { showCompany: false, country: "Albania" },
  });

  const { isSubmitting } = form.formState;
  const showCompany = form.watch("showCompany");

  async function onSubmit(values: RegisterValues) {
    const payload: Record<string, unknown> = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    };

    if (values.showCompany && values.companyName?.trim()) {
      payload.company = {
        name: values.companyName.trim(),
        vatNumber: values.vatNumber?.trim() || undefined,
        address: values.address?.trim() || undefined,
        city: values.city?.trim() || undefined,
        country: values.country?.trim() || undefined,
      };
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || (en ? "Registration failed" : "Gabim gjatë regjistrimit"));
      return;
    }

    const data = (await res.json()) as { companyDetailsSaved?: boolean };
    if (data.companyDetailsSaved) {
      toast.success(
        en
          ? "Account created! Your company details were saved — our team will review them."
          : "Llogaria u krijua! Detajet e kompanisë u ruajtën — ekipi ynë do t'i shqyrtojë."
      );
    } else {
      toast.success(en ? "Account created! You can sign in now." : "Llogaria u krijua! Mund të hyni tani.");
    }
    router.push(`${lp}/hyr`);
  }

  return (
    <div className="space-y-6">
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
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("phone")}</Label>
          <Input className="h-11" type="tel" placeholder="+355 6X XXX XXXX" {...form.register("phone")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{t("password")}</Label>
            <PasswordInput id="reg-password" {...form.register("password")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{en ? "Confirm" : "Konfirmo"}</Label>
            <PasswordInput id="reg-confirm" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-slate-50/80">
          <button
            type="button"
            onClick={() => form.setValue("showCompany", !showCompany)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground"
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {en ? "Add company details (optional)" : "Shto detajet e kompanisë (opsionale)"}
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showCompany && "rotate-180")} />
          </button>

          {showCompany && (
            <div className="space-y-3 border-t border-border/60 px-4 pb-4 pt-3">
              <p className="text-xs text-muted-foreground">
                {en
                  ? "Optional — for individuals or businesses. We will review before linking your account."
                  : "Opsionale — për individë ose biznese. Do t'i shqyrtojmë para lidhjes së llogarisë."}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5 sm:col-span-1">
                  <Label className="text-sm font-semibold">{t("company_name")}</Label>
                  <Input className="h-11" {...form.register("companyName")} />
                  {form.formState.errors.companyName && (
                    <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">{t("vat_number")}</Label>
                  <Input className="h-11" placeholder="NIPT..." {...form.register("vatNumber")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">{en ? "Address" : "Adresa"}</Label>
                <Input className="h-11" {...form.register("address")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">{en ? "City" : "Qyteti"}</Label>
                  <Input className="h-11" {...form.register("city")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">{en ? "Country" : "Shteti"}</Label>
                  <Input className="h-11" {...form.register("country")} />
                </div>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {en ? "Create account" : "Krijo llogarinë"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-muted-foreground">
            {en ? "Already have an account?" : "Keni llogari?"}
          </span>
        </div>
      </div>
      <Link
        href={`${lp}/hyr`}
        className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-border text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        {en ? "Sign in to account" : "Hyni në llogari"}
      </Link>
    </div>
  );
}
