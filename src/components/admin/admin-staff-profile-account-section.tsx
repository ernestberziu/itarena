"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { KeyRound, Loader2, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/admin/users";
import { formatDateTime } from "@/lib/utils";
import { staffRoleLabel } from "@/lib/staff-role-labels";

export type AdminStaffProfileAccountUser = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  language: string;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
};

function t(locale: string, sq: string, en: string) {
  return locale === "en" ? en : sq;
}

function languageLabel(code: string, locale: string) {
  if (code === "en") return t(locale, "Anglisht", "English");
  if (code === "sq") return t(locale, "Shqip", "Albanian");
  return code;
}

export function AdminStaffProfileAccountSection({
  user,
  locale,
  canEdit,
  labels,
}: {
  user: AdminStaffProfileAccountUser;
  locale: string;
  canEdit: boolean;
  labels: {
    account: string;
    accountHint: string;
    password: string;
    passwordHint: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    savePassword: string;
    saveProfile: string;
    readOnlyHint: string;
  };
}) {
  const router = useRouter();
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const roleLabel = staffRoleLabel(user.role, locale === "en" ? "en" : "sq");
  const initialPhone = user.phone?.trim() ?? "";

  const [phone, setPhone] = useState(initialPhone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const phoneDirty = phone.trim() !== initialPhone;
  const passwordReady =
    currentPassword.length > 0 &&
    newPassword.trim().length >= 8 &&
    confirmPassword.trim().length >= 8;

  async function savePhone() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() || null }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? t(locale, "Gabim", "Error"));
      toast.success(t(locale, "Telefoni u ruajt", "Phone number saved"));
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t(locale, "Gabim", "Error"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (newPassword.trim().length < 8) {
      toast.error(
        t(locale, "Fjalëkalimi i ri duhet të jetë të paktën 8 karaktere", "New password must be at least 8 characters")
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t(locale, "Fjalëkalimet e rinj nuk përputhen", "New passwords do not match"));
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg =
          json.error === "Current password is incorrect"
            ? t(locale, "Fjalëkalimi aktual është i gabuar", "Current password is incorrect")
            : json.error === "New password must be different from the current password"
              ? t(locale, "Fjalëkalimi i ri duhet të jetë i ndryshëm nga ai aktual", "New password must differ from the current one")
              : json.error ?? t(locale, "Gabim", "Error");
        throw new Error(msg);
      }

      toast.success(
        t(locale, "Fjalëkalimi u ndryshua. Hyni përsëri.", "Password updated. Please sign in again.")
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await signOut({
        callbackUrl: locale === "en" ? "/en/hyr" : "/hyr",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t(locale, "Gabim", "Error"));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              {labels.account}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{labels.accountHint}</p>
          </div>
          <Badge variant="secondary" className="font-medium">
            {roleLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            size="lg"
            className="h-14 w-14 shrink-0"
          />
          <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
            <DetailField label={t(locale, "Emri", "Name")} value={fullName} />
            <DetailField label="Email" value={user.email ?? "—"} mono />
            <div className="grid gap-1 sm:col-span-2">
              <Label htmlFor="profile-phone" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t(locale, "Telefon", "Phone")}
              </Label>
              {canEdit ? (
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+355..."
                  className="max-w-sm"
                />
              ) : (
                <span className="text-sm font-medium text-foreground">{initialPhone || "—"}</span>
              )}
            </div>
            <DetailField
              label={t(locale, "Gjuha", "Language")}
              value={languageLabel(user.language, locale)}
            />
            <DetailField
              label={t(locale, "Hyrja e fundit", "Last login")}
              value={
                user.lastLoginAt
                  ? formatDateTime(
                      user.lastLoginAt instanceof Date ? user.lastLoginAt : new Date(user.lastLoginAt)
                    )
                  : "—"
              }
            />
            <DetailField
              label={t(locale, "Anëtar që nga", "Member since")}
              value={formatDateTime(
                user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
              )}
            />
          </div>
        </div>

        {canEdit && phoneDirty ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-2"
            disabled={savingProfile}
            onClick={() => void savePhone()}
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" strokeWidth={2} aria-hidden />
            )}
            {labels.saveProfile}
          </Button>
        ) : null}

        {!canEdit ? (
          <p className="text-sm text-muted-foreground">{labels.readOnlyHint}</p>
        ) : null}

        {canEdit ? (
          <>
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                <div>
                  <h3 className="text-sm font-semibold">{labels.password}</h3>
                  <p className="text-xs text-muted-foreground">{labels.passwordHint}</p>
                </div>
              </div>

              <div className="grid max-w-xl gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-current-password">{labels.currentPassword}</Label>
                  <Input
                    id="profile-current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-new-password">{labels.newPassword}</Label>
                    <Input
                      id="profile-new-password"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t(locale, "minimum 8 karaktere", "at least 8 characters")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-confirm-password">{labels.confirmPassword}</Label>
                    <Input
                      id="profile-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-fit gap-2"
                  disabled={savingPassword || !passwordReady}
                  onClick={() => void changePassword()}
                >
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <KeyRound className="h-4 w-4" strokeWidth={2} aria-hidden />
                  )}
                  {labels.savePassword}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm text-foreground" : "text-sm font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}
