"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTicketsFilterDeck } from "@/components/admin/admin-tickets-filter-deck";
import {
  SegmentedFilterTrack,
  SegmentedFilterLink,
} from "@/components/admin/admin-filter-segments";

function buildClientsHref(
  lp: string,
  base: {
    q?: string;
    tier?: string;
    approved?: string;
    active?: string;
    affiliation?: string;
    portalAccess?: string;
  },
  patch: Partial<
    Record<"q" | "tier" | "approved" | "active" | "affiliation" | "portalAccess", string | null | undefined>
  >
) {
  const p = new URLSearchParams();
  const merged = { ...base, ...patch };
  if (merged.q?.trim()) p.set("q", merged.q.trim());
  if (merged.tier?.trim()) p.set("tier", merged.tier.trim());
  if (merged.approved === "true" || merged.approved === "false") p.set("approved", merged.approved);
  if (merged.active && merged.active !== "all") p.set("active", merged.active);
  if (merged.affiliation && merged.affiliation !== "all") p.set("affiliation", merged.affiliation);
  if (merged.portalAccess && merged.portalAccess !== "all") p.set("portalAccess", merged.portalAccess);
  const qs = p.toString();
  return qs ? `${lp}/admin/clients?${qs}` : `${lp}/admin/clients`;
}

export function AdminUsersToolbar({
  locale,
  lp,
  q,
  tier,
  approved,
  active,
  affiliation,
  portalAccess,
}: {
  locale: string;
  lp: string;
  q?: string;
  tier?: string;
  approved?: string;
  active?: string;
  affiliation?: string;
  portalAccess?: string;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const activeNorm = active || "all";
  const affiliationNorm = affiliation || "all";
  const portalAccessNorm = portalAccess || "all";
  const qTrim = q?.trim();
  const base = { q, tier, approved, active: activeNorm, affiliation: affiliationNorm, portalAccess: portalAccessNorm };

  const filtersActive = Boolean(
    qTrim ||
      tier ||
      approved ||
      (activeNorm && activeNorm !== "all") ||
      (affiliationNorm && affiliationNorm !== "all") ||
      (portalAccessNorm && portalAccessNorm !== "all")
  );
  const defaultOpen = filtersActive;

  const tierSummary =
    tier === "RETAIL"
      ? t("Retail", "Retail")
      : tier === "B2B"
        ? "B2B"
        : null;
  const approvedSummary =
    approved === "true"
      ? t("Të miratuar", "Approved")
      : approved === "false"
        ? t("Në pritje", "Pending")
        : null;
  const accountSummary =
    activeNorm === "active"
      ? t("Aktive", "Active")
      : activeNorm === "suspended"
        ? t("Të pezulluara", "Suspended")
        : null;
  const affiliationSummary =
    affiliationNorm === "linked"
      ? t("Me kompani", "With company")
      : affiliationNorm === "individual"
        ? t("Individual", "Individual")
        : null;
  const portalAccessSummary =
    portalAccessNorm === "invited"
      ? t("Të ftuar", "Invited")
      : portalAccessNorm === "pending"
        ? t("Pa ftesë", "Pending invite")
        : null;

  const summaryParts = [tierSummary, approvedSummary, accountSummary, affiliationSummary, portalAccessSummary].filter(Boolean);
  const searchHint =
    qTrim &&
    (en
      ? `Search: “${qTrim.length > 80 ? `${qTrim.slice(0, 80)}…` : qTrim}”`
      : `Kërkim: «${qTrim.length > 80 ? `${qTrim.slice(0, 80)}…` : qTrim}»`);
  const filterHintLine =
    summaryParts.length > 0
      ? `${en ? "Applied" : "Aplikuar"}: ${summaryParts.join(" · ")}`
      : null;
  const deckHint = [searchHint, filterHintLine].filter(Boolean).join(" — ") ||
    t(
      "Niveli, miratimi dhe llogaria përditësojnë URL-në (GET).",
      "Tier, approval, and account update the URL (GET)."
    );

  const clearAll =
    filtersActive ? (
      <Link
        href={`${lp}/admin/clients`}
        className="inline-flex rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:border-border/60 hover:bg-background/80 hover:text-foreground hover:underline"
      >
        {t("Hiq filtrat", "Clear filters")}
      </Link>
    ) : null;

  return (
    <div className="space-y-4">
      <form method="GET" action={`${lp}/admin/clients`} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
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
              placeholder={t("Kërko klient, email…", "Search client, email…")}
              className="h-10 border-0 bg-transparent pl-10 pr-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
              autoComplete="off"
            />
          </div>
        </div>
        {tier && <input type="hidden" name="tier" value={tier} />}
        {approved && <input type="hidden" name="approved" value={approved} />}
        {activeNorm !== "all" ? <input type="hidden" name="active" value={activeNorm} /> : null}
        {affiliationNorm !== "all" ? <input type="hidden" name="affiliation" value={affiliationNorm} /> : null}
        {portalAccessNorm !== "all" ? <input type="hidden" name="portalAccess" value={portalAccessNorm} /> : null}
        <Button type="submit" className="h-10 shrink-0 gap-2 rounded-xl px-5 shadow-sm sm:w-auto w-full">
          <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t("Kërko", "Search")}
        </Button>
      </form>

      <AdminTicketsFilterDeck
        defaultOpen={defaultOpen}
        title={t("Filtro klientët", "Filter clients")}
        hint={deckHint}
        clearAll={clearAll}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-tight text-foreground">
              {t("Niveli", "Tier")}
            </span>
            <SegmentedFilterTrack>
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { tier: null })}
                label={t("Të gjitha", "All")}
                selected={!tier}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { tier: "RETAIL" })}
                label="Retail"
                selected={tier === "RETAIL"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { tier: "B2B" })}
                label="B2B"
                selected={tier === "B2B"}
              />
            </SegmentedFilterTrack>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-tight text-foreground">
              {t("Miratimi", "Approval")}
            </span>
            <SegmentedFilterTrack>
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { approved: null })}
                label={t("Të gjitha", "All")}
                selected={!approved}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { approved: "true" })}
                label={t("Të miratuar", "Approved")}
                selected={approved === "true"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { approved: "false" })}
                label={t("Në pritje", "Pending")}
                selected={approved === "false"}
              />
            </SegmentedFilterTrack>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-tight text-foreground">
              {t("Llogaria", "Account")}
            </span>
            <SegmentedFilterTrack>
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { active: "all" })}
                label={t("Të gjitha", "All")}
                selected={activeNorm === "all"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { active: "active" })}
                label={t("Aktive", "Active")}
                selected={activeNorm === "active"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { active: "suspended" })}
                label={t("Të pezulluara", "Suspended")}
                selected={activeNorm === "suspended"}
              />
            </SegmentedFilterTrack>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-tight text-foreground">
              {t("Lidhja me kompani", "Company link")}
            </span>
            <SegmentedFilterTrack>
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { affiliation: "all" })}
                label={t("Të gjitha", "All")}
                selected={affiliationNorm === "all"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { affiliation: "linked" })}
                label={t("Me kompani", "With company")}
                selected={affiliationNorm === "linked"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { affiliation: "individual" })}
                label={t("Individual", "Individual")}
                selected={affiliationNorm === "individual"}
              />
            </SegmentedFilterTrack>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-tight text-foreground">
              {t("Aksesi në portal", "Portal access")}
            </span>
            <SegmentedFilterTrack>
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { portalAccess: "all" })}
                label={t("Të gjitha", "All")}
                selected={portalAccessNorm === "all"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { portalAccess: "invited" })}
                label={t("Të ftuar", "Invited")}
                selected={portalAccessNorm === "invited"}
              />
              <SegmentedFilterLink
                href={buildClientsHref(lp, base, { portalAccess: "pending" })}
                label={t("Pa ftesë", "Pending invite")}
                selected={portalAccessNorm === "pending"}
              />
            </SegmentedFilterTrack>
          </div>
        </div>
      </AdminTicketsFilterDeck>
    </div>
  );
}
