"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FileSignature, Briefcase, Handshake, History, Library, Settings } from "lucide-react";
import { TemplatesSubnav } from "./templates-subnav";

const cards = [
  { key: "serviceContract", href: "contracts/service/new", icon: FileSignature, color: "from-violet-500/10 to-indigo-500/5" },
  { key: "employment", href: "contracts/employment/new", icon: Briefcase, color: "from-blue-500/10 to-cyan-500/5" },
  { key: "partnerContract", href: "contracts/partner/new", icon: Handshake, color: "from-amber-500/10 to-orange-500/5" },
  { key: "history", href: "history", icon: History, color: "from-emerald-500/10 to-teal-500/5" },
  { key: "saved", href: "saved", icon: Library, color: "from-slate-500/10 to-zinc-500/5" },
  { key: "settings", href: "settings", icon: Settings, color: "from-purple-500/10 to-pink-500/5" },
] as const;

export function TemplatesHub({ lp }: { lp: string }) {
  const t = useTranslations("admin.templatesPage");

  return (
    <div>
      <TemplatesSubnav lp={lp} />
      <p className="mb-6 text-sm text-muted-foreground">{t("subtitle")}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, href, icon: Icon, color }) => (
          <Link
            key={key}
            href={`${lp}/admin/templates/${href}`}
            className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-6 shadow-sm ring-1 ring-black/[0.03] transition-all hover:-translate-y-0.5 hover:shadow-md dark:ring-white/[0.05] ${color}`}
          >
            <Icon className="mb-3 h-8 w-8 text-primary" strokeWidth={1.5} />
            <h3 className="font-semibold">{t(key)}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
