import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { UserCog, Users, UserCheck, UserX } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminStatCard, UserAvatar, UserStatusBadges, AdminStaffRowActions } from "@/components/admin/users";

const STAFF_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"] as const;

const ROLE_LABELS: Record<string, { sq: string; en: string; color: string }> = {
  ADMIN: {
    sq: "Admin",
    en: "Admin",
    color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  },
  ENGINEER: {
    sq: "Inxhinier",
    en: "Engineer",
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
  SALES: {
    sq: "Shitje",
    en: "Sales",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  OPS: {
    sq: "Operacione",
    en: "Operations",
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
};

export default async function AdminStaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "staff");

  const lp = locale === "sq" ? "" : `/${locale}`;
  const adminHrefPrefix = `${lp}/admin`;
  const canWriteStaff = hasAclLevel(acl, "staff", "write");
  const canCreateStaff = canWriteStaff && session.user.role === "ADMIN";

  const staffWhere = { role: { in: STAFF_ROLES as unknown as string[] } };

  const [staff, totalCount, activeCount, suspendedCount, roleGroups] = await Promise.all([
    db.user.findMany({
      where: staffWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { assignedTickets: true } },
      },
      orderBy: { role: "asc" },
    }),
    db.user.count({ where: staffWhere }),
    db.user.count({ where: { ...staffWhere, isActive: true } }),
    db.user.count({ where: { ...staffWhere, isActive: false } }),
    db.user.groupBy({
      by: ["role"],
      where: staffWhere,
      _count: { _all: true },
    }),
  ]);

  const roleTotals = Object.fromEntries(roleGroups.map((g) => [g.role, g._count._all])) as Record<
    string,
    number
  >;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Stafi" : "Staff"}
        description={
          locale === "sq"
            ? "Anëtarët e ekipit me qasje në panelin e adminit."
            : "Team members with access to the admin console."
        }
        actions={
          canCreateStaff ? (
            <Link
              href={`${lp}/admin/staff/new`}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              {locale === "sq" ? "Staf i ri" : "New staff"}
            </Link>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatCard label={locale === "sq" ? "Gjithsej" : "Total"} value={totalCount} icon={Users} />
        <AdminStatCard
          label={locale === "sq" ? "Aktive" : "Active"}
          value={activeCount}
          icon={UserCheck}
        />
        <AdminStatCard
          label={locale === "sq" ? "Joaktive" : "Inactive"}
          value={suspendedCount}
          icon={UserX}
        />
        <AdminStatCard
          label={locale === "sq" ? "Administratorë" : "Admins"}
          value={roleTotals.ADMIN ?? 0}
          icon={UserCog}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STAFF_ROLES.map((role) => {
          const n = roleTotals[role] ?? 0;
          if (n === 0) return null;
          const rl = ROLE_LABELS[role];
          return (
            <span
              key={role}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${rl?.color ?? ""}`}
            >
              {rl?.[locale as "sq" | "en"] ?? role}: {n}
            </span>
          );
        })}
      </div>

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title={locale === "sq" ? "Nuk ka staf" : "No staff members"}
          description={
            locale === "sq" ? "Shtoni anëtarë stafi për të filluar" : "Add staff members to get started"
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((member) => {
            const rl = ROLE_LABELS[member.role];
            return (
              <div
                key={member.id}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/15 p-5 shadow-sm ring-1 ring-black/[0.03] transition-[box-shadow,transform] duration-200 hover:shadow-md dark:ring-white/[0.05] motion-safe:hover:-translate-y-px"
              >
                <div className="absolute right-3 top-3">
                  <AdminStaffRowActions
                    member={{
                      id: member.id,
                      email: member.email,
                      firstName: member.firstName,
                      lastName: member.lastName,
                    }}
                    locale={locale}
                    adminHrefPrefix={adminHrefPrefix}
                  />
                </div>
                <div className="flex items-start gap-3 pr-10">
                  <UserAvatar firstName={member.firstName} lastName={member.lastName} className="h-11 w-11 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    <UserStatusBadges
                      user={{
                        isActive: member.isActive,
                        emailVerified: member.emailVerified?.toISOString() ?? null,
                        company: null,
                      }}
                      locale={locale}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  {rl && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${rl.color}`}>
                      {rl[locale as "sq" | "en"]}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {locale === "sq" ? "Biletat e caktuara:" : "Assigned tickets:"}{" "}
                    <span className="font-semibold text-foreground">{member._count.assignedTickets}</span>
                  </p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {locale === "sq" ? "Hyrja e fundit:" : "Last login:"}{" "}
                  {member.lastLoginAt
                    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sq-AL", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(member.lastLoginAt)
                    : "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
