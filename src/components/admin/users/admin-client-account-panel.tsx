"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export function AdminClientAccountPanel({
  userId,
  locale,
  userLanguage,
  initialFirstName,
  initialLastName,
  initialEmail,
}: {
  userId: string;
  locale: string;
  /** User profile language — used for credential email template when notifying. */
  userLanguage: string;
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generateTemp, setGenerateTemp] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setEmail(initialEmail);
  }, [initialFirstName, initialLastName, initialEmail]);

  const profileDirty =
    firstName !== initialFirstName || lastName !== initialLastName || email !== initialEmail;
  const passwordDirty =
    newPassword.trim().length > 0 ||
    confirmPassword.trim().length > 0 ||
    generateTemp ||
    notifyCustomer;
  const canSave = profileDirty || passwordDirty;

  async function save() {
    if (newPassword.trim().length > 0 && newPassword.trim().length < 8) {
      toast.error(t("Fjalëkalimi duhet të jetë të paktën 8 karaktere", "Password must be at least 8 characters"));
      return;
    }
    if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
      toast.error(t("Fjalëkalimet nuk përputhen", "Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        firstName,
        lastName,
        email: email.trim(),
      };

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
          t(
            "U ruajt dhe klienti u njoftua me email (fjalëkalimi i përkohshëm).",
            "Saved and the customer was emailed (temporary password)."
          )
        );
      } else if (json.notifyEmailAttempted && !json.credentialsEmailSent) {
        toast.warning(
          t(
            "U ruajt, por emaili nuk u dërgua. Kontrollo SMTP_HOST / SMTP_USER / SMTP_PASS në .env.",
            "Saved, but the email was not sent. Check SMTP_HOST / SMTP_USER / SMTP_PASS in .env."
          )
        );
      } else {
        toast.success(t("U ruajt", "Saved"));
      }

      setNewPassword("");
      setConfirmPassword("");
      setGenerateTemp(false);
      setNotifyCustomer(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <h2 className="text-sm font-semibold tracking-tight" id="account">
        {t("Llogaria", "Account")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="acf">{t("Emri", "First name")}</Label>
          <Input id="acf" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acl">{t("Mbiemri", "Last name")}</Label>
          <Input id="acl" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ace">Email</Label>
          <Input id="ace" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-[11px] text-muted-foreground">
            {t(
              "Nëse ndryshon emailin dhe zgjedh njoftimin, klienti merr mesazh në adresën e re me fjalëkalimin e përkohshëm.",
              "If you change the email and enable notification, the customer receives the message at the new address with the temporary password."
            )}
          </p>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("Fjalëkalimi", "Password")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="acp-new">{t("Fjalëkalim i ri (opsional)", "New password (optional)")}</Label>
            <Input
              id="acp-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              disabled={generateTemp}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("minimum 8 karaktere", "at least 8 characters")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acp-confirm">{t("Konfirmo fjalëkalimin", "Confirm password")}</Label>
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
            {t(
              "Gjenero fjalëkalim të përkohshëm të rastësishëm (në vend të fjalëkalimit të shkruar më sipër)",
              "Generate a random temporary password (instead of the password fields above)"
            )}
          </Label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="acp-notify"
            checked={notifyCustomer}
            onCheckedChange={(v) => setNotifyCustomer(v === true)}
          />
          <Label htmlFor="acp-notify" className="cursor-pointer text-sm font-normal leading-snug">
            {t(
              "Njofto klientin me email: adresë hyrjeje + fjalëkalim i përkohshëm (gjenerohet automatikisht nëse nuk vendos një fjalëkalim).",
              "Email the customer their sign-in address and a temporary password (one is generated automatically if you do not set a password)."
            )}
          </Label>
        </div>
      </div>

      <Button type="button" onClick={() => void save()} disabled={loading || !canSave}>
        {t("Ruaj ndryshimet", "Save changes")}
      </Button>
      <p className="text-[11px] text-muted-foreground" aria-live="polite">
        {t(
          "Emaili i njoftimit përdor gjuhën e profilit të klientit",
          "Notification email uses the customer’s profile language"
        )}
        : <span className="font-mono">{userLanguage === "en" ? "en" : "sq"}</span>.
      </p>
    </div>
  );
}
