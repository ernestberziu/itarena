"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectModeTabs } from "@/components/admin/projects/project-mode-tabs";
import { ParticipantPicker, type SelectedParticipant } from "./participant-picker";
import { MessageSquare, Users } from "lucide-react";

export function NewConversationDialog({
  open,
  onOpenChange,
  onCreated,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversationId: string) => void;
  projectId?: string;
}) {
  const t = useTranslations("admin.messagesPage");
  const [mode, setMode] = useState<"DIRECT" | "GROUP">("DIRECT");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<SelectedParticipant[]>([]);
  const [creating, setCreating] = useState(false);

  const pickerLabels = {
    placeholder: t("searchParticipants"),
    empty: t("searchEmpty"),
    loading: t("searchLoading"),
    error: t("searchError"),
    minChars: t("searchMinChars"),
    staff: t("staff"),
    client: t("client"),
  };

  function reset() {
    setMode("DIRECT");
    setTitle("");
    setSelected([]);
  }

  async function create() {
    if (mode === "DIRECT" && selected.length !== 1) {
      toast.error(t("directNeedsOne"));
      return;
    }
    if (mode === "GROUP" && selected.length < 2) {
      toast.error(t("groupNeedsTwo"));
      return;
    }
    if (mode === "GROUP" && !title.trim()) {
      toast.error(t("groupTitleRequired"));
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          title: mode === "GROUP" ? title.trim() : undefined,
          participantIds: selected.map((s) => s.id),
          projectId,
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { id: string };
      toast.success(t("conversationCreated"));
      onCreated(data.id);
      reset();
      onOpenChange(false);
    } catch {
      toast.error(t("searchError"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg border-border/80 bg-white text-foreground shadow-xl dark:bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newConversation")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <ProjectModeTabs
            layout="row"
            value={mode}
            onChange={(m) => {
              setMode(m);
              setSelected([]);
            }}
            options={[
              { id: "DIRECT", label: t("direct"), icon: MessageSquare },
              { id: "GROUP", label: t("group"), icon: Users },
            ]}
          />
          {mode === "GROUP" && (
            <div className="space-y-1.5">
              <Label htmlFor="conv-title">{t("groupTitle")}</Label>
              <Input
                id="conv-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("groupTitlePlaceholder")}
                className="bg-white dark:bg-white"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>
              {mode === "DIRECT" ? t("selectOneParticipant") : t("selectParticipants")}
            </Label>
            <ParticipantPicker
              selected={selected}
              onChange={setSelected}
              maxSelect={mode === "DIRECT" ? 1 : undefined}
              labels={pickerLabels}
              disabled={creating}
            />
          </div>
          <Button className="w-full" disabled={creating} onClick={() => void create()}>
            {creating ? t("creating") : t("createConversation")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
