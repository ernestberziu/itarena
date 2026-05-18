"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { ConversationDetail, ConversationListRow, ConversationType } from "@/lib/messages/types";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";
import { ConversationParticipants } from "./conversation-participants";
import { NewConversationDialog } from "./new-conversation-dialog";

type Filter = "ALL" | ConversationType;

export function MessagingWorkspace({
  currentUserId,
  canWrite,
  className,
  initialConversationId,
}: {
  currentUserId: string;
  canWrite: boolean;
  className?: string;
  initialConversationId?: string;
}) {
  const locale = useLocale();
  const listPrefix = locale === "sq" ? "" : `/${locale}`;

  const [conversations, setConversations] = useState<ConversationListRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => initialConversationId ?? null
  );
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [filter, setFilter] = useState<Filter>(() =>
    initialConversationId ? "DIRECT" : "ALL"
  );
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<"list" | "thread" | "participants">(() =>
    initialConversationId ? "thread" : "list"
  );
  const [showParticipants, setShowParticipants] = useState(false);

  const filterRef = useRef(filter);
  const searchRef = useRef(search);
  filterRef.current = filter;
  searchRef.current = search;

  const pendingInitialId = useRef(initialConversationId);
  const listRequestRef = useRef(0);
  const detailRequestRef = useRef(0);

  const loadList = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = ++listRequestRef.current;
    if (!options?.silent) setLoadingList(true);
    try {
      const p = new URLSearchParams();
      const activeFilter = filterRef.current;
      const q = searchRef.current.trim();
      if (activeFilter !== "ALL") p.set("type", activeFilter);
      if (q) p.set("q", q);
      p.set("pageSize", "100");

      const res = await fetch(`/api/admin/conversations?${p.toString()}`);
      if (requestId !== listRequestRef.current) return;
      if (!res.ok) {
        setConversations([]);
        return;
      }

      const data = (await res.json()) as { items: ConversationListRow[] };
      setConversations(data.items);

      const pending = pendingInitialId.current;
      if (pending && data.items.some((c) => c.id === pending)) {
        pendingInitialId.current = undefined;
        setSelectedId(pending);
        setMobilePane("thread");
        return;
      }

      setSelectedId((prev) => {
        if (prev && data.items.some((c) => c.id === prev)) return prev;
        if (data.items.length === 0) return null;
        return data.items[0]!.id;
      });
    } finally {
      if (requestId === listRequestRef.current && !options?.silent) {
        setLoadingList(false);
      }
    }
  }, []);

  const refreshList = useCallback(() => void loadList({ silent: true }), [loadList]);

  useEffect(() => {
    const delay = search.trim() ? 280 : 0;
    const timer = window.setTimeout(() => void loadList(), delay);
    return () => window.clearTimeout(timer);
  }, [filter, search, loadList]);

  const loadDetail = useCallback(async (id: string) => {
    const requestId = ++detailRequestRef.current;
    const res = await fetch(`/api/admin/conversations/${id}`);
    if (requestId !== detailRequestRef.current) return;
    if (!res.ok) {
      setDetail(null);
      return;
    }
    setDetail((await res.json()) as ConversationDetail);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (detail?.type !== "GROUP") {
      setShowParticipants(false);
      setMobilePane((pane) => (pane === "participants" ? "thread" : pane));
    }
  }, [detail?.id, detail?.type]);

  const selectConversation = useCallback((id: string) => {
    setSelectedId(id);
    setMobilePane("thread");
  }, []);

  const onCreated = useCallback(
    (id: string) => {
      void loadList({ silent: true });
      selectConversation(id);
    },
    [loadList, selectConversation]
  );

  const handleBack = useCallback(() => setMobilePane("list"), []);
  const handleNewConversation = useCallback(() => setNewOpen(true), []);
  const handleShowParticipants = useCallback(() => {
    setShowParticipants(true);
    setMobilePane("participants");
  }, []);
  const handleCloseParticipants = useCallback(() => {
    setShowParticipants(false);
    setMobilePane("thread");
  }, []);
  const handleParticipantsUpdated = useCallback(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const projectHref = useMemo(
    () =>
      detail?.type === "PROJECT" && detail.projectId
        ? `${listPrefix}/admin/projects/${detail.projectId}`
        : undefined,
    [detail?.type, detail?.projectId, listPrefix]
  );

  const canManageGroup = canWrite && detail?.type === "GROUP";
  const showParticipantsPane = detail?.type === "GROUP" && showParticipants;

  return (
    <div
      className={cn(
        "flex h-[min(720px,calc(100vh-14rem))] min-h-[420px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "w-full shrink-0 lg:w-72 xl:w-80",
          mobilePane !== "list" && "hidden lg:block"
        )}
      >
        <MemoConversationList
          items={conversations}
          selectedId={selectedId}
          filter={filter}
          search={search}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onSelect={selectConversation}
          onNewConversation={handleNewConversation}
          loading={loadingList}
        />
      </div>

      <div
        className={cn(
          "min-w-0 flex-1",
          mobilePane !== "thread" && "hidden lg:flex lg:flex-col"
        )}
      >
        <MemoConversationThread
          conversation={detail}
          currentUserId={currentUserId}
          canWrite={canWrite}
          projectHref={projectHref}
          onBack={handleBack}
          onShowParticipants={detail?.type === "GROUP" ? handleShowParticipants : undefined}
          onMessageSent={refreshList}
        />
      </div>

      {showParticipantsPane && detail && (
        <div
          className={cn(
            "hidden w-64 shrink-0 xl:block",
            mobilePane === "participants" && "block w-full lg:w-64"
          )}
        >
          <ConversationParticipants
            conversation={detail}
            canManage={canManageGroup}
            onClose={handleCloseParticipants}
            onUpdated={handleParticipantsUpdated}
          />
        </div>
      )}

      <NewConversationDialog open={newOpen} onOpenChange={setNewOpen} onCreated={onCreated} />
    </div>
  );
}

const MemoConversationList = ConversationList;
const MemoConversationThread = ConversationThread;
