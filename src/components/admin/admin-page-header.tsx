import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdminBreadcrumb = { label: string; href?: string };

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Optional path segments shown above the title */
  breadcrumbs?: AdminBreadcrumb[];
  /** Filters, tabs, or secondary toolbar — typically full width below title row */
  toolbar?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  toolbar,
  className,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 && <span className="text-border">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          {children}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {toolbar}
    </div>
  );
}
