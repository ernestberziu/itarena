"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminWhiteDialogClassName, adminWhiteInputClassName } from "@/components/admin/admin-white-dialog";
import type { CompanyLookupItem } from "@/types/admin-company";

export function AdminCompanyAddMemberDialog({
  open,
  onOpenChange,
  companyId,
  locale,
  onAssigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  locale: string;
  onAssigned: () => void;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [q, setQ] = useState("");
  const [clients, setClients] = useState<
    { id: string; firstName: string; lastName: string; email: string; company: { name: string } | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: "1", pageSize: "10" });
        if (q.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/admin/clients?${params}`);
        const json = await res.json();
        if (res.ok) setClients(json.items ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [open, q]);

  async function assign(userId: string) {
    setAssigning(userId);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Request failed");
      toast.success(t("Klienti u lidh", "Client linked"));
      onOpenChange(false);
      onAssigned();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setAssigning(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${adminWhiteDialogClassName}`}>
        <DialogHeader>
          <DialogTitle>{t("Shto klient në kompani", "Add client to company")}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className={`pl-9 ${adminWhiteInputClassName}`}
            placeholder={t("Kërko klient...", "Search client...")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {loading && <p className="text-sm text-muted-foreground">{t("Duke kërkuar...", "Searching...")}</p>}
          {!loading && clients.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("Asnjë klient", "No clients")}</p>
          )}
          {clients.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {c.firstName} {c.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                {c.company && (
                  <p className="truncate text-[10px] text-amber-700">
                    {t("Aktualisht:", "Currently:")} {c.company.name}
                  </p>
                )}
              </div>
              <Button size="sm" disabled={assigning === c.id} onClick={() => void assign(c.id)}>
                {t("Lidh", "Link")}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
