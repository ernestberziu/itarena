import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UserStatusBadgeInput = {
  isActive: boolean;
  emailVerified: string | null | undefined;
  company?: { isApproved: boolean } | null;
};

/** Derived: Active=isActive; Suspended=!isActive; Verified=email set; Unverified=active+no email; Pending=B2B company not approved. */
export function deriveUserStatusLabels(
  u: UserStatusBadgeInput,
  locale: string
): { key: string; label: string; className: string }[] {
  const en = locale === "en";
  const out: { key: string; label: string; className: string }[] = [];

  if (!u.isActive) {
    out.push({
      key: "suspended",
      label: en ? "Suspended" : "Pezulluar",
      className:
        "border-rose-300/50 bg-rose-500/10 text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-200",
    });
  } else {
    out.push({
      key: "active",
      label: en ? "Active" : "Aktiv",
      className:
        "border-emerald-300/50 bg-emerald-500/10 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200",
    });
  }

  if (u.emailVerified) {
    out.push({
      key: "verified",
      label: en ? "Verified" : "Verifikuar",
      className:
        "border-sky-300/50 bg-sky-500/10 text-sky-900 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-200",
    });
  } else if (u.isActive) {
    out.push({
      key: "unverified",
      label: en ? "Unverified" : "Pa verifikuar",
      className:
        "border-amber-300/50 bg-amber-500/10 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200",
    });
  }

  if (u.company && u.company.isApproved === false) {
    out.push({
      key: "pending",
      label: en ? "Pending" : "Në pritje",
      className:
        "border-violet-300/50 bg-violet-500/10 text-violet-900 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-200",
    });
  }

  return out;
}

export function UserStatusBadges({
  user,
  locale,
  className,
}: {
  user: UserStatusBadgeInput;
  locale: string;
  className?: string;
}) {
  const items = deriveUserStatusLabels(user, locale);
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {items.map((b) => (
        <Badge
          key={b.key}
          variant="outline"
          className={cn("text-[10px] font-semibold uppercase tracking-wide", b.className)}
        >
          {b.label}
        </Badge>
      ))}
    </div>
  );
}
