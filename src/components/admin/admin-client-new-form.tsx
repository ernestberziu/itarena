"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminCompanyCombobox } from "@/components/admin/admin-company-combobox";
import { adminWhiteInputClassName } from "@/components/admin/admin-white-dialog";

export function AdminClientNewForm({ locale, lp }: { locale: string; lp: string }) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generateTemp, setGenerateTemp] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shownTemp, setShownTemp] = useState<string | null>(null);

  const hasAdvanced =
    Boolean(email.trim()) ||
    Boolean(phone.trim()) ||
    Boolean(newPassword.trim()) ||
    generateTemp ||
    notifyCustomer;

  async function submit() {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("Plotëso emrin dhe mbiemrin", "Fill in first and last name"));
      return;
    }

    const emailTrim = email.trim();
    const useAdvanced = advancedOpen && (emailTrim || hasAdvanced);

    if (useAdvanced && emailTrim) {
      if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
        toast.error(t("Fjalëkalimet nuk përputhen", "Passwords do not match"));
        return;
      }
      if (!generateTemp && newPassword.trim().length < 8 && !notifyCustomer) {
        toast.error(t("Vendos fjalëkalim ≥8 ose gjenero të përkohshëm", "Set password ≥8 or generate temp"));
        return;
      }
    }

    if (useAdvanced && !emailTrim && (generateTemp || notifyCustomer || newPassword.trim())) {
      toast.error(t("Email kërkohet për fjalëkalim ose njoftim", "Email is required for password or notification"));
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        companyId,
        language: locale === "en" ? "en" : "sq",
      };

      if (useAdvanced && emailTrim) {
        body.email = emailTrim;
        body.notifyCustomer = notifyCustomer;
        if (newPassword.trim().length >= 8) body.newPassword = newPassword.trim();
        else if (generateTemp) body.generateTemporaryPassword = true;
      }

      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        error?: string;
        id?: string;
        temporaryPassword?: string;
        credentialsEmailSent?: boolean;
        pendingInvite?: boolean;
      };
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      if (json.credentialsEmailSent) {
        toast.success(t("Klienti u krijua dhe u njoftua me email", "Client created and notified"));
        router.push(`${lp}/admin/clients/${json.id}`);
      } else if (json.temporaryPassword) {
        setShownTemp(json.temporaryPassword);
        toast.success(t("Klienti u krijua", "Client created"));
      } else if (json.pendingInvite) {
        toast.success(
          t(
            "Klienti u krijua. Mund ta ftoni në portal më vonë.",
            "Client created. You can invite them to the portal later."
          )
        );
        router.push(`${lp}/admin/clients/${json.id}`);
      } else {
        router.push(`${lp}/admin/clients/${json.id}`);
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setLoading(false);
    }
  }

  if (shownTemp) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-900">{t("Klienti u krijua", "Client created")}</p>
        <p className="mt-2 text-sm text-amber-800">{t("Fjalëkalimi i përkohshëm", "Temporary password")}:</p>
        <p className="mt-1 font-mono text-lg">{shownTemp}</p>
        <Button className="mt-4" onClick={() => router.push(`${lp}/admin/clients`)}>
          {t("Shko te klientët", "Go to clients")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold">{t("Të dhënat bazë", "Basic details")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "Mjafton emri dhe mbiemri. Ftesa në portal mund të dërgohet më vonë.",
            "First and last name are enough. Portal invite can be sent later."
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("Emri", "First name")} *</Label>
          <Input className={adminWhiteInputClassName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("Mbiemri", "Last name")} *</Label>
          <Input className={adminWhiteInputClassName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t("Kompania (opsionale)", "Company (optional)")}</Label>
          <AdminCompanyCombobox locale={locale} value={companyId} onChange={setCompanyId} />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/10">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
          onClick={() => setAdvancedOpen((v) => !v)}
        >
          <span>{t("Opsionale: email, telefon, fjalëkalim", "Optional: email, phone, password")}</span>
          {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {advancedOpen ? (
          <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                className={adminWhiteInputClassName}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("Telefon", "Phone")}</Label>
              <Input className={adminWhiteInputClassName} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("Fjalëkalimi", "Password")}</Label>
                <Input
                  className={adminWhiteInputClassName}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("Konfirmo", "Confirm")}</Label>
                <Input
                  className={adminWhiteInputClassName}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="gen" checked={generateTemp} onCheckedChange={(v) => setGenerateTemp(v === true)} />
              <Label htmlFor="gen">{t("Gjenero fjalëkalim të përkohshëm", "Generate temporary password")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="notify" checked={notifyCustomer} onCheckedChange={(v) => setNotifyCustomer(v === true)} />
              <Label htmlFor="notify">{t("Njofto klientin me email", "Notify customer by email")}</Label>
            </div>
          </div>
        ) : null}
      </div>

      <Button onClick={() => void submit()} disabled={loading}>
        {t("Krijo klientin", "Create client")}
      </Button>
    </div>
  );
}
