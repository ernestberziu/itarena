"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email(),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const [sent, setSent] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: Values) {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, locale }),
    });
    if (!res.ok) {
      toast.error(t("errors.generic"));
      return;
    }
    setSent(true);
    toast.success(t("reset_email_sent"));
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{t("reset_email_sent")}</p>
        <Button variant="outline" asChild>
          <Link href={`${lp}/hyr`}>{t("back_to_login")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("send_reset_link")}
      </Button>
      <p className="text-center text-sm">
        <Link href={`${lp}/hyr`} className="text-primary hover:underline">
          {t("back_to_login")}
        </Link>
      </p>
    </form>
  );
}
