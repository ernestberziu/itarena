"use client";

import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProjectRowActions({
  detailHref,
  canWrite,
  locale,
  className,
}: {
  detailHref: string;
  canWrite: boolean;
  locale: string;
  className?: string;
}) {
  const en = locale === "en";
  const viewLabel = en ? "View project" : "Shiko projektin";
  const editLabel = en ? "Edit project" : "Ndrysho projektin";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-sm",
        "ring-1 ring-black/[0.03] dark:bg-muted/20 dark:ring-white/[0.05]",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 border-0 bg-transparent text-muted-foreground shadow-none hover:bg-background hover:text-foreground"
        asChild
      >
        <Link href={detailHref} aria-label={viewLabel} title={viewLabel}>
          <Eye className="h-4 w-4" strokeWidth={2} />
        </Link>
      </Button>
      {canWrite ? (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 border-0 bg-transparent text-muted-foreground shadow-none hover:bg-background hover:text-primary"
          asChild
        >
          <Link href={detailHref} aria-label={editLabel} title={editLabel}>
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
