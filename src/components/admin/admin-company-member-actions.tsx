"use client";
import { useUiT } from "@/hooks/use-ui-t";

import Link from "next/link";
import { ExternalLink, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminClientResetPasswordDialog } from "@/components/admin/admin-client-reset-password-dialog";

export function AdminCompanyMemberActions({
  member,
  locale,
  lp,
  currentUserId,
  canMessage,
  onUnassign,
}: {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    isActive: boolean;
  };
  locale: string;
  lp: string;
  currentUserId: string;
  canMessage: boolean;
  onUnassign: () => void;
}) {
  const en = locale === "en";
  const tUi = useUiT();

  return (
    <div className="flex justify-end gap-1">
      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
        <Link href={`${lp}/admin/clients/${member.id}`} aria-label={tUi("view")}>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
      <AdminClientResetPasswordDialog
        userId={member.id}
        userEmail={member.email ?? ""}
        userName={`${member.firstName} ${member.lastName}`}
        locale={locale}
      />
      <Button variant="outline" size="icon" className="h-8 w-8 text-amber-700" onClick={onUnassign}>
        <Unlink className="h-4 w-4" />
      </Button>
    </div>
  );
}
