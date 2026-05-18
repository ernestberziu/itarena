"use client";

import Link from "next/link";
import { StartDirectMessageButton } from "@/components/admin/messages/start-direct-message-action";

export function AdminStaffDetailActions({
  staffId,
  locale,
  lp,
  currentUserId,
  canMessage,
}: {
  staffId: string;
  locale: string;
  lp: string;
  currentUserId: string;
  canMessage: boolean;
}) {
  const en = locale === "en";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StartDirectMessageButton
        participantId={staffId}
        currentUserId={currentUserId}
        locale={locale}
        messagesBasePath={lp}
        enabled={canMessage}
      />
      <Link
        href={`${lp}/admin/staff`}
        className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {en ? "← Staff" : "← Stafi"}
      </Link>
    </div>
  );
}
