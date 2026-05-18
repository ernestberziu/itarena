"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, getSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof loginSchema>;

function safeInternalPath(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  // Block protocol-relative / open redirects
  if (raw.includes("://")) return fallback;
  return raw;
}

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const lp = locale === "sq" ? "" : `/${locale}`;

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginValues) {
    const callbackParam = searchParams.get("callbackUrl");

    const result = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
      ...(callbackParam ? { callbackUrl: callbackParam } : {}),
    });

    if (!result?.ok || result.error) {
      toast.error(t("errors.invalid_credentials"));
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;
    const adminRoles = ["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"];
    const roleDefault =
      role && adminRoles.includes(role) ? `${lp}/admin/dashboard` : `${lp}/portal/dashboard`;

    const dest = safeInternalPath(callbackParam, roleDefault);
    window.location.assign(dest);
  }

  return (
    <div className="admin-main-enter admin-card-elevated space-y-6 rounded-2xl p-6">
      {/* heading */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {locale === "sq" ? "Mirësevini" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "sq"
            ? "Hyni në llogarinë tuaj IT Arena"
            : "Sign in to your IT Arena account"}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold">
            {t("email")}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="email@kompania.al"
            className="h-11"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{t("errors.required")}</p>
          )}
        </div>

        {/* password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold">
              {t("password")}
            </Label>
            <Link
              href={`${lp}/reset-password`}
              className="text-xs text-primary hover:underline"
            >
              {t("forgot_password")}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-11 pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 text-sm" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("login")}
        </Button>
      </form>

      {/* divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-muted-foreground">
            {locale === "sq" ? "Nuk keni llogari?" : "Don't have an account?"}
          </span>
        </div>
      </div>

      <Link
        href={`${lp}/regjistrohu`}
        className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-border text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        {locale === "sq" ? "Krijo llogari falas" : "Create a free account"}
      </Link>
    </div>
  );
}
