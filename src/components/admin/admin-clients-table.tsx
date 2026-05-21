"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Eye, ShoppingBag, Ticket } from "lucide-react";
import { toast } from "sonner";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { AdminClientPreviewSheet } from "@/components/admin/admin-client-preview-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import { buildClientsCsv, downloadTextFile } from "@/lib/csv-download";
import type { AdminClientRow } from "@/types/admin-client";
import {
  UserAvatar,
  UserStatusBadges,
  AdminClientRowActions,
  type UserStatusBadgeInput,
} from "@/components/admin/users";

export type { AdminClientRow } from "@/types/admin-client";

const TIER_BADGE: Record<string, string> = {
  B2B: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  RETAIL: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
};

const CSV_COLUMNS = [
  { key: "id", header: "id" },
  { key: "email", header: "email" },
  { key: "firstName", header: "firstName" },
  { key: "lastName", header: "lastName" },
  { key: "role", header: "role" },
  { key: "tier", header: "tier" },
  { key: "companyApproved", header: "companyApproved" },
  { key: "isActive", header: "isActive" },
  { key: "tickets", header: "tickets" },
  { key: "orders", header: "orders" },
  { key: "createdAt", header: "createdAt" },
] as const;

function toCsvRow(u: AdminClientRow): Record<string, string | number | boolean> {
  return {
    id: u.id,
    email: u.email ?? "",
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    tier: u.company?.tier ?? "",
    companyApproved: u.company?.isApproved ?? "",
    isActive: u.isActive,
    tickets: u._count.tickets,
    orders: u._count.orders,
    createdAt: u.createdAt,
  };
}

export function AdminClientsTable({
  initialClients,
  totalCount,
  pageSize,
  locale,
  lp,
  filterQuery,
  currentUserId,
  canMessage,
}: {
  initialClients: AdminClientRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  lp: string;
  filterQuery: string;
  currentUserId: string;
  canMessage: boolean;
}) {
  const router = useRouter();
  const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUser, setPreviewUser] = useState<AdminClientRow | null>(null);

  const mobileSentinelRef = useRef<HTMLDivElement>(null);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount, loadNext } =
    useInfiniteList({
      initialItems: initialClients,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/clients",
      getRowId: (r) => r.id,
      locale,
    });

  useEffect(() => {
    const target = mobileSentinelRef.current;
    if (!target) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNext();
      },
      { rootMargin: "120px", threshold: 0 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [loadNext]);

  useEffect(() => {
    setRowSelection({});
  }, [filterQuery, initialClients]);

  const openPreview = useCallback((u: AdminClientRow) => {
    setPreviewUser(u);
    setPreviewOpen(true);
  }, []);

  const selectedFromState = useCallback(() => {
    return rows.filter((u) => rowSelection[u.id]);
  }, [rows, rowSelection]);

  const selectionCount = selectedFromState().length;

  const runExport = useCallback(
    (rows: AdminClientRow[]) => {
      const data = rows.map((u) => toCsvRow(u));
      const csv = buildClientsCsv(data, [...CSV_COLUMNS]);
      const day = new Date().toISOString().slice(0, 10);
      downloadTextFile(`clients-export-${day}.csv`, csv);
      toast.success(th("CSV u shkarkua", "CSV downloaded"));
    },
    [th]
  );

  const runBulk = useCallback(
    async (action: "activate" | "suspend") => {
      const sel = selectedFromState();
      if (sel.length === 0) {
        toast.error(th("Zgjidh klientë", "Select clients"));
        return;
      }
      const res = await fetch("/api/admin/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: sel.map((u) => u.id), action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((body as { error?: string }).error ?? th("Gabim", "Error"));
        return;
      }
      const n = (body as { updatedCount?: number }).updatedCount ?? sel.length;
      toast.success(
        action === "activate"
          ? th(`${n} llogari u aktivizuan`, `${n} accounts activated`)
          : th(`${n} llogari u pezulluan`, `${n} accounts suspended`)
      );
      setRowSelection({});
      router.refresh();
    },
    [selectedFromState, router, th]
  );

  const bulkBar = (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.07] px-3 py-2 text-sm dark:bg-primary/10">
      <span className="font-medium text-foreground">
        {selectionCount}{" "}
        {th("të zgjedhur", "selected")}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={() => runExport(selectedFromState())}>
        {th("Eksporto CSV", "Export CSV")}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => void runBulk("activate")}>
        {th("Aktivizo", "Activate")}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => void runBulk("suspend")}>
        {th("Pezullo", "Suspend")}
      </Button>
      <Button type="button" variant="secondary" size="sm" className="ml-auto" onClick={() => setRowSelection({})}>
        {th("Hiq zgjedhjen", "Clear selection")}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => runExport(rows)}
        className="text-muted-foreground"
      >
        {hasMore
          ? th("Eksporto të ngarkuara", "Export loaded")
          : th("Eksporto të gjithë listën", "Export full list")}
      </Button>
    </div>
  );

  const columns = useMemo<ColumnDef<AdminClientRow>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
              aria-label={th("Zgjidh të gjithë", "Select all")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(v === true)}
              aria-label={th("Zgjidh rreshtin", "Select row")}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        id: "client",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`.toLowerCase(),
        header: th("Klienti", "Client"),
        enableSorting: true,
        cell: ({ row }) => {
          const badgeInput: UserStatusBadgeInput = {
            isActive: row.original.isActive,
            emailVerified: row.original.emailVerified,
            company: row.original.company,
          };
          return (
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                firstName={row.original.firstName}
                lastName={row.original.lastName}
                className="h-9 w-9 text-xs shrink-0"
              />
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {row.original.firstName} {row.original.lastName}
                </p>
                <UserStatusBadges user={badgeInput} locale={locale} className="mt-1" />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
        cell: ({ row }) => (
          <span
            className={`text-xs break-all ${row.original.email ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400"}`}
          >
            {row.original.email ??
              (locale === "sq" ? "— Pa ftesë" : "— Not invited")}
          </span>
        ),
      },
      {
        id: "company",
        accessorFn: (row) => row.company?.name?.toLowerCase() ?? "",
        header: th("Kompania", "Company"),
        enableSorting: true,
        cell: ({ row }) =>
          row.original.company ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
              <Link
                href={`${lp}/admin/companies/${row.original.company.id}`}
                className="text-xs truncate hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {row.original.company.name}
              </Link>
              {row.original.company.tier && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${TIER_BADGE[row.original.company.tier ?? ""] ?? ""}`}
                >
                  {row.original.company.tier}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground/50 text-xs">—</span>
          ),
      },
      {
        id: "type",
        header: th("Lloji", "Type"),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.company || row.original.hasRegistrationCompanyData
              ? th("Biznes", "Business")
              : th("Individual", "Individual")}
          </Badge>
        ),
      },
      {
        id: "tickets",
        accessorFn: (row) => row._count.tickets,
        header: th("Biletat", "Tickets"),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Ticket className="h-3.5 w-3.5" strokeWidth={2} />
            {row.original._count.tickets}
          </div>
        ),
      },
      {
        id: "orders",
        accessorFn: (row) => row._count.orders,
        header: th("Porositë", "Orders"),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
            {row.original._count.orders}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: th("Regjistruar", "Registered"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
      },
      {
        id: "preview",
        header: () => <span className="sr-only">{th("Parapamje", "Preview")}</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={th("Parapamje", "Preview")}
              onClick={() => openPreview(row.original)}
            >
              <Eye className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{th("Veprime", "Actions")}</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div
            className="sticky right-0 bg-gradient-to-l from-card from-80% to-transparent pl-2 md:pl-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminClientRowActions
              user={{
                id: row.original.id,
                email: row.original.email,
                hasPortalAccess: row.original.hasPortalAccess,
                firstName: row.original.firstName,
                lastName: row.original.lastName,
                isActive: row.original.isActive,
                companyId: row.original.company?.id ?? null,
                registrationCompanySnapshot: row.original.registrationCompanySnapshot,
              }}
              locale={locale}
              detailHref={`${lp}/admin/clients/${row.original.id}`}
              ticketsHref={`${lp}/admin/tickets?requester=${encodeURIComponent(row.original.id)}`}
              ordersHref={`${lp}/admin/orders?userId=${encodeURIComponent(row.original.id)}`}
              messagesBasePath={lp}
              currentUserId={currentUserId}
              canMessage={canMessage}
            />
          </div>
        ),
      },
    ];
  }, [locale, lp, th, openPreview, currentUserId, canMessage]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {selectionCount > 0 ? <div className="md:hidden">{bulkBar}</div> : null}

      <div className="hidden md:block">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "klientë",
            entityEn: "clients",
            emptySq: "Nuk u gjetën klientë",
            emptyEn: "No clients found",
          }}
          totalCount={totalCount}
          loadedCount={loadedCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={error}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          bulkActions={selectionCount > 0 ? bulkBar : undefined}
          onRowClick={(row) => router.push(`${lp}/admin/clients/${row.id}`)}
          getRowId={(r) => r.id}
          minTableWidth="920px"
          firstColumnId="select"
        />
      </div>

      <div className="md:hidden space-y-3">
        <AnimatePresence initial={false}>
          {rows.map((u, i) => {
            const badgeInput: UserStatusBadgeInput = {
              isActive: u.isActive,
              emailVerified: u.emailVerified,
              company: u.company,
            };
            return (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.24) }}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex shrink-0 items-start pt-0.5">
                    <Checkbox
                      checked={Boolean(rowSelection[u.id])}
                      onCheckedChange={(v) => {
                        setRowSelection((prev) => {
                          const next = { ...prev };
                          if (v === true) next[u.id] = true;
                          else delete next[u.id];
                          return next;
                        });
                      }}
                      aria-label={th("Zgjidh rreshtin", "Select row")}
                    />
                  </div>
                  <Link href={`${lp}/admin/clients/${u.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <UserAvatar firstName={u.firstName} lastName={u.lastName} className="h-11 w-11 text-sm shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className={`text-xs truncate ${u.email ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400"}`}>
                        {u.email ?? (locale === "sq" ? "Pa ftesë" : "Not invited")}
                      </p>
                      <UserStatusBadges user={badgeInput} locale={locale} className="mt-2" />
                    </div>
                  </Link>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      aria-label={th("Parapamje", "Preview")}
                      onClick={() => openPreview(u)}
                    >
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    </Button>
                    <AdminClientRowActions
                      user={{
                        id: u.id,
                        email: u.email,
                        hasPortalAccess: u.hasPortalAccess,
                        firstName: u.firstName,
                        lastName: u.lastName,
                        isActive: u.isActive,
                        companyId: u.company?.id ?? null,
                        registrationCompanySnapshot: u.registrationCompanySnapshot,
                      }}
                      locale={locale}
                      detailHref={`${lp}/admin/clients/${u.id}`}
                      ticketsHref={`${lp}/admin/tickets?requester=${encodeURIComponent(u.id)}`}
                      ordersHref={`${lp}/admin/orders?userId=${encodeURIComponent(u.id)}`}
                      messagesBasePath={lp}
                      currentUserId={currentUserId}
                      canMessage={canMessage}
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">{th("Kompania", "Company")}</p>
                    <p className="truncate">{u.company?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{th("Regjistruar", "Registered")}</p>
                    <p>{formatDate(new Date(u.createdAt))}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" />
                    {u._count.tickets}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {u._count.orders}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={mobileSentinelRef} className="h-px w-full" aria-hidden />
        {loadingMore ? (
          <p className="text-center text-xs text-muted-foreground">
            {th("Duke ngarkuar…", "Loading more…")}
          </p>
        ) : null}
      </div>

      <AdminClientPreviewSheet
        user={previewUser}
        open={previewOpen}
        onOpenChange={(o) => {
          setPreviewOpen(o);
          if (!o) setPreviewUser(null);
        }}
        locale={locale}
        lp={lp}
      />
    </>
  );
}
