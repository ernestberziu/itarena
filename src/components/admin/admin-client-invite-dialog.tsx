"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
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

export function AdminClientInviteDialog({
  userId,
  userName,
  locale,
  triggerVariant = "default",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
  triggerLabel,
}: {
  userId: string;
  userName: string;
  locale: string;
  triggerVariant?: "default" | "outline";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const en = locale === "en";
  const tUi = useUiT();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [email, setEmail] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shownTemp, setShownTemp] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setNotifyCustomer(true);
      setShownTemp(null);
    }
  }, [open]);

  async function submit() {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error(tUi("enter_an_email_address"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${userId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, notifyCustomer }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        credentialsEmailSent?: boolean;
        notifyEmailAttempted?: boolean;
        temporaryPassword?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      if (json.notifyEmailAttempted && json.credentialsEmailSent) {
        toast.success(tUi("invite_email_sent"));
        setOpen(false);
      } else if (json.temporaryPassword) {
        setShownTemp(json.temporaryPassword);
        toast.success(tUi("invite_created"));
      } else {
        toast.success(tUi("client_invited_to_portal"));
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
            <Button variant={triggerVariant} size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              {triggerLabel ?? tUi("invite_to_portal")}
            </Button>
          }
        />
      )}
      <DialogContent className={`sm:max-w-md ${adminWhiteDialogClassName}`}>
        <DialogHeader>
          <DialogTitle>{tUi("invite_to_portal")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{userName}</p>

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
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                type="email"
                className={adminWhiteInputClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="invite-notify"
                checked={notifyCustomer}
                onCheckedChange={(v) => setNotifyCustomer(v === true)}
              />
              <Label htmlFor="invite-notify" className="cursor-pointer text-sm font-normal">
                {tUi("send_email_with_temporary_password")}
              </Label>
            </div>
            <Button className="w-full" disabled={loading} onClick={() => void submit()}>
              {tUi("send_invite")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
