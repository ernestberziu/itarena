"use client";

import { cn, formatDateTime } from "@/lib/utils";
import type { CalendarReplyRow } from "@/lib/calendar/types";

export function ReportReplyThread({
  replies,
  currentUserId,
  adminFeedbackLabel,
}: {
  replies: CalendarReplyRow[];
  currentUserId: string;
  adminFeedbackLabel: string;
}) {
  if (replies.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-border/60 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {adminFeedbackLabel}
      </p>
      <div className="space-y-3">
        {replies.map((reply) => {
          const isOwn = reply.author.id === currentUserId;
          const name = `${reply.author.firstName} ${reply.author.lastName}`.trim();
          return (
            <div
              key={reply.id}
              className={cn("flex w-full flex-col", isOwn ? "items-end" : "items-start")}
            >
              <p className="mb-1 px-1 text-xs font-semibold text-muted-foreground">{name}</p>
              <div
                className={cn(
                  "max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                  isOwn
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border/60 bg-white dark:bg-white"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{reply.body}</p>
                <p
                  className={cn(
                    "mt-1.5 text-[10px]",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {formatDateTime(reply.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
