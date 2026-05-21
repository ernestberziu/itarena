"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8),
    confirm: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm, { message: "mismatch", path: ["confirm"] });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  if (!token) {
    return (
      <p className="text-sm text-destructive text-center">
        {t("reset_invalid_token")}
        <br />
        <Link href={`${lp}/forgot-password`} className="text-primary hover:underline">
          {t("forgot_password")}
        </Link>
      </p>
    );
  }

  async function onSubmit(values: Values) {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(json.error ?? t("errors.generic"));
      return;
    }
    setDone(true);
    toast.success(t("reset_success"));
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{t("reset_success")}</p>
        <Button asChild>
          <Link href={`${lp}/hyr`}>{t("back_to_login")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">{t("new_password")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="pr-10"
            {...form.register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">{t("confirm_password")}</Label>
        <Input id="confirm" type="password" autoComplete="new-password" {...form.register("confirm")} />
        {form.formState.errors.confirm && (
          <p className="text-xs text-destructive">{t("password_mismatch")}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("reset_password")}
      </Button>
    </form>
  );
}
