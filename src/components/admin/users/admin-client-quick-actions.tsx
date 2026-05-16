"use client";

import Link from "next/link";
import { Copy, Hash, Mail, Package, Ticket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function copyText(text: string, okSq: string, okEn: string, locale: string) {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(locale === "sq" ? okSq : okEn),
    () => toast.error(locale === "sq" ? "Kopjimi dështoi" : "Copy failed")
  );
}

const rowBase =
  "group flex w-full items-center gap-3 rounded-xl border border-border/50 bg-gradient-to-b from-card to-muted/10 px-3 py-2.5 text-left text-sm font-medium text-foreground shadow-sm ring-1 ring-black/[0.02] transition-[border-color,box-shadow,background-color,transform] duration-200 hover:border-border hover:bg-muted/25 hover:shadow-md motion-safe:hover:-translate-y-px dark:from-card dark:to-muted/5 dark:ring-white/[0.04] dark:hover:bg-muted/20";

const iconWrap =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground shadow-inner transition-colors duration-200 group-hover:border-primary/25 group-hover:bg-primary/10 group-hover:text-primary";

export function AdminClientQuickActions({
  locale,
  userId,
  email,
  ticketsHref,
  ordersHref,
}: {
  locale: string;
  userId: string;
  email: string;
  ticketsHref: string;
  ordersHref: string;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);

  return (
    <div className="flex flex-col gap-1.5">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
        {t("Shfleto", "Browse")}
      </p>
      <Link href={ticketsHref} className={cn(rowBase)}>
        <span className={iconWrap} aria-hidden>
          <Ticket className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-tight">{t("Biletat", "Tickets")}</span>
          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
            {t("Filtruar sipas këtij klienti", "Filtered to this client")}
          </span>
        </span>
      </Link>
      <Link href={ordersHref} className={cn(rowBase)}>
        <span className={iconWrap} aria-hidden>
          <Package className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-tight">{t("Porositë", "Orders")}</span>
          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
            {t("Porositë e këtij përdoruesi", "This user's orders")}
          </span>
        </span>
      </Link>

      <div
        className="my-2 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent"
        role="separator"
      />

      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
        {t("Kontakt", "Contact")}
      </p>
      <button
        type="button"
        className={cn(rowBase, "cursor-pointer")}
        onClick={() => copyText(email, "Emaili u kopjua", "Email copied", locale)}
      >
        <span className={iconWrap} aria-hidden>
          <Copy className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-tight">{t("Kopjo emailin", "Copy email")}</span>
          <span className="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground">{email}</span>
        </span>
      </button>
      <button
        type="button"
        className={cn(rowBase, "cursor-pointer")}
        onClick={() => copyText(userId, "ID u kopjua", "ID copied", locale)}
      >
        <span className={iconWrap} aria-hidden>
          <Hash className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-tight">{t("Kopjo ID", "Copy ID")}</span>
          <span className="mt-0.5 block truncate font-mono text-[11px] font-normal text-muted-foreground">
            {userId}
          </span>
        </span>
      </button>
      <a href={`mailto:${email}`} className={cn(rowBase)}>
        <span className={iconWrap} aria-hidden>
          <Mail className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-tight">{t("Dërgo email", "Send email")}</span>
          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
            {t("Hap klientin e postës", "Opens your mail app")}
          </span>
        </span>
      </a>
    </div>
  );
}
