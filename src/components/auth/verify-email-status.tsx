"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifyEmailStatus() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    void fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => setState(res.ok ? "ok" : "error"))
      .catch(() => setState("error"));
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "ok") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{t("verify_success")}</p>
        <Button asChild>
          <Link href={`${lp}/hyr`}>{t("back_to_login")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-destructive">{t("verify_failed")}</p>
      <Button variant="outline" asChild>
        <Link href={`${lp}/hyr`}>{t("back_to_login")}</Link>
      </Button>
    </div>
  );
}
