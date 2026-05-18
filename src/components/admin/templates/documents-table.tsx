"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { TemplatesSubnav } from "./templates-subnav";
import type { ContractParty } from "@/lib/templates/types";

type Row = {
  id: string;
  documentNumber: string;
  type: string;
  status: string;
  language: string;
  partyJson: ContractParty;
  pdfUrl: string | null;
  createdAt: string;
};

export function DocumentsTable({
  lp,
  statusFilter,
  title,
}: {
  lp: string;
  statusFilter?: string;
  title: string;
}) {
  const t = useTranslations("admin.templatesPage");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    const q = statusFilter ? `?status=${statusFilter}` : "";
    void fetch(`/api/admin/templates/documents${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setRows(data);
      });
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  async function duplicate(id: string) {
    const res = await fetch(`/api/admin/templates/documents/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const d = (await res.json()) as Row;
      const path =
        d.type === "EMPLOYMENT"
          ? `${lp}/admin/templates/contracts/employment/${d.id}`
          : `${lp}/admin/templates/contracts/service/${d.id}`;
      window.location.href = path;
    }
  }

  return (
    <div>
      <TemplatesSubnav lp={lp} />
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <div className="overflow-x-auto rounded-2xl border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="p-3">#</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/40">
                <td className="p-3 font-mono text-xs">{r.documentNumber}</td>
                <td className="p-3">{r.partyJson.fullName}</td>
                <td className="p-3">{r.type === "EMPLOYMENT" ? t("employment") : t("serviceContract")}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{format(new Date(r.createdAt), "PP")}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
