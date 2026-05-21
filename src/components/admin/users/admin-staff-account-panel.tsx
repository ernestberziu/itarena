"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/types/domain";

const STAFF_ROLE_OPTIONS: Role[] = ["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"];

export function AdminStaffAccountPanel({
  userId,
  locale,
  initialFirstName,
  initialLastName,
  initialEmail,
  initialRole,
  initialIsActive,
  canWrite,
  canChangeRole,
}: {
  userId: string;
  locale: string;
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string | null;
  initialRole: string;
  initialIsActive: boolean;
  canWrite: boolean;
  canChangeRole: boolean;
}) {
  const router = useRouter();
  const en = locale === "en";
  const tUi = useUiT();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState<string>(initialEmail ?? "");
  const [role, setRole] = useState(initialRole);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generateTemp, setGenerateTemp] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setEmail(initialEmail ?? "");
    setRole(initialRole);
    setIsActive(initialIsActive);
  }, [initialFirstName, initialLastName, initialEmail, initialRole, initialIsActive]);

  const profileDirty =
    firstName !== initialFirstName ||
    lastName !== initialLastName ||
    email !== (initialEmail ?? "") ||
    role !== initialRole ||
    isActive !== initialIsActive;
  const passwordDirty =
    newPassword.trim().length > 0 ||
    confirmPassword.trim().length > 0 ||
    generateTemp;
  const canSave = canWrite && (profileDirty || passwordDirty);

  async function save() {
    if (newPassword.trim().length > 0 && newPassword.trim().length < 8) {
      toast.error(tUi("password_must_be_at_least_8_characters"));
      return;
    }
    if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
      toast.error(tUi("passwords_do_not_match"));
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        firstName,
        lastName,
        email: email.trim(),
        role,
        isActive,
      };

      if (newPassword.trim().length >= 8) {
        body.newPassword = newPassword.trim();
      } else if (generateTemp) {
        body.generateTemporaryPassword = true;
      }
      if (notifyCustomer && (newPassword.trim().length >= 8 || generateTemp)) {
        body.notifyCustomer = true;
      }

      const res = await fetch(`/api/admin/staff/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        temporaryPassword?: string;
        credentialsEmailSent?: boolean;
        notifyEmailAttempted?: boolean;
      };
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      if (json.notifyEmailAttempted && json.credentialsEmailSent) {
        toast.success(tUi("notified_by_email"));
      } else if (json.temporaryPassword) {
        toast.success(
          tUi("staff_temp_password_toast", { password: json.temporaryPassword }),
          { duration: 20000 }
        );
      } else {
        toast.success(tUi("saved_2"));
      }

      setNewPassword("");
      setConfirmPassword("");
      setGenerateTemp(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  if (!canWrite) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
        <h2 className="text-sm font-semibold tracking-tight">{tUi("account")}</h2>
        <p className="text-sm text-muted-foreground">
          {tUi("you_do_not_have_permission_to_edit_staff")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <h2 className="text-sm font-semibold tracking-tight" id="staff-account">
        {tUi("account")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="asf">{tUi("first_name")}</Label>
          <Input id="asf" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="asl">{tUi("last_name")}</Label>
          <Input id="asl" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ase">Email</Label>
          <Input id="ase" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{tUi("role")}</Label>
          <Select value={role} onValueChange={(v) => v != null && setRole(v)} disabled={!canChangeRole}>
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
        <div className="flex items-center gap-2 pt-6">
          <Checkbox
            id="as-active"
            checked={isActive}
            onCheckedChange={(v) => setIsActive(v === true)}
          />
          <Label htmlFor="as-active" className="cursor-pointer text-sm font-normal">
            {tUi("account_active")}
          </Label>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {tUi("password")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="asp-new">{tUi("new_password_optional")}</Label>
            <Input
              id="asp-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              disabled={generateTemp}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={tUi("at_least_8_characters")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asp-confirm">{tUi("confirm_password")}</Label>
            <Input
              id="asp-confirm"
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
            id="asp-gen"
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
          <Label htmlFor="asp-gen" className="cursor-pointer text-sm font-normal leading-snug">
            {tUi("generate_a_random_temporary_password")}
          </Label>
        </div>
        {(newPassword.trim().length >= 8 || generateTemp) && (
          <div className="flex items-start gap-2">
            <Checkbox
              id="asp-notify"
              checked={notifyCustomer}
              onCheckedChange={(v) => setNotifyCustomer(v === true)}
            />
            <Label htmlFor="asp-notify" className="cursor-pointer text-sm font-normal leading-snug">
              {tUi("send_email_with_temporary_password")}
            </Label>
          </div>
        )}
      </div>

      <Button type="button" onClick={() => void save()} disabled={loading || !canSave}>
        {tUi("save_changes")}
      </Button>
    </div>
  );
}
