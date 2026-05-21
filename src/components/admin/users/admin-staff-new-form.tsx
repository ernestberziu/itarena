"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/types/domain";

const STAFF_ROLE_OPTIONS: Role[] = ["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"];

export function AdminStaffNewForm({ locale }: { locale: string }) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const lp = locale === "sq" ? "" : `/${locale}`;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("ENGINEER");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generateTemp, setGenerateTemp] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error(t("Plotëso emrin, mbiemrin dhe emailin.", "Fill in first name, last name, and email."));
      return;
    }
    if (newPassword.trim().length > 0 && newPassword.trim().length < 8) {
      toast.error(t("Fjalëkalimi duhet të jetë të paktën 8 karaktere", "Password must be at least 8 characters"));
      return;
    }
    if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
      toast.error(t("Fjalëkalimet nuk përputhen", "Passwords do not match"));
      return;
    }
    if (!generateTemp && newPassword.trim().length < 8) {
      toast.error(
        t(
          "Vendos një fjalëkalim (≥8) ose zgjidh gjenerimin e përkohshëm.",
          "Set a password (≥8 characters) or enable temporary password generation."
        )
      );
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        isActive: true,
      };
      if (newPassword.trim().length >= 8) {
        body.newPassword = newPassword.trim();
      } else if (generateTemp) {
        body.generateTemporaryPassword = true;
      }
      if (notifyCustomer) body.notifyCustomer = true;

      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: { id: string };
        temporaryPassword?: string;
        credentialsEmailSent?: boolean;
        notifyEmailAttempted?: boolean;
      };
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      if (json.notifyEmailAttempted && json.credentialsEmailSent) {
        toast.success(t("Stafi u krijua dhe u njoftua me email", "Staff created and notified by email"));
      } else if (json.temporaryPassword) {
        toast.success(
          t(
            `U krijua. Fjalëkalimi i përkohshëm: ${json.temporaryPassword}`,
            `Created. Temporary password: ${json.temporaryPassword}`
          ),
          { duration: 20000 }
        );
      } else {
        toast.success(t("Stafi u krijua", "Staff member created"));
      }

      if (json.user?.id) {
        router.push(`${lp}/admin/staff/${json.user.id}`);
        router.refresh();
      } else {
        router.push(`${lp}/admin/staff`);
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nsf">{t("Emri", "First name")}</Label>
          <Input id="nsf" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nsl">{t("Mbiemri", "Last name")}</Label>
          <Input id="nsl" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nse">Email</Label>
          <Input id="nse" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>{t("Roli", "Role")}</Label>
          <Select value={role} onValueChange={(v) => v != null && setRole(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAFF_ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nsp">{t("Fjalëkalim", "Password")}</Label>
          <Input
            id="nsp"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            disabled={generateTemp}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nsc">{t("Konfirmo", "Confirm")}</Label>
          <Input
            id="nsc"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            disabled={generateTemp}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="nsg"
          checked={generateTemp}
          onCheckedChange={(v) => {
            const on = v === true;
            setGenerateTemp(on);
            if (on) {
              setNewPassword("");
              setConfirmPassword("");
            }
          }}
        />
        <Label htmlFor="nsg" className="cursor-pointer text-sm font-normal leading-snug">
          {t("Gjenero fjalëkalim të përkohshëm", "Generate a temporary password")}
        </Label>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="nsn"
          checked={notifyCustomer}
          onCheckedChange={(v) => setNotifyCustomer(v === true)}
        />
        <Label htmlFor="nsn" className="cursor-pointer text-sm font-normal leading-snug">
          {t("Dërgo email me fjalëkalim të përkohshëm", "Send email with temporary password")}
        </Label>
      </div>

      <Button type="button" onClick={() => void submit()} disabled={loading}>
        {t("Krijo", "Create")}
      </Button>
    </div>
  );
}
