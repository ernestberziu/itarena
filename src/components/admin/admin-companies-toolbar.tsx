"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminCompaniesToolbar({
  locale,
  lp,
  q,
}: {
  locale: string;
  lp: string;
  q?: string;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const qTrim = q?.trim();
  const filtersActive = Boolean(qTrim);

  return (
    <form method="GET" action={`${lp}/admin/companies`} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border/60 bg-muted/20 p-1 shadow-inner dark:bg-muted/15">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={2}
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={q}
            placeholder={t("Kërko emër, NIPT, qytet…", "Search name, VAT, city…")}
            className="h-10 border-0 bg-transparent pl-10 pr-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
            autoComplete="off"
          />
        </div>
      </div>
      <Button type="submit" className="h-10 shrink-0 gap-2 rounded-xl px-5 shadow-sm sm:w-auto w-full">
        <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
        {t("Kërko", "Search")}
      </Button>
      {filtersActive ? (
        <Link
          href={`${lp}/admin/companies`}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border/60 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
        >
          {t("Hiq kërkimin", "Clear search")}
        </Link>
      ) : null}
    </form>
  );
}
