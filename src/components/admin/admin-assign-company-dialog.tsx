"use client";
import { useUiT } from "@/hooks/use-ui-t";

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
import type { RegistrationCompanySnapshot } from "@/lib/registration-company-snapshot";

export function AdminAssignCompanyDialog({
  open,
  onOpenChange,
  userId,
  locale,
  currentCompanyId,
  registrationSnapshot,
  onAssigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  locale: string;
  currentCompanyId: string | null;
  registrationSnapshot: RegistrationCompanySnapshot | null;
  onAssigned: () => void;
}) {
  const en = locale === "en";
  const tUi = useUiT();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CompanyLookupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "12" });
        if (q.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/admin/companies/lookup?${params}`);
        if (res.ok) setItems(await res.json());
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [open, q]);

  async function assign(companyId: string) {
    setAssigning(companyId);
    try {
      const res = await fetch(`/api/admin/clients/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Request failed");
      toast.success(tUi("company_assigned"));
      onOpenChange(false);
      onAssigned();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setAssigning(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${adminWhiteDialogClassName}`}>
        <DialogHeader>
          <DialogTitle>{tUi("assign_company")}</DialogTitle>
        </DialogHeader>

        {registrationSnapshot?.name && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {tUi("registration")} {registrationSnapshot.name}
            {registrationSnapshot.vatNumber ? ` · ${registrationSnapshot.vatNumber}` : ""}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className={`pl-9 ${adminWhiteInputClassName}`}
            placeholder={tUi("search_company")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {loading && <p className="text-sm text-muted-foreground">{tUi("searching")}</p>}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">{tUi("no_companies")}</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="truncate text-xs text-muted-foreground">{item.sublabel || item.meta}</p>
              </div>
              <Button
                size="sm"
                disabled={assigning === item.id || item.id === currentCompanyId}
                onClick={() => void assign(item.id)}
              >
                {item.id === currentCompanyId ? tUi("active") : tUi("select")}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
