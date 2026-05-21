"use client";

import { useUiT } from "@/hooks/use-ui-t";
import Link from "next/link";
import { Shield, StickyNote, Ticket, ShoppingBag, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminClientInviteDialog } from "@/components/admin/admin-client-invite-dialog";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  AdminStatCard,
  UserAvatar,
  UserStatusBadges,
  AdminClientQuickActions,
  AdminClientAccountPanel,
  AdminClientRowActions,
  type UserStatusBadgeInput,
} from "@/components/admin/users";
import { AdminClientCompanyPanel } from "@/components/admin/admin-client-company-panel";
import type { RegistrationCompanySnapshot } from "@/lib/registration-company-snapshot";

export type AdminClientDetailModel = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  hasPortalAccess: boolean;
  phone: string | null;
  language: string;
  isActive: boolean;
  emailVerified: string | null;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: string;
  company: {
    id: string;
    name: string;
    tier: string | null;
    isApproved: boolean;
    vatNumber: string | null;
    city: string | null;
    country: string | null;
  } | null;
  registeredCompany: {
    id: string;
    name: string;
    vatNumber: string | null;
    city: string | null;
    tier: string | null;
    isApproved: boolean;
  } | null;
  registrationSnapshot: RegistrationCompanySnapshot | null;
  _count: { tickets: number; orders: number; quotes: number };
  recentTickets: { id: string; number: string; title: string; status: string; createdAt: string }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    createdAt: string;
  }[];
};

export function AdminClientDetailView({
  user,
  locale,
  lp,
  currentUserId,
  canMessage,
}: {
  user: AdminClientDetailModel;
  locale: string;
  lp: string;
  currentUserId: string;
  canMessage: boolean;
}) {
  const en = locale === "en";
  const tUi = useUiT();
  const badgeInput: UserStatusBadgeInput = {
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    company: user.company,
  };
  const detailHref = `${lp}/admin/clients/${user.id}`;
  const ticketsHref = `${lp}/admin/tickets?requester=${encodeURIComponent(user.id)}`;
  const ordersHref = `${lp}/admin/orders?userId=${encodeURIComponent(user.id)}`;
  const emailDisplay =
    user.email ?? (en ? "No email — not invited" : "Pa email — pa ftesë");

  return (
    <div className="space-y-8">
      <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8 min-w-0">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/15 p-6 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <UserAvatar firstName={user.firstName} lastName={user.lastName} size="lg" />
                <div className="min-w-0 space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className={`text-sm break-all ${user.email ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400"}`}>
                    {emailDisplay}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {!user.hasPortalAccess ? (
                      <Badge variant="secondary" className="border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        {tUi("pending_invite")}
                      </Badge>
                    ) : null}
                    <UserStatusBadges user={badgeInput} locale={locale} />
                  </div>
                  <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div>
                      <dt className="inline font-medium text-foreground">{tUi("type")}: </dt>
                      <dd className="inline">
                        {user.company || user.registeredCompany || user.registrationSnapshot
                          ? tUi("business_contact")
                          : tUi("individual")}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-foreground">{tUi("language")}: </dt>
                      <dd className="inline">{user.language}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-foreground">{tUi("last_login")}: </dt>
                      <dd className="inline">
                        {user.lastLoginAt ? timeAgo(new Date(user.lastLoginAt)) : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-foreground">{tUi("created")}: </dt>
                      <dd className="inline">{formatDate(new Date(user.createdAt))}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {!user.hasPortalAccess ? (
                  <AdminClientInviteDialog
                    userId={user.id}
                    userName={`${user.firstName} ${user.lastName}`}
                    locale={locale}
                  />
                ) : null}
                <AdminClientRowActions
                  user={{
                    id: user.id,
                    email: user.email,
                    hasPortalAccess: user.hasPortalAccess,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isActive: user.isActive,
                    companyId: user.company?.id ?? null,
                    registrationCompanySnapshot: user.registrationSnapshot,
                  }}
                  locale={locale}
                  detailHref={detailHref}
                  ticketsHref={ticketsHref}
                  ordersHref={ordersHref}
                  messagesBasePath={lp}
                  currentUserId={currentUserId}
                  canMessage={canMessage}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <AdminStatCard label={tUi("tickets")} value={user._count.tickets} icon={Ticket} />
            <AdminStatCard label={tUi("orders")} value={user._count.orders} icon={ShoppingBag} />
            <AdminStatCard label={tUi("quotes")} value={user._count.quotes} icon={FileText} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h2 className="text-sm font-semibold tracking-tight mb-3">{tUi("contact")}</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">{tUi("phone")}</dt>
                  <dd>{user.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className={`break-all ${user.email ? "" : "text-amber-700 dark:text-amber-400"}`}>
                    {emailDisplay}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                {tUi("security")}
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  {user.twoFactorEnabled
                    ? tUi("two_factor_authentication_is_on")
                    : tUi("two_factor_authentication_is_off")}
                </li>
                <li>
                  {user.emailVerified
                    ? tUi("email_verified")
                    : tUi("email_not_verified")}
                </li>
              </ul>
            </div>
          </div>

          <AdminClientCompanyPanel
            userId={user.id}
            locale={locale}
            lp={lp}
            activeCompany={
              user.company
                ? {
                    id: user.company.id,
                    name: user.company.name,
                    tier: user.company.tier,
                    isApproved: user.company.isApproved,
                    vatNumber: user.company.vatNumber,
                    city: user.company.city,
                  }
                : null
            }
            registeredCompany={user.registeredCompany}
            registrationSnapshot={user.registrationSnapshot}
          />

          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground">
              <StickyNote className="h-4 w-4" strokeWidth={2} />
              {tUi("notes")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tUi("no_saved_notes_for_this_client_yet")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="text-sm font-semibold">{tUi("recent_tickets")}</h2>
              </div>
              <ul className="divide-y">
                {user.recentTickets.length === 0 ? (
                  <li className="px-4 py-6 text-sm text-muted-foreground">{tUi("none")}</li>
                ) : (
                  user.recentTickets.map((tk) => (
                    <li key={tk.id} className="px-4 py-3">
                      <Link
                        href={`${lp}/admin/tickets/${tk.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {tk.number}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1">{tk.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {tk.status} · {formatDate(new Date(tk.createdAt))}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="text-sm font-semibold">{tUi("recent_orders")}</h2>
              </div>
              <ul className="divide-y">
                {user.recentOrders.length === 0 ? (
                  <li className="px-4 py-6 text-sm text-muted-foreground">{tUi("none")}</li>
                ) : (
                  user.recentOrders.map((o) => (
                    <li key={o.id} className="px-4 py-3 text-sm">
                      <span className="font-medium">{o.orderNumber}</span>
                      <span className="text-muted-foreground"> · {o.status}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(new Date(o.createdAt))}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <AdminClientAccountPanel
            userId={user.id}
            locale={locale}
            userLanguage={user.language}
            hasPortalAccess={user.hasPortalAccess}
            initialFirstName={user.firstName}
            initialLastName={user.lastName}
            initialEmail={user.email}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 h-fit">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              {tUi("quick_actions")}
            </p>
            <AdminClientQuickActions
              locale={locale}
              userId={user.id}
              email={user.email}
              hasPortalAccess={user.hasPortalAccess}
              ticketsHref={ticketsHref}
              ordersHref={ordersHref}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
