"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  ShoppingBag,
  Ticket,
  Users,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";
import { AdminStatCard } from "@/components/admin/users";
import { AdminCompanyForm } from "@/components/admin/admin-company-form";
import { AdminCompanyMemberActions } from "@/components/admin/admin-company-member-actions";
import { AdminCompanyAddMemberDialog } from "@/components/admin/admin-company-add-member-dialog";
import { Button } from "@/components/ui/button";
import type { AdminCompanyDetail } from "@/types/admin-company";

export function AdminCompanyDetailView({
  company,
  locale,
  lp,
  currentUserId,
  canMessage,
}: {
  company: AdminCompanyDetail;
  locale: string;
  lp: string;
  currentUserId: string;
  canMessage: boolean;
}) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  async function unassignMember(userId: string) {
    const res = await fetch(`/api/admin/companies/${company.id}/members/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error((body as { error?: string }).error ?? t("Gabim", "Error"));
      return;
    }
    toast.success(t("Klienti u shkëput", "Client unassigned"));
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/15 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
              <p className="text-sm text-muted-foreground">
                {[company.vatNumber, company.city, company.country].filter(Boolean).join(" · ") ||
                  t("Pa NIPT", "No VAT")}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {t("Krijuar", "Created")} {formatDate(company.createdAt)}
          </div>
        </div>

        {company.members.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{t("Anëtarët", "Members")}:</span>
            <div className="flex -space-x-2">
              {company.members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/15 text-[10px] font-bold text-primary"
                  title={`${m.firstName} ${m.lastName}`}
                >
                  {m.firstName[0]}
                  {m.lastName[0]}
                </div>
              ))}
              {company.members.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold">
                  +{company.members.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label={t("Anëtarë", "Members")} value={String(company._count.users)} icon={Users} />
        <AdminStatCard label={t("Bileta", "Tickets")} value={String(company._count.tickets)} icon={Ticket} />
        <AdminStatCard label={t("Porosi", "Orders")} value={String(company._count.orders)} icon={ShoppingBag} />
        <AdminStatCard label={t("Oferta", "Quotes")} value={String(company._count.quotes)} icon={Building2} />
      </div>

      <div id="edit" className="scroll-mt-24">
        <h2 className="mb-4 text-lg font-semibold">{t("Detajet e kompanisë", "Company details")}</h2>
        <AdminCompanyForm
          locale={locale}
          lp={lp}
          mode="edit"
          initial={{
            id: company.id,
            name: company.name,
            vatNumber: company.vatNumber,
            address: company.address,
            city: company.city,
            country: company.country,
            notes: company.notes,
          }}
        />
      </div>

      <div id="members" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t("Klientët e lidhur", "Linked clients")}</h2>
          <Button onClick={() => setAddMemberOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t("Shto klient", "Add client")}
          </Button>
        </div>

        {company.members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
            {t("Asnjë klient i lidhur ende.", "No linked clients yet.")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("Klienti", "Client")}</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">{t("Hyrja e fundit", "Last login")}</th>
                  <th className="px-4 py-3 text-right">{t("Veprime", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {company.members.map((m) => (
                  <tr key={m.id} className="border-t border-border/40">
                    <td className="px-4 py-3">
                      <Link href={`${lp}/admin/clients/${m.id}`} className="font-medium hover:text-primary">
                        {m.firstName} {m.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.lastLoginAt ? timeAgo(m.lastLoginAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <AdminCompanyMemberActions
                        member={m}
                        locale={locale}
                        lp={lp}
                        currentUserId={currentUserId}
                        canMessage={canMessage}
                        onUnassign={() => void unassignMember(m.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(company.recentTickets.length > 0 || company.recentOrders.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {company.recentTickets.length > 0 && (
            <div className="rounded-xl border border-border/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{t("Biletat e fundit", "Recent tickets")}</h3>
                <Link href={`${lp}/admin/tickets?companyId=${company.id}`} className="text-xs text-primary">
                  {t("Shiko të gjitha", "View all")} <ExternalLink className="inline h-3 w-3" />
                </Link>
              </div>
              <ul className="space-y-2 text-sm">
                {company.recentTickets.map((tk) => (
                  <li key={tk.id}>
                    <Link href={`${lp}/admin/tickets/${tk.id}`} className="hover:text-primary">
                      #{tk.number} — {tk.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {company.recentOrders.length > 0 && (
            <div className="rounded-xl border border-border/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{t("Porositë e fundit", "Recent orders")}</h3>
                <Link href={`${lp}/admin/orders?companyId=${company.id}`} className="text-xs text-primary">
                  {t("Shiko të gjitha", "View all")} <ExternalLink className="inline h-3 w-3" />
                </Link>
              </div>
              <ul className="space-y-2 text-sm">
                {company.recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`${lp}/admin/orders/${o.id}`} className="hover:text-primary">
                      {o.orderNumber} — {o.status}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <AdminCompanyAddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        companyId={company.id}
        locale={locale}
        onAssigned={() => router.refresh()}
      />
    </div>
  );
}
