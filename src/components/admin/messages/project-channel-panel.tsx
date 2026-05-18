"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ConversationDetail } from "@/lib/messages/types";
import { ConversationThread } from "./conversation-thread";

const PANEL_HEIGHT =
  "flex h-[min(520px,58vh)] min-h-[400px] w-full flex-col overflow-hidden";

/**
 * Project workspace Messages tab: single PROJECT channel thread only.
 * Messages appear in the global Messages inbox under the Project filter.
 */
export function ProjectChannelPanel({
  projectId,
  currentUserId,
  canWrite,
  className,
}: {
  projectId: string;
  currentUserId: string;
  canWrite: boolean;
  className?: string;
}) {
  const t = useTranslations("admin.messagesPage");
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadChannel = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const listRes = await fetch(
        `/api/admin/conversations?projectId=${encodeURIComponent(projectId)}&type=PROJECT&pageSize=1`
      );
      if (!listRes.ok) {
        setError(true);
        setDetail(null);
        return;
      }
      const list = (await listRes.json()) as { items: { id: string }[] };
      const channelId = list.items[0]?.id;
      if (!channelId) {
        setDetail(null);
        return;
      }
      const detailRes = await fetch(`/api/admin/conversations/${channelId}`);
      if (!detailRes.ok) {
        setError(true);
        setDetail(null);
        return;
      }
      setDetail((await detailRes.json()) as ConversationDetail);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadChannel();
  }, [loadChannel]);

  if (loading) {
    return (
      <div className={cn(PANEL_HEIGHT, "items-center justify-center bg-muted/10", className)}>
        <p className="text-sm text-muted-foreground">{t("searchLoading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(PANEL_HEIGHT, "items-center justify-center bg-muted/10 p-6 text-center", className)}
      >
        <p className="text-sm text-muted-foreground">{t("searchError")}</p>
      </div>
    );
  }

  return (
    <div className={cn(PANEL_HEIGHT, className)}>
      <ConversationThread
        embedded
        conversation={detail}
        currentUserId={currentUserId}
        canWrite={canWrite}
        onMessageSent={() => void loadChannel()}
      />
    </div>
  );
}
