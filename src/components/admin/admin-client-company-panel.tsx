"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminAssignCompanyDialog } from "@/components/admin/admin-assign-company-dialog";
import type { RegistrationCompanySnapshot } from "@/lib/registration-company-snapshot";

export function AdminClientCompanyPanel({
  userId,
  locale,
  lp,
  activeCompany,
  registeredCompany,
  registrationSnapshot,
}: {
  userId: string;
  locale: string;
  lp: string;
  activeCompany: {
    id: string;
    name: string;
    tier: string | null;
    isApproved: boolean;
    vatNumber: string | null;
    city: string | null;
  } | null;
  registeredCompany: {
    id: string;
    name: string;
    vatNumber: string | null;
    city: string | null;
    tier: string | null;
    isApproved: boolean;
  } | null;
  registrationSnapshot: RegistrationCompanySnapshot | null;
}) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [assignOpen, setAssignOpen] = useState(false);

  async function clearCompany() {
    const res = await fetch(`/api/admin/clients/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: null }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error((body as { error?: string }).error ?? t("Gabim", "Error"));
      return;
    }
    toast.success(t("Kompania aktive u hoq", "Active company cleared"));
    router.refresh();
  }

  const hasRegistrationData = Boolean(registeredCompany || registrationSnapshot);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          {t("Lidhja me kompaninë", "Company affiliation")}
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
            {activeCompany ? t("Ndrysho kompaninë", "Change company") : t("Cakto kompani", "Assign company")}
          </Button>
          {activeCompany && (
            <Button size="sm" variant="outline" onClick={() => void clearCompany()}>
              {t("Hiq", "Clear")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("Kompania aktive (admin)", "Active company (admin)")}
          </p>
          {activeCompany ? (
            <div className="mt-2 space-y-1">
              <Link href={`${lp}/admin/companies/${activeCompany.id}`} className="font-medium hover:text-primary">
                {activeCompany.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {[activeCompany.vatNumber, activeCompany.city, activeCompany.tier].filter(Boolean).join(" · ")}
              </p>
              <Badge variant="outline" className={activeCompany.isApproved ? "text-emerald-700" : "text-amber-700"}>
                {activeCompany.isApproved ? t("Miratuar", "Approved") : t("Në pritje", "Pending")}
              </Badge>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t("Asnjë kompani e caktuar.", "No company assigned.")}</p>
          )}
        </div>

        {hasRegistrationData && (
          <div className="rounded-xl border border-dashed border-amber-200/80 bg-amber-50/50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
              <History className="h-3.5 w-3.5" />
              {t("Të dhënat e regjistrimit (e paprekura)", "Registration data (preserved)")}
            </p>
            {registeredCompany && (
              <div className="mt-2 text-sm">
                <p className="font-medium">{registeredCompany.name}</p>
                <p className="text-muted-foreground">
                  {[registeredCompany.vatNumber, registeredCompany.city, registeredCompany.tier]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}
            {registrationSnapshot && (
              <div className="mt-2 space-y-0.5 text-sm">
                {registrationSnapshot.name && <p className="font-medium">{registrationSnapshot.name}</p>}
                {registrationSnapshot.vatNumber && (
                  <p className="text-muted-foreground">NIPT: {registrationSnapshot.vatNumber}</p>
                )}
                {registrationSnapshot.address && (
                  <p className="text-muted-foreground">{registrationSnapshot.address}</p>
                )}
                {(registrationSnapshot.city || registrationSnapshot.country) && (
                  <p className="text-muted-foreground">
                    {[registrationSnapshot.city, registrationSnapshot.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AdminAssignCompanyDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        userId={userId}
        locale={locale}
        currentCompanyId={activeCompany?.id ?? null}
        registrationSnapshot={registrationSnapshot}
        onAssigned={() => router.refresh()}
      />
    </div>
  );
}
