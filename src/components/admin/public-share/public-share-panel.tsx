"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, Loader2, Mail, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  adminWhiteDialogClassName,
  adminWhiteInputClassName,
} from "@/components/admin/admin-white-dialog";
import type { PublicShareResourceType } from "@/lib/public-share/types";

type ShareRow = {
  id: string;
  clientName: string;
  recipientEmail?: string | null;
  url: string;
  passcode: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  lastAccessAt: string | null;
  createdAt: string;
  isActive: boolean;
};

type CreatedShare = {
  url: string;
  passcode: string;
  clientName: string;
};

export function PublicSharePanel({
  resourceType,
  resourceId,
  locale,
  canWrite,
}: {
  resourceType: PublicShareResourceType;
  resourceId: string;
  locale: string;
  canWrite: boolean;
}) {
  const en = locale === "en";
  const tUi = useUiT();
  const apiBase =
    resourceType === "TICKET"
      ? `/api/admin/tickets/${resourceId}/public-share`
      : `/api/admin/projects/${resourceId}/public-share`;

  const [shares, setShares] = useState<ShareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedShare | null>(null);

  const loadShares = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as ShareRow[];
      setShares(data);
    } catch {
      toast.error(tUi("could_not_load_links"));
    } finally {
      setLoading(false);
    }
  }, [apiBase, en]);

  useEffect(() => {
    void loadShares();
  }, [loadShares]);

  useEffect(() => {
    if (!dialogOpen) {
      setClientName("");
      setRecipientEmail("");
      setCreated(null);
    }
  }, [dialogOpen]);

  async function createShare() {
    const name = clientName.trim();
    if (!name) {
      toast.error(tUi("enter_the_client_name"));
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          recipientEmail: recipientEmail.trim() || undefined,
          sendEmail: Boolean(recipientEmail.trim()),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as CreatedShare & {
        error?: string;
        emailSent?: boolean;
      };
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setCreated({
        url: json.url,
        passcode: json.passcode,
        clientName: json.clientName,
      });
      if (recipientEmail.trim() && json.emailSent) {
        toast.success(tUi("email_sent"));
      } else if (recipientEmail.trim() && json.emailSent === false) {
        toast.warning(tUi("smtp_not_configured"));
      }
      await loadShares();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setCreating(false);
    }
  }

  async function revokeShare(shareId: string) {
    try {
      const res = await fetch(`${apiBase}/${shareId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(tUi("link_revoked"));
      await loadShares();
    } catch {
      toast.error(tUi("error"));
    }
  }

  async function regeneratePasscode(shareId: string) {
    try {
      const res = await fetch(`${apiBase}/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_passcode" }),
      });
      const json = (await res.json()) as { passcode?: string };
      if (!res.ok || !json.passcode) throw new Error("Failed");
      toast.success(tUi("passcode_updated"));
      await loadShares();
    } catch {
      toast.error(tUi("error"));
    }
  }

  async function sendShareEmail(shareId: string) {
    setSendingEmailId(shareId);
    try {
      const res = await fetch(`${apiBase}/${shareId}/send-email`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { error?: string; emailSent?: boolean };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      if (json.emailSent) toast.success(tUi("email_sent"));
      else toast.warning(tUi("smtp_not_configured"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setSendingEmailId(null);
    }
  }

  function copyText(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    toast.success(tUi("label_copied", { label }));
  }

  if (!canWrite && shares.length === 0 && !loading) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            {tUi("public_links")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tUi("clients_without_an_account_open_the_link_and_ent")}
          </p>
        </div>
        {canWrite && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button type="button" size="sm" variant="outline">
                  {tUi("create_link")}
                </Button>
              }
            />
            <DialogContent className={adminWhiteDialogClassName}>
              <DialogHeader>
                <DialogTitle>{tUi("public_link")}</DialogTitle>
              </DialogHeader>
              {created ? (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    {tUi("copy_the_url_and_passcode_the_code_stays_visible")}
                  </p>
                  <div>
                    <Label>{tUi("client_2")}</Label>
                    <p className="font-medium">{created.clientName}</p>
                  </div>
                  <div>
                    <Label>{tUi("url")}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input readOnly value={created.url} className={adminWhiteInputClassName} />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyText(created.url, "URL")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>{tUi("passcode")}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        readOnly
                        value={created.passcode}
                        className={`font-mono tracking-widest ${adminWhiteInputClassName}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyText(created.passcode, tUi("passcode"))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="button" className="w-full" onClick={() => setDialogOpen(false)}>
                    {tUi("close")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="share-client-name">{tUi("client_name")}</Label>
                    <Input
                      id="share-client-name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={tUi("e_g_agim_hoxha")}
                      className={`mt-1 ${adminWhiteInputClassName}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="share-recipient-email">
                      {tUi("client_email_optional")}
                    </Label>
                    <Input
                      id="share-recipient-email"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className={`mt-1 ${adminWhiteInputClassName}`}
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    disabled={creating}
                    onClick={() => void createShare()}
                  >
                    {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {tUi("generate_link_and_passcode")}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          {tUi("loading")}
        </p>
      ) : shares.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {tUi("no_public_links_yet")}
        </p>
      ) : (
        <ul className="space-y-2">
          {shares.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-lg border border-border/50 px-3 py-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{s.clientName}</p>
                {s.isActive && s.passcode ? (
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{tUi("passcode")}:</span>
                    <span className="font-mono font-semibold tracking-widest text-foreground">
                      {s.passcode}
                    </span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                      onClick={() => copyText(s.passcode!, tUi("passcode"))}
                    >
                      {tUi("copy")}
                    </button>
                  </p>
                ) : s.isActive && !s.passcode ? (
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    {tUi("passcode_unknown_regenerate_to_set_a_new_one")}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.isActive
                    ? tUi("active")
                    : s.revokedAt
                      ? tUi("revoked")
                      : tUi("expired")}
                  {s.lastAccessAt &&
                    ` · ${tUi("last_access")}: ${new Date(s.lastAccessAt).toLocaleDateString(en ? "en-GB" : "sq-AL")}`}
                </p>
              </div>
              {canWrite && s.isActive && (
                <div className="flex flex-wrap gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title={tUi("copy_url")}
                    onClick={() => copyText(s.url, "URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {s.passcode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={tUi("copy_passcode")}
                      onClick={() => copyText(s.passcode!, tUi("passcode"))}
                    >
                      <span className="text-[10px] font-bold font-mono">#</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title={tUi("new_passcode")}
                    onClick={() => void regeneratePasscode(s.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {s.recipientEmail ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={tUi("send_email")}
                      disabled={sendingEmailId === s.id}
                      onClick={() => void sendShareEmail(s.id)}
                    >
                      {sendingEmailId === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title={tUi("revoke")}
                    onClick={() => void revokeShare(s.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
