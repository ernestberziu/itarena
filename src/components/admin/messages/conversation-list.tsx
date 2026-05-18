"use client";

import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConversationListRow, ConversationType } from "@/lib/messages/types";

type Filter = "ALL" | ConversationType;

function ConversationListInner({
  items,
  selectedId,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onSelect,
  onNewConversation,
  loading,
}: {
  items: ConversationListRow[];
  selectedId: string | null;
  filter: Filter;
  search: string;
  onFilterChange: (f: Filter) => void;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  loading?: boolean;
}) {
  const t = useTranslations("admin.messagesPage");

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
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{t("inbox")}</h2>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={onNewConversation}>
            <Plus className="h-3.5 w-3.5" />
            {t("new")}
          </Button>
        </div>
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
          <li className="py-8 text-center text-xs text-muted-foreground">{t("searchLoading")}</li>
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
                <p className="truncate text-xs text-muted-foreground">
                  {c.lastMessage.isInternal ? `[${t("internal")}] ` : ""}
                  {c.lastMessage.body}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">{t("noMessagesYet")}</p>
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

export const ConversationList = memo(ConversationListInner);
