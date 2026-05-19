"use client";

import { SlaRing } from "@/components/admin/dashboard-charts";
import { formatPrice } from "@/lib/utils";
import type { ReportsOverviewPayload } from "@/lib/reports/types";
import {
  labelAuditAction,
  labelFunnelStage,
  labelOrderStatus,
  labelProjectStatus,
  labelQuoteStatus,
  labelStepStatus,
  labelTier,
  type ReportLocale,
} from "@/lib/reports/labels";
import { ReportsSection } from "./reports-section";
import {
  ReportAreaChart,
  ReportBarChart,
  ReportDonutChart,
  ReportFunnelChart,
  ReportLineChart,
} from "./charts/report-charts";

export function ReportsSections({
  data,
  locale,
  rangeParams,
}: {
  data: ReportsOverviewPayload;
  locale: string;
  rangeParams: Record<string, string>;
}) {
  const en = locale === "en";
  const loc: ReportLocale = en ? "en" : "sq";
  const t = (sq: string, e: string) => (en ? e : sq);
  const { sections } = data;

  return (
    <div className="space-y-6 print:space-y-4">
      <ReportsSection
        id="revenue"
        title={t("Xhiro", "Revenue")}
        description={t("Tendenca dhe shpërndarja e porosive", "Order trends and breakdown")}
        locale={locale}
        rangeParams={rangeParams}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ReportAreaChart data={sections.revenue.dailyRevenue} />
          <ReportBarChart
            data={sections.revenue.byStatus.map((s) => ({
              label: labelOrderStatus(s.status, loc),
              value: s.total,
            }))}
            dataKey="value"
            xKey="label"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          {sections.revenue.byTier.map((tier) => (
            <div key={tier.tier} className="rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">{labelTier(tier.tier, loc)}</p>
              <p className="font-semibold tabular-nums">{formatPrice(tier.total)}</p>
            </div>
          ))}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Të përfunduara", "Completed")}</p>
            <p className="font-semibold">{sections.revenue.completedCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Të anuluara", "Cancelled")}</p>
            <p className="font-semibold">{sections.revenue.cancelledCount}</p>
          </div>
        </div>
      </ReportsSection>

      <ReportsSection
        id="users"
        title={t("Përdorues & klientë", "Users & clients")}
        locale={locale}
        rangeParams={rangeParams}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ReportLineChart data={sections.users.dailySignups} />
          <div className="flex flex-col justify-center gap-4 rounded-xl border border-border/50 bg-muted/15 p-4">
            <p>
              <span className="text-muted-foreground">{t("Të rinj", "New")}: </span>
              <span className="font-semibold">{sections.users.newCustomers}</span>
            </p>
            <p>
              <span className="text-muted-foreground">{t("Kthyes", "Returning")}: </span>
              <span className="font-semibold">{sections.users.returningCustomers}</span>
            </p>
          </div>
        </div>
        {sections.users.byCountry.length > 0 ? (
          <div className="mt-6">
            <ReportDonutChart
              data={sections.users.byCountry.map((c) => ({ name: c.country, value: c.count }))}
            />
          </div>
        ) : null}
        {sections.users.topCompanies.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">{t("Kompania", "Company")}</th>
                  <th className="pb-2">{t("Xhiro", "Revenue")}</th>
                  <th className="pb-2">{t("Porosi", "Orders")}</th>
                </tr>
              </thead>
              <tbody>
                {sections.users.topCompanies.map((c) => (
                  <tr key={c.name} className="border-b border-border/40">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2 tabular-nums">{formatPrice(c.revenue)}</td>
                    <td className="py-2 tabular-nums">{c.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </ReportsSection>

      <ReportsSection id="quotes" title={t("Oferta", "Quotes")} locale={locale} rangeParams={rangeParams}>
        <div className="grid gap-6 lg:grid-cols-2">
          <ReportDonutChart
            data={sections.quotes.byStatus.map((s) => ({
              name: labelQuoteStatus(s.status, loc),
              value: s.count,
            }))}
          />
          <ReportFunnelChart
            data={sections.quotes.funnel.map((s) => ({
              stage: labelQuoteStatus(s.stage, loc),
              count: s.count,
            }))}
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("Pipeline", "Pipeline")}: {sections.quotes.pipelineCount} · {formatPrice(sections.quotes.pipelineValue)}
          {sections.quotes.avgResponseHours != null
            ? ` · ${t("Koha mesatare përgjigjeje", "Avg response")}: ${sections.quotes.avgResponseHours}h`
            : ""}
        </p>
      </ReportsSection>

      <ReportsSection id="products" title={t("Produkte", "Products")} locale={locale} rangeParams={rangeParams}>
        <ReportBarChart
          data={sections.products.topSkus.slice(0, 10).map((s) => ({
            label: s.name.slice(0, 24),
            value: s.revenue,
          }))}
        />
      </ReportsSection>

      <ReportsSection
        id="funnel"
        title={t("Funnel komercial", "Commercial funnel")}
        locale={locale}
        rangeParams={rangeParams}
      >
        <ReportFunnelChart
          data={sections.funnel.stages.map((s) => ({
            stage: labelFunnelStage(s.stage, loc),
            count: s.count,
          }))}
        />
      </ReportsSection>

      <ReportsSection id="support" title={t("Mbështetje", "Support")} locale={locale} rangeParams={rangeParams}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReportLineChart data={sections.support.ticketsOpenedDaily} />
          </div>
          <div className="flex items-center justify-center">
            <SlaRing compliant={sections.support.slaCompliant} breached={sections.support.slaBreached} />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("Koha mesatare zgjidhjeje", "Avg resolution")}: {sections.support.avgResolutionHours}h
        </p>
        {sections.support.auditByAction.length > 0 ? (
          <div className="mt-4">
            <ReportBarChart
              data={sections.support.auditByAction.map((a) => ({
                label: labelAuditAction(a.action, loc),
                value: a.count,
              }))}
            />
          </div>
        ) : null}
      </ReportsSection>

      <ReportsSection
        id="projects"
        title={t("Projektet", "Projects")}
        description={t(
          "Aktiviteti i projekteve, hapat dhe mesazhet në periudhën e zgjedhur",
          "Project activity, steps, and messages in the selected period"
        )}
        locale={locale}
        rangeParams={rangeParams}
      >
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Aktive", "Active")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.active}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Të reja", "Created")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.createdInRange}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Mesazhe", "Messages")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.messagesInRange}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Bileta", "Tickets")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.ticketsInRange}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Përfunduar", "Completed")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.completed}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{t("Arkivuar", "Archived")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.archived}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ReportLineChart data={sections.projects.createdDaily} />
          <ReportLineChart data={sections.projects.messagesDaily} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ReportDonutChart
            data={sections.projects.byStatus.map((s) => ({
              name: labelProjectStatus(s.status, loc),
              value: s.count,
            }))}
          />
          {sections.projects.stepByStatus.length > 0 ? (
            <ReportBarChart
              data={sections.projects.stepByStatus.map((s) => ({
                label: labelStepStatus(s.status, loc),
                value: s.count,
              }))}
            />
          ) : null}
        </div>
        {sections.projects.topProjects.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">{t("Projekti", "Project")}</th>
                  <th className="pb-2">{t("Statusi", "Status")}</th>
                  <th className="pb-2">{t("Bileta", "Tickets")}</th>
                  <th className="pb-2">{t("Mesazhe", "Messages")}</th>
                  <th className="pb-2">{t("Hapa", "Steps")}</th>
                </tr>
              </thead>
              <tbody>
                {sections.projects.topProjects.map((p) => (
                  <tr key={p.id} className="border-b border-border/40">
                    <td className="py-2 font-medium">{p.title}</td>
                    <td className="py-2">{labelProjectStatus(p.status, loc)}</td>
                    <td className="py-2 tabular-nums">{p.tickets}</td>
                    <td className="py-2 tabular-nums">{p.messages}</td>
                    <td className="py-2 tabular-nums">
                      {p.stepsClosed}/{p.stepsTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </ReportsSection>
    </div>
  );
}
