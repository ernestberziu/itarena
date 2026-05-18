"use client";

import Link from "next/link";
import type { ProjectListRow } from "@/lib/projects/types";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export function ProjectsTable({
  rows,
  listPrefix,
  locale,
}: {
  rows: ProjectListRow[];
  listPrefix: string;
  locale: string;
}) {
  const en = locale === "en";

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">{en ? "Project" : "Projekti"}</th>
            <th className="px-4 py-3 font-medium">{en ? "Clients" : "Klientët"}</th>
            <th className="px-4 py-3 font-medium">{en ? "Tickets" : "Biletat"}</th>
            <th className="px-4 py-3 font-medium">{en ? "Team" : "Ekipi"}</th>
            <th className="px-4 py-3 font-medium">{en ? "Updated" : "Përditësuar"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <Link
                  href={`${listPrefix}/admin/projects/${row.id}`}
                  className="font-medium hover:text-primary"
                >
                  {row.title}
                </Link>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant={row.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">
                    {row.status === "ACTIVE" ? (en ? "Active" : "Aktiv") : en ? "Archived" : "Arkivuar"}
                  </Badge>
                </div>
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">{row._count.clients}</td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">{row._count.tickets}</td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">{row._count.members}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(row.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
