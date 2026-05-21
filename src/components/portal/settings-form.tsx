"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Save, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  language: string;
}

export function PortalSettingsForm({
  user,
  locale,
}: {
  user: User;
  locale: string;
}) {
  const en = locale === "en";
  const tUi = useUiT();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [language, setLanguage] = useState(user.language);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const router = useRouter();

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, language }),
      });
      if (!res.ok) throw new Error();
      toast.success(tUi("settings_saved"));
      router.refresh();
    } catch {
      toast.error(tUi("failed_to_save_settings"));
    } finally {
      setLoadingProfile(false);
    }
  }

  async function savePassword() {
    if (newPassword.trim().length < 8) {
      toast.error(tUi("password_must_be_at_least_8_characters"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(tUi("passwords_do_not_match"));
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; passwordChanged?: boolean };
      if (!res.ok) {
        throw new Error(
          json.error === "Current password is incorrect"
            ? tUi("current_password_is_incorrect")
            : json.error ?? "Error"
        );
      }
      toast.success(tUi("password_updated_please_sign_in_again"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (json.passwordChanged) {
        await signOut({ callbackUrl: en ? "/en/hyr" : "/hyr" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoadingPassword(false);
    }
  }

  const passwordReady =
    currentPassword.length > 0 &&
    newPassword.trim().length >= 8 &&
    confirmPassword.trim().length >= 8;

  return (
    <div className="max-w-xl space-y-4">
      <Card className="admin-card-elevated">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm font-semibold">
            {tUi("personal_information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">
                  {tUi("first_name")}
                </Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">
                  {tUi("last_name")}
                </Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </Label>
              <Input id="email" value={user.email ?? ""} disabled className="bg-muted/40" />
              <p className="text-xs text-muted-foreground">
                {tUi("email_cannot_be_changed")}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                {tUi("phone")}
              </Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+355..." />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {tUi("preferred_language")}
              </Label>
              <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                <SelectTrigger>
                  <SelectValue>
                    {language === "sq" ? "🇦🇱 Shqip" : "🇬🇧 English"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sq">🇦🇱 Shqip</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="sm" className="gap-2" disabled={loadingProfile}>
              {loadingProfile ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              {tUi("save_changes")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="admin-card-elevated">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            {tUi("password")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground">
            {tUi("enter_your_current_password_and_a_new_one")}
          </p>
          <div className="space-y-2">
            <Label htmlFor="current-password">{tUi("current_password")}</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">{tUi("new_password")}</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{tUi("confirm")}</Label>
              <Input
                id="confirm-password"
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
            className="gap-2"
            disabled={loadingPassword || !passwordReady}
            onClick={() => void savePassword()}
          >
            {loadingPassword ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <KeyRound className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {tUi("save_password")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
