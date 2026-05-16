"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Elevated shell for URL-driven admin list filters (search, chips, selects).
 * Pairs with {@link AdminListToolbarSearch} for consistent GET forms.
 */
export function AdminListToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]",
        "flex flex-col gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

type HiddenField = Record<string, string>;

/** Search / apply-filters CTA — keeps `secondary` look with a calmer shadow stack on the card toolbar. */
export function AdminListToolbarSubmitButton({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "type" | "variant" | "size">) {
  return (
    <Button
      type="submit"
      variant="secondary"
      size="sm"
      className={cn(
        "h-10 shrink-0 px-5",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_1px_2px_-0.5px_rgba(0,0,0,0.28)]",
        "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_2px_8px_-2px_rgba(0,0,0,0.42)]",
        "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.42)]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AdminListToolbarSearch({
  action,
  placeholder,
  searchName = "q",
  defaultQuery,
  hiddenFields,
  submitLabelSq,
  submitLabelEn,
  locale,
}: {
  action: string;
  placeholder: string;
  searchName?: string;
  defaultQuery?: string;
  hiddenFields?: HiddenField;
  submitLabelSq: string;
  submitLabelEn: string;
  locale: string;
}) {
  const en = locale === "en";
  return (
    <form method="GET" action={action} className="flex w-full min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name={searchName}
          defaultValue={defaultQuery}
          placeholder={placeholder}
          className="h-10 w-full pl-9 pr-3"
          aria-label={placeholder}
        />
      </div>
      {hiddenFields
        ? Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)
        : null}
      <AdminListToolbarSubmitButton>{en ? submitLabelEn : submitLabelSq}</AdminListToolbarSubmitButton>
    </form>
  );
}

export function AdminListToolbarClear({
  href,
  labelSq,
  labelEn,
  locale,
  visible,
}: {
  href: string;
  labelSq: string;
  labelEn: string;
  locale: string;
  visible: boolean;
}) {
  if (!visible) return null;
  const en = locale === "en";
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border/55 bg-muted/30 px-4",
        "text-[13px] font-semibold leading-none text-muted-foreground",
        "shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.05)]",
        "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-border hover:bg-muted/55 hover:text-foreground",
        "hover:shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.07),0_1px_3px_-1px_hsl(var(--foreground)/0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-safe:active:scale-[0.98]",
        "dark:border-border/50 dark:bg-muted/20 dark:hover:bg-muted/40"
      )}
    >
      {en ? labelEn : labelSq}
    </Link>
  );
}
