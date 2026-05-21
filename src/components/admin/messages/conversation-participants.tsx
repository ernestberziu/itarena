"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Crown, UserMinus, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isStaffRole } from "@/lib/messages/access";
import type { ConversationDetail } from "@/lib/messages/types";
import {
  ParticipantPicker,
  type SelectedParticipant,
} from "@/components/admin/messages/participant-picker";

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

function ParticipantRow({
  firstName,
  lastName,
  email,
  role,
  isCreator,
  canRemove,
  onRemove,
  staffLabel,
  clientLabel,
  adminLabel,
  removeLabel,
}: {
  firstName: string;
  lastName: string;
  email: string | null;
  role: string;
  isCreator?: boolean;
  canRemove?: boolean;
  onRemove?: () => void;
  staffLabel: string;
  clientLabel: string;
  adminLabel: string;
  removeLabel: string;
}) {
  const staff = isStaffRole(role);

  return (
    <li className="group rounded-xl border border-border/60 bg-white p-3 shadow-sm transition-colors hover:border-border hover:shadow-md dark:bg-white">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white",
            staff ? "bg-primary/12 text-primary" : "bg-slate-100 text-slate-600"
          )}
          aria-hidden
        >
          {initials(firstName, lastName)}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {firstName} {lastName}
            </p>
            {isCreator ? (
              <Badge
                variant="outline"
                className="h-5 gap-0.5 border-amber-200/80 bg-amber-50 px-1.5 text-[10px] font-medium text-amber-900"
              >
                <Crown className="h-2.5 w-2.5" aria-hidden />
                {adminLabel}
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          <Badge
            variant="outline"
            className={cn(
              "h-5 text-[10px] font-medium uppercase tracking-wide",
              staff
                ? "border-primary/25 bg-primary/5 text-primary"
                : "border-border/80 bg-muted/40 text-muted-foreground"
            )}
          >
            {staff ? staffLabel : clientLabel}
          </Badge>
        </div>

        {canRemove && onRemove ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
            onClick={onRemove}
            aria-label={removeLabel}
          >
            <UserMinus className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export function ConversationParticipants({
  conversation,
  canManage,
  onClose,
  onUpdated,
}: {
  conversation: ConversationDetail | null;
  canManage: boolean;
  onClose?: () => void;
  onUpdated?: () => void;
}) {
  const t = useTranslations("admin.messagesPage");
  const [addingOpen, setAddingOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<SelectedParticipant[]>([]);
  const [adding, setAdding] = useState(false);

  const pickerLabels = {
    placeholder: t("searchParticipants"),
    empty: t("searchEmpty"),
    loading: t("searchLoading"),
    error: t("searchError"),
    minChars: t("searchMinChars"),
    staff: t("staff"),
    client: t("client"),
  };

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
        {t("selectConversation")}
      </div>
    );
  }

  const conv = conversation;
  const existingIds = conv.participants.map((p) => p.userId);
  const canAdd = canManage && conv.type === "GROUP";

  async function removeParticipant(userId: string) {
    const res = await fetch(`/api/admin/conversations/${conv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeParticipantIds: [userId] }),
    });
    if (res.ok) onUpdated?.();
    else toast.error(t("searchError"));
  }

  async function addParticipants() {
    if (pendingAdd.length === 0) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addParticipantIds: pendingAdd.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("participantsAdded"));
      setPendingAdd([]);
      setAddingOpen(false);
      onUpdated?.();
    } catch {
      toast.error(t("searchError"));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border/60 bg-muted/15">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-white/80 px-3 py-3 backdrop-blur-sm dark:bg-white/90">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{t("participants")}</h3>
          <p className="text-xs text-muted-foreground">
            {conv.participants.length}{" "}
            {conv.participants.length === 1 ? t("participantSingular") : t("participantPlural")}
          </p>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 bg-white dark:bg-white"
            onClick={onClose}
            aria-label={t("closeParticipants")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </header>

      {canAdd && (
        <div className="shrink-0 border-b border-border/60 p-3">
          {!addingOpen ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-full gap-1.5 border-dashed bg-white shadow-sm hover:bg-muted/30 dark:bg-white"
              onClick={() => setAddingOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t("addParticipants")}
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-border/60 bg-white p-3 shadow-sm dark:bg-white">
              <p className="text-xs font-medium text-muted-foreground">{t("addParticipantsHint")}</p>
              <ParticipantPicker
                selected={pendingAdd}
                onChange={setPendingAdd}
                labels={pickerLabels}
                excludeIds={existingIds}
                disabled={adding}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  disabled={pendingAdd.length === 0 || adding}
                  onClick={() => void addParticipants()}
                >
                  {adding ? t("searchLoading") : t("addToGroup")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-white"
                  disabled={adding}
                  onClick={() => {
                    setAddingOpen(false);
                    setPendingAdd([]);
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {conv.participants.map((p) => (
          <ParticipantRow
            key={p.userId}
            firstName={p.firstName}
            lastName={p.lastName}
            email={p.email}
            role={p.role}
            isCreator={p.userId === conv.createdById}
            canRemove={canAdd && p.userId !== conv.createdById}
            onRemove={() => void removeParticipant(p.userId)}
            staffLabel={t("staff")}
            clientLabel={t("client")}
            adminLabel={t("groupAdmin")}
            removeLabel={t("remove")}
          />
        ))}
      </ul>
    </div>
  );
}
