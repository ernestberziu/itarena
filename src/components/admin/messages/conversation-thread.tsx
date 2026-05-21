"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConversationDetail, ConversationMessageRow } from "@/lib/messages/types";
import { MessageBubble } from "./message-bubble";

const POLL_MS = 12_000;

function ConversationThreadInner({
  conversation,
  currentUserId,
  canWrite,
  embedded,
  onBack,
  onShowParticipants,
  onMessageSent,
  projectHref,
}: {
  conversation: ConversationDetail | null;
  currentUserId: string;
  canWrite: boolean;
  embedded?: boolean;
  onBack?: () => void;
  onShowParticipants?: () => void;
  onMessageSent?: () => void;
  projectHref?: string;
}) {
  const t = useTranslations("admin.messagesPage");
  const [messages, setMessages] = useState<ConversationMessageRow[]>([]);
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const lastCreatedAtRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef(0);

  const loadMessages = useCallback(async (conversationId: string, since?: string) => {
    const url = since
      ? `/api/admin/conversations/${conversationId}/messages?since=${encodeURIComponent(since)}`
      : `/api/admin/conversations/${conversationId}/messages`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as { items: ConversationMessageRow[] };
  }, []);

  useEffect(() => {
    const id = conversation?.id ?? null;
    conversationIdRef.current = id;

    if (!id) {
      setMessages([]);
      setLoading(false);
      lastCreatedAtRef.current = null;
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMessages([]);
    lastCreatedAtRef.current = null;

    void (async () => {
      const data = await loadMessages(id);
      if (cancelled || conversationIdRef.current !== id) return;
      const items = data?.items ?? [];
      setMessages(items);
      lastCreatedAtRef.current = items[items.length - 1]?.createdAt ?? null;
      setLoading(false);
    })();

    void fetch(`/api/admin/conversations/${id}/read`, { method: "POST" });

    const poll = window.setInterval(() => {
      const activeId = conversationIdRef.current;
      const since = lastCreatedAtRef.current;
      if (!activeId || !since) return;

      void loadMessages(activeId, since).then((data) => {
        if (!data || conversationIdRef.current !== activeId) return;
        if (data.items.length === 0) return;
        setMessages((prev) => {
          const merged = [...prev, ...data.items];
          lastCreatedAtRef.current = merged[merged.length - 1]?.createdAt ?? since;
          return merged;
        });
      });
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [conversation?.id, loadMessages]);

  useEffect(() => {
    setIsInternal(false);
  }, [conversation?.id]);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const allowInternal = conversation?.type === "PROJECT";

  const selfAuthor = useCallback((): ConversationMessageRow["author"] => {
    const me = conversation?.participants.find((p) => p.userId === currentUserId);
    return {
      id: currentUserId,
      firstName: me?.firstName ?? "",
      lastName: me?.lastName ?? "",
      role: me?.role ?? "ADMIN",
    };
  }, [conversation?.participants, currentUserId]);

  const send = useCallback(async () => {
    if (!conversation || !body.trim()) return;
    setSending(true);
    const internal = allowInternal && isInternal;
    const optimistic: ConversationMessageRow = {
      id: `opt-${Date.now()}`,
      body: body.trim(),
      isInternal: internal,
      createdAt: new Date().toISOString(),
      author: selfAuthor(),
    };
    setMessages((m) => {
      const next = [...m, optimistic];
      lastCreatedAtRef.current = optimistic.createdAt;
      return next;
    });
    const text = body.trim();
    setBody("");
    setIsInternal(false);

    try {
      const res = await fetch(`/api/admin/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, isInternal: internal }),
      });
      if (!res.ok) throw new Error();
      const msg = (await res.json()) as ConversationMessageRow;
      setMessages((m) => {
        const next = m.map((x) => (x.id === optimistic.id ? msg : x));
        lastCreatedAtRef.current = msg.createdAt;
        return next;
      });
      onMessageSent?.();
    } catch {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      toast.error(t("searchError"));
    } finally {
      setSending(false);
    }
  }, [
    allowInternal,
    body,
    conversation,
    isInternal,
    onMessageSent,
    selfAuthor,
    t,
  ]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send();
      }
    },
    [send]
  );

  if (!conversation) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 flex-col items-center justify-center p-8 text-center",
          embedded ? "bg-muted/10" : "bg-background"
        )}
      >
        <p className="text-sm text-muted-foreground">
          {embedded ? t("noMessagesYet") : t("selectConversation")}
        </p>
      </div>
    );
  }

  const typeBadge =
    conversation.type === "PROJECT"
      ? t("filterProject")
      : conversation.type === "GROUP"
        ? t("group")
        : t("direct");

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col",
        embedded ? "bg-card" : "bg-background"
      )}
    >
      {!embedded && (
        <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2.5">
          {onBack && (
            <Button variant="outline" size="icon" className="h-8 w-8 lg:hidden" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{conversation.displayTitle}</p>
            <Badge variant="outline" className="mt-0.5 text-[10px]">
              {typeBadge}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {projectHref && conversation.type === "PROJECT" && (
              <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                <Link href={projectHref}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("openProject")}</span>
                </Link>
              </Button>
            )}
            {onShowParticipants && (
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={onShowParticipants}>
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("participants")}</span>
              </Button>
            )}
          </div>
        </header>
      )}

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5",
          embedded && "bg-muted/15"
        )}
      >
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">{t("searchLoading")}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{t("noMessagesYet")}</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                isOwn={m.author?.id === currentUserId}
                internalLabel={t("internal")}
                showSenderName
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {canWrite && (
        <footer
          className={cn(
            "shrink-0 space-y-2 border-t border-border/60 p-4 md:px-5",
            embedded ? "bg-card" : "bg-muted/10"
          )}
        >
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("writeMessage")}
            rows={embedded ? 2 : 3}
            className="resize-none border-border/60 bg-white shadow-sm dark:bg-white"
            disabled={sending}
          />
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              conversation.type === "PROJECT" ? "justify-between" : "justify-end"
            )}
          >
            {conversation.type === "PROJECT" ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={isInternal}
                  onCheckedChange={(v) => setIsInternal(v === true)}
                  disabled={sending}
                />
                {t("internalNote")}
              </label>
            ) : null}
            <Button size="sm" disabled={!body.trim() || sending} onClick={() => void send()}>
              {sending ? t("sending") : t("send")}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

export const ConversationThread = memo(ConversationThreadInner);
