"use client";
import { useUiT } from "@/hooks/use-ui-t";

/**
 * Staff-facing quote workspace. Editable fields map to `PATCH /api/quotes/[id]` only
 * (status, total, validUntil, internalNote). Full body editing requires API expansion.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Receipt,
  Save,
  Tag,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { EmailClientButton } from "@/components/admin/email-client-button";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { AdminStatCard, UserAvatar } from "@/components/admin/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { isQuoteExpired, quoteServiceLabel } from "@/lib/quote-display";
import { QUOTE_STATUSES, STATUS_LABELS, quoteStatusLabel } from "@/lib/admin-quote-status";
import { QUOTE_MONEY_MAX, parseQuoteMoneyInput } from "@/lib/quote-money";

export type AdminQuoteDetailModel = {
  id: string;
  quoteNumber: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  vatNumber: string | null;
  title: string;
  description: string;
  services: string;
  timeline: string | null;
  attachments: string;
  status: string;
  lineItems: string | null;
  subtotal: string | null;
  discount: string | null;
  total: string | null;
  pdfUrl: string | null;
  validUntil: string | null;
  clientNote: string | null;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  followUpSentAt: string | null;
  requestedBy: { firstName: string; lastName: string; email: string | null };
  company: { name: string } | null;
};

function splitContactName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "?", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function safeJsonArray(s: string | null | undefined): unknown[] {
  if (!s || s === "[]") return [];
  try {
    const v = JSON.parse(s) as unknown;
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function parseServices(servicesJson: string): string[] {
  return safeJsonArray(servicesJson).filter((x): x is string => typeof x === "string");
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatMoneyOrDash(value: string | null): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return formatPrice(Number(value));
}

function DetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <header className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-5 py-3">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function RailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border/50 px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export function AdminQuoteDetailView({
  quote,
  locale,
}: {
  quote: AdminQuoteDetailModel;
  locale: string;
  lp: string;
}) {
  const en = locale === "en";
  const tUi = useUiT();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [status, setStatus] = useState(quote.status);
  const [internalNote, setInternalNote] = useState(quote.internalNote ?? "");
  const [totalStr, setTotalStr] = useState(quote.total ?? "");
  const [validLocal, setValidLocal] = useState(toDatetimeLocalValue(quote.validUntil));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(quote.status);
    setInternalNote(quote.internalNote ?? "");
    setTotalStr(quote.total ?? "");
    setValidLocal(toDatetimeLocalValue(quote.validUntil));
  }, [quote.id, quote.status, quote.internalNote, quote.total, quote.validUntil]);

  const services = useMemo(() => parseServices(quote.services), [quote.services]);
  const contactParts = useMemo(() => splitContactName(quote.contactName), [quote.contactName]);

  const effectiveValidUntilIso = useMemo(
    () => datetimeLocalToIso(validLocal) ?? quote.validUntil,
    [validLocal, quote.validUntil]
  );

  const expired = isQuoteExpired({ validUntil: effectiveValidUntilIso, status });

  const validUntilLabel = useMemo(() => {
    if (!effectiveValidUntilIso) return "—";
    if (expired) return tUi("expired");
    return formatDateTime(new Date(effectiveValidUntilIso));
  }, [effectiveValidUntilIso, expired, en]);

  const displayTotal = totalStr.trim() !== "" ? totalStr : quote.total;

  const statusLabel = quoteStatusLabel(status, locale);

  const activityRows = useMemo(() => {
    type ActivityRow = {
      label: string;
      detail?: string;
      at: string;
      tone: "default" | "success" | "accent";
    };

    const rows: ActivityRow[] = [
      { label: tUi("created"), at: quote.createdAt, tone: "default" },
    ];

    if (quote.respondedAt) {
      rows.push({
        label: tUi("responded"),
        detail: quoteStatusLabel(quote.status, locale),
        at: quote.respondedAt,
        tone: "success",
      });
    }

    if (quote.followUpSentAt) {
      rows.push({
        label: tUi("follow_up_sent"),
        at: quote.followUpSentAt,
        tone: "accent",
      });
    }

    rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return rows;
  }, [quote.createdAt, quote.respondedAt, quote.followUpSentAt, quote.status, locale, en]);

  const motionProps = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } };

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/quotes/${quote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("patch");
  }

  async function saveStaffFields() {
    setSaving(true);
    try {
      const totalNum = parseQuoteMoneyInput(totalStr);
      if (totalStr.trim() !== "" && totalNum === null) {
        toast.error(
          tUi("invalid_quote_amount", {
            max: QUOTE_MONEY_MAX.toLocaleString(locale === "en" ? "en-US" : "sq-AL"),
          })
        );
        return;
      }
      const payload: Record<string, unknown> = {
        status,
        notes: internalNote,
      };
      if (totalNum !== null) payload.total = totalNum;
      if (validLocal) {
        payload.validUntil = new Date(validLocal).toISOString();
      }
      await patch(payload);
      toast.success(tUi("quote_updated"));
      router.refresh();
    } catch {
      toast.error(tUi("save_failed_2"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <motion.section
        {...motionProps}
        className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/15 p-6 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {quote.quoteNumber}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{quote.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <QuoteStatusBadge status={status} locale={locale} validUntil={effectiveValidUntilIso} />
              {effectiveValidUntilIso && !["ACCEPTED", "REJECTED"].includes(status) ? (
                <span
                  className={
                    expired
                      ? "text-sm font-medium text-rose-600 dark:text-rose-400"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {expired
                    ? tUi("this_quote_has_expired")
                    : `${tUi("valid_until")} ${formatDateTime(new Date(effectiveValidUntilIso))}`}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span>
              {tUi("created")} {formatDate(new Date(quote.createdAt))}
            </span>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminStatCard
          label={tUi("total")}
          value={formatMoneyOrDash(displayTotal)}
          icon={Package}
          className="ring-primary/15"
        />
        <AdminStatCard label={tUi("valid_until_2")} value={validUntilLabel} icon={Calendar} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <DetailCard title={tUi("customer")} icon={User}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <UserAvatar
                firstName={contactParts.firstName}
                lastName={contactParts.lastName || contactParts.firstName}
                size="lg"
              />
              <dl className="grid min-w-0 flex-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">{tUi("name")}</dt>
                  <dd className="font-medium">{quote.contactName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd>
                    <a className="break-all text-primary hover:underline" href={`mailto:${quote.contactEmail}`}>
                      {quote.contactEmail}
                    </a>
                  </dd>
                </div>
                {quote.contactPhone ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">{tUi("phone")}</dt>
                    <dd className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
                      {quote.contactPhone}
                    </dd>
                  </div>
                ) : null}
                {quote.vatNumber ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">{tUi("vat")}</dt>
                    <dd>{quote.vatNumber}</dd>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">{tUi("company")}</dt>
                  <dd className="flex flex-wrap items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
                    {quote.companyName}
                    {quote.company ? (
                      <span className="text-muted-foreground">· {quote.company.name}</span>
                    ) : null}
                  </dd>
                </div>
                <div className="sm:col-span-2 rounded-lg border border-border/50 bg-muted/15 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{tUi("requesting_user")}</dt>
                  <dd className="mt-0.5">
                    {quote.requestedBy.firstName} {quote.requestedBy.lastName}{" "}
                    <span className="text-muted-foreground">({quote.requestedBy.email})</span>
                  </dd>
                </div>
              </dl>
            </div>
          </DetailCard>

          <DetailCard title={tUi("request")} icon={Package}>
            {services.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {services.map((service) => (
                  <Badge key={service} variant="secondary" className="font-normal">
                    {quoteServiceLabel(service, locale as "sq" | "en")}
                  </Badge>
                ))}
              </div>
            ) : null}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{quote.description}</p>
            {quote.timeline ? (
              <>
                <Separator className="my-4" />
                <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {tUi("timeline")}
                </h4>
                <p className="text-sm text-muted-foreground">{quote.timeline}</p>
              </>
            ) : null}
          </DetailCard>

          <DetailCard title={tUi("client_note")} icon={MessageSquare}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {quote.clientNote ?? "—"}
            </p>
          </DetailCard>

          <DetailCard title={tUi("activity")} icon={Clock}>
            <ul className="space-y-4 border-l border-border pl-4">
              {activityRows.map((row, i) => (
                <li key={`${row.label}-${i}`} className="relative text-sm">
                  <span
                    className={
                      row.tone === "success"
                        ? "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card"
                        : row.tone === "accent"
                          ? "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-card"
                          : "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card"
                    }
                  />
                  <span className="font-medium text-foreground">{row.label}</span>
                  {row.detail ? (
                    <p className="text-sm text-foreground/90">{row.detail}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">{formatDateTime(new Date(row.at))}</p>
                </li>
              ))}
            </ul>
          </DetailCard>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/10 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
          >
            <header className="border-b border-border/50 px-4 py-4">
              <h3 className="text-sm font-semibold tracking-tight">{tUi("staff_actions")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {tUi("update_status_pricing_and_document")}
              </p>
            </header>

            <RailSection title={tUi("status")} icon={Tag}>
              <Select value={status} onValueChange={(v) => v != null && setStatus(v)}>
                <SelectTrigger id="quote-status" className="w-full">
                  <SelectValue>{statusLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {QUOTE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s] ? (en ? STATUS_LABELS[s].en : STATUS_LABELS[s].sq) : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </RailSection>

            <RailSection title={tUi("pricing")} icon={Receipt}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="quote-total" className="text-xs text-muted-foreground">
                    {tUi("total")}
                  </Label>
                  <Input
                    id="quote-total"
                    inputMode="decimal"
                    className="h-9 bg-background"
                    value={totalStr}
                    onChange={(e) => setTotalStr(e.target.value)}
                    placeholder="0.00"
                    max={QUOTE_MONEY_MAX}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quote-valid" className="text-xs text-muted-foreground">
                    {tUi("valid_until_3")}
                  </Label>
                  <Input
                    id="quote-valid"
                    type="datetime-local"
                    className="h-9 bg-background"
                    value={validLocal}
                    onChange={(e) => setValidLocal(e.target.value)}
                  />
                </div>
              </div>
            </RailSection>

            <RailSection title={tUi("internal_note")} icon={MessageSquare}>
              <Textarea
                id="quote-internal"
                rows={4}
                className="bg-background text-sm"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder={tUi("staff_only")}
              />
            </RailSection>

            <div className="space-y-2 border-t border-border/50 p-4">
              <Button type="button" className="w-full gap-2" disabled={saving} onClick={() => void saveStaffFields()}>
                <Save className="h-4 w-4" strokeWidth={2} aria-hidden />
                {saving ? "…" : tUi("save")}
              </Button>
              {quote.pdfUrl ? (
                <Button variant="secondary" className="w-full gap-2" asChild>
                  <a href={quote.pdfUrl} target="_blank" rel="noreferrer">
                    <FileText className="h-4 w-4" strokeWidth={2} aria-hidden />
                    {tUi("open_pdf")}
                  </a>
                </Button>
              ) : null}
              <EmailClientButton
                apiUrl={`/api/admin/quotes/${quote.id}/email-client`}
                label={tUi("email_client")}
                variant="secondary"
                className="w-full"
                size="default"
              />
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
