"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function TemplatesSubnav({ lp }: { lp: string }) {
  const t = useTranslations("admin.templatesPage");
  const pathname = usePathname();
  const base = `${lp}/admin/templates`;

  const links = [
    { href: base, label: t("title"), exact: true },
    { href: `${base}/contracts/service/new`, label: t("serviceContract") },
    { href: `${base}/contracts/employment/new`, label: t("employment") },
    { href: `${base}/contracts/partner/new`, label: t("partnerContract") },
    { href: `${base}/history`, label: t("history") },
    { href: `${base}/saved`, label: t("saved") },
    { href: `${base}/settings`, label: t("settings") },
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href || pathname === `${link.href}/`
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
