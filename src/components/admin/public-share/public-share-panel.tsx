"use client";

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
  const t = (sq: string, e: string) => (en ? e : sq);
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
      toast.error(t("Nuk u ngarkuan lidhjet", "Could not load links"));
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
      toast.error(t("Vendos emrin e klientit", "Enter the client name"));
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
        toast.success(t("Email u dërgua", "Email sent"));
      } else if (recipientEmail.trim() && json.emailSent === false) {
        toast.warning(t("SMTP jo i konfiguruar", "SMTP not configured"));
      }
      await loadShares();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setCreating(false);
    }
  }

  async function revokeShare(shareId: string) {
    try {
      const res = await fetch(`${apiBase}/${shareId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("Lidhja u çaktivizua", "Link revoked"));
      await loadShares();
    } catch {
      toast.error(t("Gabim", "Error"));
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
      toast.success(t("Kodi u përditësua", "Passcode updated"));
      await loadShares();
    } catch {
      toast.error(t("Gabim", "Error"));
    }
  }

  async function sendShareEmail(shareId: string) {
    setSendingEmailId(shareId);
    try {
      const res = await fetch(`${apiBase}/${shareId}/send-email`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { error?: string; emailSent?: boolean };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      if (json.emailSent) toast.success(t("Email u dërgua", "Email sent"));
      else toast.warning(t("SMTP jo i konfiguruar", "SMTP not configured"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setSendingEmailId(null);
    }
  }

  function copyText(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    toast.success(t(`${label} u kopjua`, `${label} copied`));
  }

  if (!canWrite && shares.length === 0 && !loading) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            {t("Lidhje publike", "Public links")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              "Klienti pa llogari hap lidhjen dhe fut kodin.",
              "Clients without an account open the link and enter the passcode."
            )}
          </p>
        </div>
        {canWrite && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button type="button" size="sm" variant="outline">
                  {t("Krijo lidhje", "Create link")}
                </Button>
              }
            />
            <DialogContent className={adminWhiteDialogClassName}>
              <DialogHeader>
                <DialogTitle>{t("Lidhje publike", "Public link")}</DialogTitle>
              </DialogHeader>
              {created ? (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    {t(
                      "Kopjoni URL-në dhe kodin. Kodi mbetet i dukshëm te lista e lidhjeve.",
                      "Copy the URL and passcode. The code stays visible in the links list."
                    )}
                  </p>
                  <div>
                    <Label>{t("Klienti", "Client")}</Label>
                    <p className="font-medium">{created.clientName}</p>
                  </div>
                  <div>
                    <Label>{t("URL", "URL")}</Label>
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
                    <Label>{t("Kodi", "Passcode")}</Label>
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
                        onClick={() => copyText(created.passcode, t("Kodi", "Passcode"))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="button" className="w-full" onClick={() => setDialogOpen(false)}>
                    {t("Mbyll", "Close")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="share-client-name">{t("Emri i klientit", "Client name")}</Label>
                    <Input
                      id="share-client-name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={t("p.sh. Agim Hoxha", "e.g. Agim Hoxha")}
                      className={`mt-1 ${adminWhiteInputClassName}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="share-recipient-email">
                      {t("Email i klientit (opsional)", "Client email (optional)")}
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
                    {t("Gjenero lidhje dhe kod", "Generate link and passcode")}
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
          {t("Duke ngarkuar…", "Loading…")}
        </p>
      ) : shares.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("Asnjë lidhje publike.", "No public links yet.")}
        </p>
      ) : (
        <ul className="space-y-2">
          {shares.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{s.clientName}</p>
                {s.isActive && s.passcode ? (
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{t("Kodi", "Passcode")}:</span>
                    <span className="font-mono font-semibold tracking-widest text-foreground">
                      {s.passcode}
                    </span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                      onClick={() => copyText(s.passcode!, t("Kodi", "Passcode"))}
                    >
                      {t("Kopjo", "Copy")}
                    </button>
                  </p>
                ) : s.isActive && !s.passcode ? (
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    {t(
                      "Kodi i panjohur — gjeneroni kod të ri.",
                      "Passcode unknown — regenerate to set a new one."
                    )}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.isActive
                    ? t("Aktive", "Active")
                    : s.revokedAt
                      ? t("Çaktivizuar", "Revoked")
                      : t("Skaduar", "Expired")}
                  {s.lastAccessAt &&
                    ` · ${t("Hyrja e fundit", "Last access")}: ${new Date(s.lastAccessAt).toLocaleDateString(en ? "en-GB" : "sq-AL")}`}
                </p>
              </div>
              {canWrite && s.isActive && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title={t("Kopjo URL", "Copy URL")}
                    onClick={() => copyText(s.url, "URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {s.passcode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={t("Kopjo kodin", "Copy passcode")}
                      onClick={() => copyText(s.passcode!, t("Kodi", "Passcode"))}
                    >
                      <span className="text-[10px] font-bold font-mono">#</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title={t("Kod i ri", "New passcode")}
                    onClick={() => void regeneratePasscode(s.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {s.recipientEmail ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={t("Dërgo email", "Send email")}
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
                    title={t("Çaktivizo", "Revoke")}
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
