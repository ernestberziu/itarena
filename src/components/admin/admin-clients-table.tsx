"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, ShoppingBag, Ticket } from "lucide-react";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export type AdminClientRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  company: { name: string; tier: string | null; isApproved: boolean } | null;
  _count: { tickets: number; orders: number };
};

const TIER_BADGE: Record<string, string> = {
  B2B: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  RETAIL: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
};

export function AdminClientsTable({
  users,
  locale,
}: {
  users: AdminClientRow[];
  locale: string;
}) {
  const columns = useMemo<ColumnDef<AdminClientRow>[]>(() => {
    const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
    return [
      {
        id: "client",
        header: th("Klienti", "Client"),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center shrink-0">
              {row.original.firstName[0]}
              {row.original.lastName[0]}
            </div>
            <div>
              <p className="font-medium">
                {row.original.firstName} {row.original.lastName}
              </p>
              {!row.original.isActive && <span className="text-xs text-red-500">{th("Joaktiv", "Inactive")}</span>}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.email}</span>,
      },
      {
        id: "company",
        header: th("Kompania", "Company"),
        cell: ({ row }) =>
          row.original.company ? (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
              <span className="text-xs">{row.original.company.name}</span>
              {row.original.company.tier && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TIER_BADGE[row.original.company.tier ?? ""] ?? ""}`}
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
        accessorKey: "role",
        header: th("Roli", "Role"),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.role === "COMPANY_ADMIN" ? th("B2B Admin", "B2B Admin") : th("Klient", "Client")}
          </Badge>
        ),
      },
      {
        id: "tickets",
        header: th("Biletat", "Tickets"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Ticket className="h-3.5 w-3.5" strokeWidth={2} />
            {row.original._count.tickets}
          </div>
        ),
      },
      {
        id: "orders",
        header: th("Porositë", "Orders"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
            {row.original._count.orders}
          </div>
        ),
      },
      {
        id: "created",
        header: th("Regjistruar", "Registered"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
      },
    ];
  }, [locale]);

  return <AdminDataTable columns={columns} data={users} pageSize={50} />;
}
