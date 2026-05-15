import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UserCog, Ticket, CheckCircle2, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate, timeAgo } from "@/lib/utils";

const STAFF_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"] as const;

const ROLE_LABELS: Record<string, { sq: string; en: string; color: string }> = {
  ADMIN: { sq: "Admin", en: "Admin", color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400" },
  ENGINEER: { sq: "Inxhinier", en: "Engineer", color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400" },
  SALES: { sq: "Shitje", en: "Sales", color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400" },
  OPS: { sq: "Operacione", en: "Operations", color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400" },
};

export default async function AdminStaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;

  const staff = await db.user.findMany({
    where: { role: { in: STAFF_ROLES as unknown as string[] } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { assignedTickets: true } },
    },
    orderBy: { role: "asc" },
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={locale === "sq" ? "Stafi" : "Staff"}
        description={`${staff.length} ${locale === "sq" ? "anëtarë të stafit" : "staff members"}`}
      />

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title={locale === "sq" ? "Nuk ka staf" : "No staff members"}
          description={locale === "sq" ? "Shtoni anëtarë stafi për të filluar" : "Add staff members to get started"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((member) => {
            const rl = ROLE_LABELS[member.role];
            return (
              <div key={member.id} className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  {member.isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={2} />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {rl && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${rl.color}`}>
                      {rl[locale as "sq" | "en"]}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ticket className="h-3.5 w-3.5" strokeWidth={2} />
                    <span className="font-semibold text-foreground">{member._count.assignedTickets}</span>
                    {locale === "sq" ? "bileta" : "tickets"}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === "sq" ? "Hyrja e fundit:" : "Last login:"}{" "}
                  {member.lastLoginAt ? timeAgo(member.lastLoginAt) : "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
