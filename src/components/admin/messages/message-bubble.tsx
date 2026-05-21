"use client";

import { cn, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ConversationMessageRow } from "@/lib/messages/types";
import { isStaffRole } from "@/lib/messages/access";
import { resolveCommentAuthor } from "@/lib/public-share/guest-author";

function authorDisplayName(message: ConversationMessageRow) {
  return resolveCommentAuthor(message.author, message.guestAuthorName, "sq").displayName;
}

export function MessageBubble({
  message,
  isOwn,
  internalLabel,
  showSenderName = true,
}: {
  message: ConversationMessageRow;
  isOwn: boolean;
  internalLabel: string;
  /** When true, show name on your own messages too (default on). */
  showSenderName?: boolean;
}) {
  const name = authorDisplayName(message);
  const showName = Boolean(name) && (!isOwn || showSenderName);
  const staff = message.author != null && isStaffRole(message.author.role);

  return (
    <div className={cn("flex w-full flex-col", isOwn ? "items-end" : "items-start")}>
      {showName && (
        <p
          className={cn(
            "mb-1 max-w-[min(100%,28rem)] truncate px-1 text-xs font-semibold",
            isOwn ? "text-right text-muted-foreground" : "text-foreground"
          )}
        >
          {name}
          {!staff && !isOwn && (
            <span className="ml-1.5 font-normal text-muted-foreground">· Client</span>
          )}
        </p>
      )}
      <div
        className={cn(
          "max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "border border-border/60 bg-white rounded-bl-md dark:bg-white",
          message.isInternal &&
            !isOwn &&
            "border-amber-200/80 bg-amber-50/90 dark:bg-amber-50",
          message.isInternal && isOwn && "ring-1 ring-amber-300/50"
        )}
      >
        {message.isInternal && (
          <Badge
            variant="outline"
            className={cn(
              "mb-1.5 text-[10px]",
              isOwn
                ? "border-amber-200/80 bg-amber-400/20 text-primary-foreground"
                : "border-amber-300/80 bg-amber-100/50"
            )}
          >
            {internalLabel}
          </Badge>
        )}
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
