"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Cookie, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  COOKIE_SETTINGS_EVENT,
  readConsent,
  saveConsent,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
    setShowSettings(false);
  }, []);

  const apply = useCallback(
    (allowAnalytics: boolean) => {
      saveConsent(allowAnalytics);
      close();
    },
    [close]
  );

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setVisible(true);

    const openSettings = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setShowSettings(true);
      setVisible(true);
    };

    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xl shadow-slate-900/15",
          showSettings && "max-w-lg"
        )}
      >
        <div className="relative flex items-start gap-3 border-b border-border/60 bg-slate-50/80 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Cookie className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <h2 id="cookie-consent-title" className="font-extrabold text-foreground">
              {showSettings ? t("settingsTitle") : t("bannerTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {showSettings ? t("settingsDescription") : t("bannerDescription")}
            </p>
          </div>
          {showSettings && (
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-slate-200/80"
              aria-label={t("close")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showSettings ? (
          <div className="space-y-4 px-5 py-4">
            <div className="rounded-xl border border-border/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">{t("necessaryTitle")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("necessaryDescription")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                  {t("alwaysOn")}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">{t("analyticsTitle")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("analyticsDescription")}</p>
                </div>
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <span className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-primary transition-colors" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button className="rounded-xl flex-1" onClick={() => apply(analytics)}>
                {t("savePreferences")}
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => apply(false)}>
                {t("rejectNonEssential")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground mb-4">
              {t("learnMore")}{" "}
              <Link href={`${lp}/politika-cookies`} className="text-primary font-medium hover:underline">
                {t("cookiePolicyLink")}
              </Link>
              {" · "}
              <Link href={`${lp}/privatesia`} className="text-primary font-medium hover:underline">
                {t("privacyLink")}
              </Link>
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button className="rounded-xl sm:flex-1" onClick={() => apply(true)}>
                {t("acceptAll")}
              </Button>
              <Button variant="outline" className="rounded-xl sm:flex-1" onClick={() => apply(false)}>
                {t("rejectNonEssential")}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={() => {
                  const c = readConsent();
                  setAnalytics(c?.analytics ?? false);
                  setShowSettings(true);
                }}
              >
                <Settings2 className="h-4 w-4" />
                {t("customize")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ManageCookiePreferencesButton({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("cookieConsent");

  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
    >
      {t("managePreferences")}
    </button>
  );
}
