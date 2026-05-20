import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStaffAccountPanel,
  AdminStaffAclEditor,
  AdminStaffDetailActions,
  AdminStaffProjectAssignments,
  UserAvatar,
  UserStatusBadges,
} from "@/components/admin/users";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { hasAclLevel, isStaffRole, type StaffRole } from "@/lib/admin-acl/features";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { activeStaffWhere } from "@/lib/staff/active-staff-where";
import { AdminStaffRemoveButton } from "@/components/admin/users/admin-staff-remove-button";

export default async function AdminStaffDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "staff");

  const user = await db.user.findFirst({
    where: { id, ...activeStaffWhere() },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      emailVerified: true,
      adminAclJson: true,
      _count: { select: { assignedTickets: true } },
    },
  });

  if (!user || !isStaffRole(user.role)) notFound();

  const lp = locale === "sq" ? "" : `/${locale}`;
  const canWriteStaff = hasAclLevel(acl, "staff", "write");
  const canMessage = hasAclLevel(acl, "messages", "write");
  const canChangeRole = session.user.role === "ADMIN";
  const canEditAcl = session.user.role === "ADMIN" && user.role !== "ADMIN" && canWriteStaff;
  const staffRole = user.role as StaffRole;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
        actions={
          <AdminStaffDetailActions
            staffId={user.id}
            locale={locale}
            lp={lp}
            currentUserId={session.user.id}
            canMessage={canMessage}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
        <UserAvatar firstName={user.firstName} lastName={user.lastName} className="h-14 w-14 text-base" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
          <UserStatusBadges
            user={{
              isActive: user.isActive,
              emailVerified: user.emailVerified?.toISOString() ?? null,
              company: null,
            }}
            locale={locale}
            className="mt-2"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            {locale === "sq" ? "Roli:" : "Role:"}{" "}
            <span className="font-semibold text-foreground">{user.role}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "sq" ? "Biletat e caktuara:" : "Assigned tickets:"}{" "}
            <span className="font-semibold text-foreground">{user._count.assignedTickets}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "sq" ? "Hyrja e fundit:" : "Last login:"}{" "}
            {user.lastLoginAt
              ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sq-AL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(user.lastLoginAt)
              : "—"}
          </p>
        </div>
      </div>

      <AdminStaffAccountPanel
        userId={user.id}
        locale={locale}
        initialFirstName={user.firstName}
        initialLastName={user.lastName}
        initialEmail={user.email}
        initialRole={user.role}
        initialIsActive={user.isActive}
        canWrite={canWriteStaff}
        canChangeRole={canChangeRole}
      />

      {canEditAcl ? (
        <AdminStaffAclEditor
          staffId={user.id}
          staffRole={staffRole}
          initialAdminAclJson={user.adminAclJson}
          locale={locale}
        />
      ) : null}

      {canWriteStaff ? (
        <AdminStaffProjectAssignments staffId={user.id} locale={locale} />
      ) : null}

      {canWriteStaff && user.id !== session.user.id ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="text-sm font-semibold text-destructive">
            {locale === "sq" ? "Zona e rrezikshme" : "Danger zone"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "sq"
              ? "Hiq këtë anëtar nga stafi. Biletat dhe projektet mbeten; caktimet aktive shlyhen."
              : "Remove this member from staff. Tickets and projects remain; active assignments are cleared."}
          </p>
          <AdminStaffRemoveButton
            staffId={user.id}
            staffName={`${user.firstName} ${user.lastName}`}
            locale={locale}
            lp={lp}
            canRemove
            variant="destructive"
            className="mt-4"
            redirectAfterRemove
          />
        </div>
      ) : null}
    </div>
  );
}
