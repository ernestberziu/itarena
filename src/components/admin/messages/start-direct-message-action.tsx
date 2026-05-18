"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export async function createOrOpenDirectConversation(participantId: string) {
  const res = await fetch("/api/admin/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "DIRECT", participantIds: [participantId] }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "REQUEST_FAILED");
  }
  return (await res.json()) as { id: string };
}

type Labels = {
  message: string;
  opening: string;
  error: string;
  cannotMessage: string;
};

function useStartDirectMessage({
  participantId,
  currentUserId,
  messagesBasePath,
  enabled,
  labels,
  onNavigate,
}: {
  participantId: string;
  currentUserId: string;
  messagesBasePath: string;
  enabled: boolean;
  labels: Labels;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const visible = enabled && participantId !== currentUserId;

  async function start() {
    if (!visible || loading) return;
    setLoading(true);
    try {
      const { id } = await createOrOpenDirectConversation(participantId);
      onNavigate?.();
      router.push(
        `${messagesBasePath}/admin/messages?conversation=${encodeURIComponent(id)}`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("cannot message")) {
        toast.error(labels.cannotMessage);
      } else {
        toast.error(labels.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return { start, loading, visible };
}

function directMessageLabels(locale: string): Labels {
  const en = locale === "en";
  return {
    message: en ? "Message" : "Mesazh",
    opening: en ? "Opening…" : "Duke hapur…",
    error: en ? "Could not start conversation" : "Biseda nuk u hap",
    cannotMessage: en ? "You cannot message this user" : "Nuk mund të mesazhoni këtë përdorues",
  };
}

export function StartDirectMessageMenuItem({
  participantId,
  currentUserId,
  locale,
  messagesBasePath,
  enabled = true,
  onNavigate,
  withSeparatorBefore = false,
}: {
  participantId: string;
  currentUserId: string;
  locale: string;
  messagesBasePath: string;
  enabled?: boolean;
  onNavigate?: () => void;
  withSeparatorBefore?: boolean;
}) {
  const labels = directMessageLabels(locale);
  const { start, loading, visible } = useStartDirectMessage({
    participantId,
    currentUserId,
    messagesBasePath,
    enabled,
    labels,
    onNavigate,
  });

  if (!visible) return null;

  return (
    <>
      {withSeparatorBefore ? <DropdownMenuSeparator /> : null}
      <DropdownMenuItem onClick={() => void start()} disabled={loading}>
        <MessageSquare className="mr-2 h-4 w-4" />
        {loading ? labels.opening : labels.message}
      </DropdownMenuItem>
    </>
  );
}

export function StartDirectMessageButton({
  participantId,
  currentUserId,
  locale,
  messagesBasePath,
  enabled = true,
  className,
  variant = "outline",
  size = "sm",
}: {
  participantId: string;
  currentUserId: string;
  locale: string;
  messagesBasePath: string;
  enabled?: boolean;
  className?: string;
  variant?: "outline" | "default" | "secondary";
  size?: "sm" | "default";
}) {
  const labels = directMessageLabels(locale);
  const { start, loading, visible } = useStartDirectMessage({
    participantId,
    currentUserId,
    messagesBasePath,
    enabled,
    labels,
  });

  if (!visible) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-1.5", className)}
      disabled={loading}
      onClick={() => void start()}
    >
      <MessageSquare className="h-4 w-4" />
      {loading ? labels.opening : labels.message}
    </Button>
  );
}
