"use client";
import { useUiT } from "@/hooks/use-ui-t";

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
  const tUi = useUiT();
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
      toast.error(tUi("password_must_be_8_characters"));
      return;
    }
    if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
      toast.error(tUi("passwords_do_not_match"));
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
        toast.success(tUi("password_updated_and_emailed"));
        setOpen(false);
      } else if (json.temporaryPassword) {
        setShownTemp(json.temporaryPassword);
        toast.success(tUi("password_generated"));
      } else {
        toast.success(tUi("password_updated"));
        setOpen(false);
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger
          render={
            <Button variant={triggerVariant} size="icon" className="h-8 w-8" aria-label={tUi("reset_password")} />
          }
        >
          <KeyRound className="h-4 w-4" />
        </DialogTrigger>
      )}
      <DialogContent className={`sm:max-w-md ${adminWhiteDialogClassName}`}>
        <DialogHeader>
          <DialogTitle>{tUi("reset_password")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {userName} · {userEmail}
        </p>

        {shownTemp ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-medium text-amber-900">{tUi("temporary_password")}</p>
            <p className="mt-2 font-mono text-base">{shownTemp}</p>
            <Button className="mt-3" size="sm" onClick={() => setOpen(false)}>
              {tUi("close")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{tUi("new_password_optional")}</Label>
              <Input
                type="password"
                className={adminWhiteInputClassName}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{tUi("confirm")}</Label>
              <Input
                type="password"
                className={adminWhiteInputClassName}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="gen-temp" checked={generateTemp} onCheckedChange={(v) => setGenerateTemp(v === true)} />
              <Label htmlFor="gen-temp">{tUi("generate_temporary_password")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="notify" checked={notifyCustomer} onCheckedChange={(v) => setNotifyCustomer(v === true)} />
              <Label htmlFor="notify">{tUi("notify_customer_by_email")}</Label>
            </div>
            <Button className="w-full" disabled={loading} onClick={() => void submit()}>
              {tUi("save_password")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
