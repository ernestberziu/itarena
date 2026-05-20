"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import {
  portalAuthorDisplayName,
} from "@/lib/portal/client-branding";

type MessageRow = {
  id: string;
  body: string;
  createdAt: string;
  author: { id?: string; firstName: string; lastName: string; role: string };
};

export function PortalProjectMessages({
  projectId,
  locale,
  initialMessages,
  currentUserId,
}: {
  projectId: string;
  locale: string;
  initialMessages: MessageRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const lang = locale === "en" ? "en" : "sq";
  const t = (sq: string, en: string) => (locale === "sq" ? sq : en);
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/portal/projects/${projectId}/messages`);
    if (!res.ok) return;
    const data = (await res.json()) as MessageRow[];
    setMessages(data);
  }, [projectId]);

  async function sendMessage() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/portal/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      setBody("");
      toast.success(t("Mesazhi u dërgua", "Message sent"));
      await refresh();
      router.refresh();
    } catch {
      toast.error(t("Gabim gjatë dërgimit", "Failed to send message"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="max-h-[min(420px,50vh)] divide-y divide-border/60 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t("Nuk ka mesazhe ende. Shkruani ekipit tonë.", "No messages yet. Write to our team.")}
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1 px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground">
                {portalAuthorDisplayName(msg.author, currentUserId, lang)} · {formatDateTime(msg.createdAt)}
              </p>
              <p className="whitespace-pre-wrap text-sm">{msg.body}</p>
            </div>
          ))
        )}
      </div>
      <div className="space-y-3 border-t border-border/60 bg-muted/15 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          {t("Shkruani mesazh", "Write a message")}
        </div>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={t("Mesazhi juaj për IT Arena…", "Your message to IT Arena…")}
        />
        <Button size="sm" disabled={sending || !body.trim()} onClick={() => void sendMessage()}>
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("Dërgo", "Send")}
        </Button>
      </div>
    </div>
  );
}
