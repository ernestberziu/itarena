"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, ChevronRight, ExternalLink, ShoppingBag, Ticket } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  AdminStatCard,
  UserAvatar,
  UserStatusBadges,
  type UserStatusBadgeInput,
} from "@/components/admin/users";
import type { AdminClientRow } from "@/types/admin-client";

export function AdminClientPreviewSheet({
  user,
  open,
  onOpenChange,
  locale,
  lp,
}: {
  user: AdminClientRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  lp: string;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const reduceMotion = useReducedMotion();

  if (!user) return null;

  const badgeInput: UserStatusBadgeInput = {
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    company: user.company,
  };

  const detail = `${lp}/admin/clients/${user.id}`;
  const tickets = `${lp}/admin/tickets?requester=${encodeURIComponent(user.id)}`;
  const orders = `${lp}/admin/orders?userId=${encodeURIComponent(user.id)}`;

  const motionProps = reduceMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden bg-white p-0 text-foreground sm:max-w-md dark:bg-card dark:text-card-foreground"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-border bg-white px-4 pb-4 pt-4 text-left sm:pr-14 dark:bg-card">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("Klientët", "Clients")}
          </p>
          <SheetTitle className="text-left text-lg font-semibold tracking-tight">
            {t("Parapamje", "Preview")}
          </SheetTitle>
          <SheetDescription className="text-left text-xs leading-relaxed">
            {t("Pamje e shpejtë vetëm për lexim.", "Read-only snapshot from the directory.")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white dark:bg-card">
          <AnimatePresence initial={false} mode="wait">
            {open && (
              <motion.div
                key={user.id}
                {...motionProps}
                className="flex flex-col gap-4 p-4"
              >
                <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm ring-1 ring-black/[0.04] dark:bg-muted dark:ring-white/[0.06]">
                  <div className="flex items-start gap-4">
                    <UserAvatar firstName={user.firstName} lastName={user.lastName} size="lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <h2 className="text-xl font-bold tracking-tight">
                        {user.firstName} {user.lastName}
                      </h2>
                      <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                      <UserStatusBadges user={badgeInput} locale={locale} />
                    </div>
                  </div>
                  <Separator className="my-4 bg-border/70" />
                  <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div className="flex flex-col gap-0.5 rounded-lg bg-neutral-50 px-2.5 py-2 ring-1 ring-inset ring-border/50 dark:bg-card">
                      <dt className="font-medium uppercase tracking-wide text-[10px] text-muted-foreground">
                        {t("Roli", "Role")}
                      </dt>
                      <dd className="text-foreground">
                        {user.role === "COMPANY_ADMIN" ? t("B2B Admin", "B2B Admin") : t("Klient", "Client")}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-lg bg-neutral-50 px-2.5 py-2 ring-1 ring-inset ring-border/50 dark:bg-card">
                      <dt className="font-medium uppercase tracking-wide text-[10px] text-muted-foreground">
                        {t("Regjistruar", "Registered")}
                      </dt>
                      <dd className="tabular-nums text-foreground">
                        {formatDate(new Date(user.createdAt))}
                      </dd>
                    </div>
                  </dl>
                </div>

                {user.company ? (
                  <section
                    aria-labelledby="preview-company-heading"
                    className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] dark:bg-card dark:ring-white/[0.05]"
                  >
                    <h3
                      id="preview-company-heading"
                      className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-muted-foreground shadow-inner dark:bg-muted">
                        <Building2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      {t("Kompania", "Company")}
                    </h3>
                    <dl className="space-y-2.5 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">{t("Emri", "Name")}</dt>
                        <dd className="font-medium leading-snug">{user.company.name}</dd>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div>
                          <dt className="text-xs text-muted-foreground">{t("Niveli", "Tier")}</dt>
                          <dd className="tabular-nums">{user.company.tier ?? "—"}</dd>
                        </div>
                        <Badge
                          variant={user.company.isApproved ? "default" : "secondary"}
                          className="ml-auto text-[11px] font-medium"
                        >
                          {user.company.isApproved
                            ? t("E miratuar", "Approved")
                            : t("Në pritje", "Pending")}
                        </Badge>
                      </div>
                    </dl>
                  </section>
                ) : null}

                <section aria-labelledby="preview-activity-heading" className="space-y-2">
                  <h3
                    id="preview-activity-heading"
                    className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {t("Aktiviteti", "Activity")}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AdminStatCard
                      label={t("Biletat", "Tickets")}
                      value={user._count.tickets}
                      icon={Ticket}
                      className="p-3.5 [&_.admin-stat-value]:text-base"
                    />
                    <AdminStatCard
                      label={t("Porositë", "Orders")}
                      value={user._count.orders}
                      icon={ShoppingBag}
                      className="p-3.5 [&_.admin-stat-value]:text-base"
                    />
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-white p-4 dark:bg-card">
          <Button variant="default" className="w-full justify-between gap-2 font-medium" asChild>
            <Link href={detail} onClick={() => onOpenChange(false)} className="no-underline">
              <span className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                {t("Hap faqen e plotë", "Open full page")}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </Link>
          </Button>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button variant="secondary" className="w-full font-normal" asChild>
              <Link href={tickets} onClick={() => onOpenChange(false)} className="gap-1.5">
                <Ticket className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">{t("Biletat", "Tickets")}</span>
              </Link>
            </Button>
            <Button variant="secondary" className="w-full font-normal" asChild>
              <Link href={orders} onClick={() => onOpenChange(false)} className="gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">{t("Porositë", "Orders")}</span>
              </Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
