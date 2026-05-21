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
import { AdminClientInviteDialog } from "@/components/admin/admin-client-invite-dialog";

export function AdminClientAccountPanel({
  userId,
  locale,
  userLanguage,
  hasPortalAccess,
  initialFirstName,
  initialLastName,
  initialEmail,
}: {
  userId: string;
  locale: string;
  /** User profile language — used for credential email template when notifying. */
  userLanguage: string;
  hasPortalAccess: boolean;
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string | null;
}) {
  const router = useRouter();
  const en = locale === "en";
  const tUi = useUiT();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generateTemp, setGenerateTemp] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setEmail(initialEmail ?? "");
  }, [initialFirstName, initialLastName, initialEmail]);

  const profileDirty =
    firstName !== initialFirstName ||
    lastName !== initialLastName ||
    email !== (initialEmail ?? "");
  const passwordDirty =
    newPassword.trim().length > 0 ||
    confirmPassword.trim().length > 0 ||
    generateTemp ||
    notifyCustomer;
  const canSave = profileDirty || passwordDirty;

  async function save() {
    if (newPassword.trim().length > 0 && newPassword.trim().length < 8) {
      toast.error(tUi("password_must_be_at_least_8_characters"));
      return;
    }
    if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
      toast.error(tUi("passwords_do_not_match"));
      return;
    }
    if (notifyCustomer && !email.trim()) {
      toast.error(tUi("enter_an_email_to_notify"));
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        firstName,
        lastName,
      };

      if (email.trim()) {
        body.email = email.trim();
      }

      if (notifyCustomer) {
        body.notifyCustomer = true;
      }
      if (newPassword.trim().length >= 8) {
        body.newPassword = newPassword.trim();
      } else if (generateTemp) {
        body.generateTemporaryPassword = true;
      }

      const res = await fetch(`/api/admin/clients/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        credentialsEmailSent?: boolean;
        notifyEmailAttempted?: boolean;
      };
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      if (json.notifyEmailAttempted && json.credentialsEmailSent) {
        toast.success(
          tUi("saved_and_the_customer_was_emailed_temporary_pas")
        );
      } else if (json.notifyEmailAttempted && !json.credentialsEmailSent) {
        toast.warning(
          tUi("saved_but_the_email_was_not_sent_check_smtp_host")
        );
      } else {
        toast.success(tUi("saved_2"));
      }

      setNewPassword("");
      setConfirmPassword("");
      setGenerateTemp(false);
      setNotifyCustomer(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <h2 className="text-sm font-semibold tracking-tight" id="account">
        {tUi("account")}
      </h2>

      {!hasPortalAccess ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            {tUi("client_does_not_have_portal_access_yet")}
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-300/90">
            {tUi("use_invite_by_email_to_set_their_address_and_tem")}
          </p>
          <AdminClientInviteDialog
            userId={userId}
            userName={`${firstName} ${lastName}`}
            locale={locale}
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            hideTrigger
          />
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setInviteOpen(true)}>
            {tUi("invite_to_portal")}
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="acf">{tUi("first_name")}</Label>
          <Input id="acf" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acl">{tUi("last_name")}</Label>
          <Input id="acl" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ace">Email</Label>
          <Input
            id="ace"
            type="email"
            value={email}
            disabled={!hasPortalAccess}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={!hasPortalAccess ? tUi("no_email_use_invite") : undefined}
          />
          {hasPortalAccess ? (
            <p className="text-[11px] text-muted-foreground">
              {tUi("if_you_change_the_email_and_enable_notification_")}
            </p>
          ) : null}
        </div>
      </div>

      {hasPortalAccess ? (
        <>
          <Separator className="my-2" />

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tUi("password")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="acp-new">{tUi("new_password_optional")}</Label>
                <Input
                  id="acp-new"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  disabled={generateTemp}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={tUi("at_least_8_characters")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acp-confirm">{tUi("confirm_password")}</Label>
                <Input
                  id="acp-confirm"
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
                id="acp-gen"
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
              <Label htmlFor="acp-gen" className="cursor-pointer text-sm font-normal leading-snug">
                {tUi("generate_a_random_temporary_password_instead_of_")}
              </Label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="acp-notify"
                checked={notifyCustomer}
                onCheckedChange={(v) => setNotifyCustomer(v === true)}
              />
              <Label htmlFor="acp-notify" className="cursor-pointer text-sm font-normal leading-snug">
                {tUi("email_the_customer_their_sign_in_address_and_a_t")}
              </Label>
            </div>
          </div>
        </>
      ) : null}

      <Button type="button" onClick={() => void save()} disabled={loading || !canSave}>
        {tUi("save_changes")}
      </Button>
      {hasPortalAccess ? (
        <p className="text-[11px] text-muted-foreground" aria-live="polite">
          {tUi("notification_email_uses_the_customer_s_profile_l")}
          : <span className="font-mono">{userLanguage === "en" ? "en" : "sq"}</span>.
        </p>
      ) : null}
    </div>
  );
}
