"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { TemplatesSubnav } from "./templates-subnav";
import type { DocumentListRow } from "@/app/api/admin/templates/documents/route";
import { useInfiniteList } from "@/hooks/use-infinite-list";

export function DocumentsTable({
  lp,
  locale,
  title,
  initialDocuments,
  totalCount,
  pageSize,
  filterQuery,
}: {
  lp: string;
  locale: string;
  title: string;
  initialDocuments: DocumentListRow[];
  totalCount: number;
  pageSize: number;
  filterQuery: string;
}) {
  const t = useTranslations("admin.templatesPage");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount } =
    useInfiniteList({
      initialItems: initialDocuments,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/templates/documents",
      getRowId: (r) => r.id,
      locale,
    });

  async function duplicate(id: string) {
    const res = await fetch(`/api/admin/templates/documents/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const d = (await res.json()) as DocumentListRow;
      const path =
        d.type === "EMPLOYMENT"
          ? `${lp}/admin/templates/contracts/employment/${d.id}`
          : `${lp}/admin/templates/contracts/service/${d.id}`;
      window.location.href = path;
    }
  }

  const columns = useMemo<ColumnDef<DocumentListRow>[]>(
    () => [
      {
        accessorKey: "documentNumber",
        header: "#",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.documentNumber}</span>
        ),
      },
      {
        id: "customer",
        accessorFn: (r) => r.partyJson.fullName?.toLowerCase() ?? "",
        header: "Customer",
        enableSorting: true,
        cell: ({ row }) => row.original.partyJson.fullName,
      },
      {
        accessorKey: "type",
        header: "Type",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.type === "EMPLOYMENT" ? t("employment") : t("serviceContract"),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        enableSorting: true,
        cell: ({ row }) => format(new Date(row.original.createdAt), "PP"),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-wrap justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              {r.status === "DRAFT" ? (
                <Button size="sm" variant="outline" asChild>
                  <Link
                    href={
                      r.type === "EMPLOYMENT"
                        ? `${lp}/admin/templates/contracts/employment/${r.id}`
                        : `${lp}/admin/templates/contracts/service/${r.id}`
                    }
                  >
                    Edit
                  </Link>
                </Button>
              ) : null}
              {r.pdfUrl ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={`/api/admin/templates/documents/${r.id}/pdf`} target="_blank" rel="noreferrer">
                    {t("download")}
                  </a>
                </Button>
              ) : null}
              <Button size="sm" variant="outline" onClick={() => void duplicate(r.id)}>
                {t("duplicate")}
              </Button>
            </div>
          );
        },
      },
    ],
    [lp, t]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <TemplatesSubnav lp={lp} />
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "dokumente",
            entityEn: "documents",
            emptySq: "Nuk ka dokumente",
            emptyEn: "No documents",
          }}
          totalCount={totalCount}
          loadedCount={loadedCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={error}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          getRowId={(r) => r.id}
          minTableWidth="720px"
        />
      </div>
    </div>
  );
}
