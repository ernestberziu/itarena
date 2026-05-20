"use client";

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { adminWhiteDialogClassName, adminWhiteInputClassName } from "@/components/admin/admin-white-dialog";

export function AdminClientResetPasswordDialog({
  userId,
  userEmail,
  userName,
  locale,
  triggerVariant = "outline",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  locale: string;
  triggerVariant?: "outline" | "secondary";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generateTemp, setGenerateTemp] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shownTemp, setShownTemp] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setGenerateTemp(true);
      setNotifyCustomer(true);
      setShownTemp(null);
    }
  }, [open]);

  async function submit() {
    if (newPassword.trim().length > 0 && newPassword.trim().length < 8) {
      toast.error(t("Fjalëkalimi duhet të jetë ≥8 karaktere", "Password must be ≥8 characters"));
      return;
    }
    if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
      toast.error(t("Fjalëkalimet nuk përputhen", "Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {};
      if (newPassword.trim().length >= 8) body.newPassword = newPassword.trim();
      else if (generateTemp) body.generateTemporaryPassword = true;
      if (notifyCustomer) body.notifyCustomer = true;

      const res = await fetch(`/api/admin/clients/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        credentialsEmailSent?: boolean;
        notifyEmailAttempted?: boolean;
        temporaryPassword?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      if (json.notifyEmailAttempted && json.credentialsEmailSent) {
        toast.success(t("Fjalëkalimi u ndryshua dhe u dërgua me email", "Password updated and emailed"));
        setOpen(false);
      } else if (json.temporaryPassword) {
        setShownTemp(json.temporaryPassword);
        toast.success(t("Fjalëkalimi u gjenerua", "Password generated"));
      } else {
        toast.success(t("Fjalëkalimi u ndryshua", "Password updated"));
        setOpen(false);
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger
          render={
            <Button variant={triggerVariant} size="icon" className="h-8 w-8" aria-label={t("Rivendos fjalëkalimin", "Reset password")} />
          }
        >
          <KeyRound className="h-4 w-4" />
        </DialogTrigger>
      )}
      <DialogContent className={`sm:max-w-md ${adminWhiteDialogClassName}`}>
        <DialogHeader>
          <DialogTitle>{t("Rivendos fjalëkalimin", "Reset password")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {userName} · {userEmail}
        </p>

        {shownTemp ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-medium text-amber-900">{t("Fjalëkalimi i përkohshëm", "Temporary password")}</p>
            <p className="mt-2 font-mono text-base">{shownTemp}</p>
            <Button className="mt-3" size="sm" onClick={() => setOpen(false)}>
              {t("Mbyll", "Close")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("Fjalëkalim i ri (opsional)", "New password (optional)")}</Label>
              <Input
                type="password"
                className={adminWhiteInputClassName}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("Konfirmo", "Confirm")}</Label>
              <Input
                type="password"
                className={adminWhiteInputClassName}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="gen-temp" checked={generateTemp} onCheckedChange={(v) => setGenerateTemp(v === true)} />
              <Label htmlFor="gen-temp">{t("Gjenero fjalëkalim të përkohshëm", "Generate temporary password")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="notify" checked={notifyCustomer} onCheckedChange={(v) => setNotifyCustomer(v === true)} />
              <Label htmlFor="notify">{t("Njofto klientin me email", "Notify customer by email")}</Label>
            </div>
            <Button className="w-full" disabled={loading} onClick={() => void submit()}>
              {t("Ruaj fjalëkalimin", "Save password")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
