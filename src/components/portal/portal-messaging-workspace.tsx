"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import type { ConversationDetail, ConversationListRow, ConversationMessageRow, ConversationType } from "@/lib/messages/types";
import { portalAuthorDisplayName, isPortalStaffRole } from "@/lib/portal/client-branding";
import { resolveCommentAuthor } from "@/lib/public-share/guest-author";

type Filter = "ALL" | ConversationType;
const POLL_MS = 12_000;

function PortalConversationList({
  items,
  selectedId,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onSelect,
  loading,
  locale,
}: {
  items: ConversationListRow[];
  selectedId: string | null;
  filter: Filter;
  search: string;
  onFilterChange: (f: Filter) => void;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  loading?: boolean;
  locale: "sq" | "en";
}) {
  const t = useTranslations("portal.messagesPage");

  const filters: { id: Filter; label: string }[] = [
    { id: "ALL", label: t("filterAll") },
    { id: "DIRECT", label: t("filterDirect") },
    { id: "GROUP", label: t("filterGroups") },
    { id: "PROJECT", label: t("filterProject") },
  ];

  const filtered = useMemo(
    () => (filter === "ALL" ? items : items.filter((c) => c.type === filter)),
    [filter, items]
  );

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border/60 bg-muted/10">
      <div className="shrink-0 space-y-3 border-b border-border/60 p-3">
        <h2 className="text-sm font-semibold">{t("inbox")}</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchConversations")}
            className="h-9 bg-white pl-8 text-sm dark:bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-white text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading && filtered.length === 0 ? (
          <li className="py-8 text-center text-xs text-muted-foreground">{t("loading")}</li>
        ) : null}
        {!loading && filtered.length === 0 ? (
          <li className="py-8 text-center text-sm text-muted-foreground">{t("noConversations")}</li>
        ) : null}
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                selectedId === c.id
                  ? "bg-white shadow-sm ring-1 ring-border/60"
                  : "hover:bg-white/70"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="truncate text-sm font-medium">{c.displayTitle}</span>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {c.unreadCount > 9 ? "9+" : c.unreadCount}
                  </span>
                )}
              </div>
              {c.lastMessage ? (
                <p className="truncate text-xs text-muted-foreground">{c.lastMessage.body}</p>
              ) : (
                <p className="text-xs italic text-muted-foreground">{t("noMessagesYet")}</p>
              )}
              {c.lastMessageAt && (
                <p className="text-[10px] text-muted-foreground">
                  {timeAgo(new Date(c.lastMessageAt))}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PortalConversationListMemo = memo(PortalConversationList);

function PortalMessageBubble({
  message,
  isOwn,
  currentUserId,
  locale,
}: {
  message: ConversationMessageRow;
  isOwn: boolean;
  currentUserId: string;
  locale: "sq" | "en";
}) {
  const name =
    message.author && isPortalStaffRole(message.author.role)
      ? portalAuthorDisplayName(message.author, currentUserId, locale)
      : resolveCommentAuthor(message.author, message.guestAuthorName, locale).displayName;

  return (
    <div className={cn("flex w-full flex-col", isOwn ? "items-end" : "items-start")}>
      <p
        className={cn(
          "mb-1 max-w-[min(100%,28rem)] truncate px-1 text-xs font-semibold",
          isOwn ? "text-right text-muted-foreground" : "text-foreground"
        )}
      >
        {name}
      </p>
      <div
        className={cn(
          "max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/60 bg-white dark:bg-white"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        <p
          className={cn(
            "mt-1.5 text-[10px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatDateTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function PortalConversationThread({
  conversation,
  currentUserId,
  locale,
  onBack,
}: {
  conversation: ConversationDetail | null;
  currentUserId: string;
  locale: "sq" | "en";
  onBack?: () => void;
}) {
  const t = useTranslations("portal.messagesPage");
  const [messages, setMessages] = useState<ConversationMessageRow[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const lastCreatedAtRef = useRef<string | null>(null);

  const loadMessages = useCallback(async (conversationId: string, since?: string) => {
    const url = since
      ? `/api/portal/conversations/${conversationId}/messages?since=${encodeURIComponent(since)}`
      : `/api/portal/conversations/${conversationId}/messages`;
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

    void fetch(`/api/portal/conversations/${id}/read`, { method: "POST" });

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage() {
    if (!conversation?.id || !body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/portal/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      const msg = (await res.json()) as ConversationMessageRow;
      setBody("");
      setMessages((prev) => {
        const merged = [...prev, msg];
        lastCreatedAtRef.current = msg.createdAt;
        return merged;
      });
    } finally {
      setSending(false);
    }
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t("selectConversation")}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-4 py-3">
        {onBack ? (
          <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 md:hidden" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{conversation.displayTitle}</h2>
          <p className="text-xs text-muted-foreground">{t("withItArena")}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t("noMessagesYet")}</p>
        ) : (
          messages.map((msg) => (
            <PortalMessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.author?.id === currentUserId}
              currentUserId={currentUserId}
              locale={locale}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 space-y-2 border-t border-border/60 bg-muted/10 p-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={t("messagePlaceholder")}
        />
        <Button size="sm" disabled={sending || !body.trim()} onClick={() => void sendMessage()}>
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("send")}
        </Button>
      </div>
    </div>
  );
}

export function PortalMessagingWorkspace({
  currentUserId,
  locale,
  className,
  initialConversationId,
}: {
  currentUserId: string;
  locale: "sq" | "en";
  className?: string;
  initialConversationId?: string;
}) {
  const [conversations, setConversations] = useState<ConversationListRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(() => initialConversationId ?? null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [mobilePane, setMobilePane] = useState<"list" | "thread">(
    () => (initialConversationId ? "thread" : "list")
  );

  const filterRef = useRef(filter);
  const searchRef = useRef(search);
  filterRef.current = filter;
  searchRef.current = search;

  const loadList = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoadingList(true);
    try {
      const p = new URLSearchParams();
      const activeFilter = filterRef.current;
      const q = searchRef.current.trim();
      if (activeFilter !== "ALL") p.set("type", activeFilter);
      if (q) p.set("q", q);
      p.set("pageSize", "100");

      const res = await fetch(`/api/portal/conversations?${p.toString()}`);
      if (!res.ok) {
        setConversations([]);
        return;
      }

      const data = (await res.json()) as { items: ConversationListRow[] };
      setConversations(data.items);

      setSelectedId((prev) => {
        if (prev && data.items.some((c) => c.id === prev)) return prev;
        if (data.items.length === 0) return null;
        return data.items[0]!.id;
      });
    } finally {
      if (!options?.silent) setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const delay = search.trim() ? 280 : 0;
    const timer = window.setTimeout(() => void loadList(), delay);
    return () => window.clearTimeout(timer);
  }, [filter, search, loadList]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void (async () => {
      const res = await fetch(`/api/portal/conversations/${selectedId}`);
      if (!res.ok) {
        setDetail(null);
        return;
      }
      setDetail((await res.json()) as ConversationDetail);
    })();
  }, [selectedId]);

  const selectConversation = useCallback((id: string) => {
    setSelectedId(id);
    setMobilePane("thread");
  }, []);

  return (
    <div
      className={cn(
        "admin-card-elevated grid h-[calc(100vh-12rem)] min-h-[480px] overflow-hidden rounded-2xl border bg-card md:grid-cols-[minmax(0,20rem)_1fr]",
        className
      )}
    >
      <div className={cn("min-h-0", mobilePane === "thread" ? "hidden md:block" : "block")}>
        <PortalConversationListMemo
          items={conversations}
          selectedId={selectedId}
          filter={filter}
          search={search}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onSelect={selectConversation}
          loading={loadingList}
          locale={locale}
        />
      </div>
      <div className={cn("min-h-0", mobilePane === "list" ? "hidden md:block" : "block")}>
        <PortalConversationThread
          conversation={detail}
          currentUserId={currentUserId}
          locale={locale}
          onBack={() => setMobilePane("list")}
        />
      </div>
    </div>
  );
}
