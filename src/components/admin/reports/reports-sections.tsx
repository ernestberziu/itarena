"use client";
import { useUiT } from "@/hooks/use-ui-t";

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
  const tUi = useUiT();
  const { sections } = data;

  return (
    <div className="space-y-6 print:space-y-4">
      <ReportsSection
        id="revenue"
        title={tUi("revenue")}
        description={tUi("order_trends_and_breakdown")}
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
            <p className="text-xs text-muted-foreground">{tUi("completed")}</p>
            <p className="font-semibold">{sections.revenue.completedCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{tUi("cancelled")}</p>
            <p className="font-semibold">{sections.revenue.cancelledCount}</p>
          </div>
        </div>
      </ReportsSection>

      <ReportsSection
        id="users"
        title={tUi("users_clients")}
        locale={locale}
        rangeParams={rangeParams}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ReportLineChart data={sections.users.dailySignups} />
          <div className="flex flex-col justify-center gap-4 rounded-xl border border-border/50 bg-muted/15 p-4">
            <p>
              <span className="text-muted-foreground">{tUi("new")}: </span>
              <span className="font-semibold">{sections.users.newCustomers}</span>
            </p>
            <p>
              <span className="text-muted-foreground">{tUi("returning")}: </span>
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
                  <th className="pb-2">{tUi("company")}</th>
                  <th className="pb-2">{tUi("revenue")}</th>
                  <th className="pb-2">{tUi("orders_2")}</th>
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

      <ReportsSection id="quotes" title={tUi("quotes_2")} locale={locale} rangeParams={rangeParams}>
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
          {tUi("pipeline")}: {sections.quotes.pipelineCount} · {formatPrice(sections.quotes.pipelineValue)}
          {sections.quotes.avgResponseHours != null
            ? ` · ${tUi("avg_response")}: ${sections.quotes.avgResponseHours}h`
            : ""}
        </p>
      </ReportsSection>

      <ReportsSection id="products" title={tUi("products")} locale={locale} rangeParams={rangeParams}>
        <ReportBarChart
          data={sections.products.topSkus.slice(0, 10).map((s) => ({
            label: s.name.slice(0, 24),
            value: s.revenue,
          }))}
        />
      </ReportsSection>

      <ReportsSection
        id="funnel"
        title={tUi("commercial_funnel")}
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

      <ReportsSection id="support" title={tUi("support")} locale={locale} rangeParams={rangeParams}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReportLineChart data={sections.support.ticketsOpenedDaily} />
          </div>
          <div className="flex items-center justify-center">
            <SlaRing compliant={sections.support.slaCompliant} breached={sections.support.slaBreached} />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {tUi("avg_resolution")}: {sections.support.avgResolutionHours}h
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
        title={tUi("projects")}
        description={tUi("project_activity_steps_and_messages_in_the_selec")}
        locale={locale}
        rangeParams={rangeParams}
      >
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{tUi("active")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.active}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{tUi("created_2")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.createdInRange}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{tUi("messages")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.messagesInRange}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{tUi("tickets_2")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.ticketsInRange}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{tUi("completed_2")}</p>
            <p className="font-semibold tabular-nums">{sections.projects.totals.completed}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{tUi("archived")}</p>
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
                  <th className="pb-2">{tUi("project")}</th>
                  <th className="pb-2">{tUi("status")}</th>
                  <th className="pb-2">{tUi("tickets_2")}</th>
                  <th className="pb-2">{tUi("messages")}</th>
                  <th className="pb-2">{tUi("steps")}</th>
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
