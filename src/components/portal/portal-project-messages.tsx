"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { portalAuthorDisplayName, isPortalStaffRole } from "@/lib/portal/client-branding";
import { resolveCommentAuthor } from "@/lib/public-share/guest-author";

type MessageRow = {
  id: string;
  body: string;
  createdAt: string;
  guestAuthorName?: string | null;
  author: { id?: string; firstName: string; lastName: string; role: string } | null;
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
  const tUi = useUiT();
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
      toast.success(tUi("message_sent"));
      await refresh();
      router.refresh();
    } catch {
      toast.error(tUi("failed_to_send_message"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="max-h-[min(420px,50vh)] divide-y divide-border/60 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {tUi("no_messages_yet_write_to_our_team")}
          </p>
        ) : (
          messages.map((msg) => {
            const label =
              msg.author && isPortalStaffRole(msg.author.role)
                ? portalAuthorDisplayName(msg.author, currentUserId, lang)
                : resolveCommentAuthor(msg.author, msg.guestAuthorName, lang).displayName;
            return (
            <div key={msg.id} className="space-y-1 px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground">
                {label} · {formatDateTime(msg.createdAt)}
              </p>
              <p className="whitespace-pre-wrap text-sm">{msg.body}</p>
            </div>
            );
          })
        )}
      </div>
      <div className="space-y-3 border-t border-border/60 bg-muted/15 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          {tUi("write_a_message")}
        </div>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={tUi("your_message_to_it_arena")}
        />
        <Button size="sm" disabled={sending || !body.trim()} onClick={() => void sendMessage()}>
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {tUi("send")}
        </Button>
      </div>
    </div>
  );
}
