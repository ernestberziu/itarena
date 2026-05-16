"use client";

/**
 * Staff-facing quote workspace. Editable fields map to `PATCH /api/quotes/[id]` only
 * (status, total, validUntil, pdfUrl, internalNote). Full body editing requires API expansion.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  Link2,
  Mail,
  Package,
  Phone,
  Save,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPrice } from "@/lib/utils";
import { summarizeServicesJson, isQuoteExpired } from "@/lib/quote-display";
import { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/admin-quote-status";

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
  requestedBy: { firstName: string; lastName: string; email: string };
  company: { name: string } | null;
};

function safeJsonArray(s: string | null | undefined): unknown[] {
  if (!s || s === "[]") return [];
  try {
    const v = JSON.parse(s) as unknown;
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminQuoteDetailView({
  quote,
  locale,
  lp,
}: {
  quote: AdminQuoteDetailModel;
  locale: string;
  lp: string;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [status, setStatus] = useState(quote.status);
  const [internalNote, setInternalNote] = useState(quote.internalNote ?? "");
  const [totalStr, setTotalStr] = useState(quote.total ?? "");
  const [validLocal, setValidLocal] = useState(toDatetimeLocalValue(quote.validUntil));
  const [pdfUrl, setPdfUrl] = useState(quote.pdfUrl ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(quote.status);
    setInternalNote(quote.internalNote ?? "");
    setTotalStr(quote.total ?? "");
    setValidLocal(toDatetimeLocalValue(quote.validUntil));
    setPdfUrl(quote.pdfUrl ?? "");
  }, [
    quote.id,
    quote.status,
    quote.internalNote,
    quote.total,
    quote.validUntil,
    quote.pdfUrl,
  ]);
  const lineItems = useMemo(() => safeJsonArray(quote.lineItems), [quote.lineItems]);
  const attachments = useMemo(() => safeJsonArray(quote.attachments), [quote.attachments]);
  const servicesSummary = useMemo(() => summarizeServicesJson(quote.services, 400), [quote.services]);

  const expired = isQuoteExpired({ validUntil: quote.validUntil, status });

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
      const totalNum = totalStr.trim() === "" ? undefined : Number(totalStr);
      if (totalNum !== undefined && (Number.isNaN(totalNum) || totalNum <= 0)) {
        toast.error(t("Shuma e pavlefshme", "Invalid amount"));
        return;
      }
      const payload: Record<string, unknown> = {
        status,
        notes: internalNote,
      };
      if (totalNum !== undefined) payload.total = totalNum;
      if (validLocal) {
        payload.validUntil = new Date(validLocal).toISOString();
      }
      if (pdfUrl.trim()) {
        const u = pdfUrl.trim();
        try {
          const parsed = new URL(u);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            toast.error(t("URL e pavlefshme për PDF", "Invalid PDF URL"));
            return;
          }
          payload.pdfUrl = u;
        } catch {
          toast.error(t("URL e pavlefshme për PDF", "Invalid PDF URL"));
          return;
        }
      }
      await patch(payload);
      toast.success(t("Oferta u përditësua", "Quote updated"));
      router.refresh();
    } catch {
      toast.error(t("Ruajtja dështoi", "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  const countdown =
    quote.validUntil && !["ACCEPTED", "REJECTED"].includes(status) ? (
      <p className="text-sm text-muted-foreground">
        {expired ? (
          <span className="font-medium text-rose-600 dark:text-rose-400">
            {t("Oferta ka skaduar.", "This quote has expired.")}
          </span>
        ) : (
          <>
            {t("Skadon më", "Valid until")}{" "}
            <span className="font-medium text-foreground">{formatDate(new Date(quote.validUntil))}</span>
          </>
        )}
      </p>
    ) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        <motion.section {...motionProps} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{quote.quoteNumber}</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">{quote.title}</h2>
              <div className="mt-3">
                <QuoteStatusBadge status={status} locale={locale} validUntil={quote.validUntil} />
              </div>
              {countdown}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center justify-end gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                {t("Krijuar", "Created")}: {formatDate(new Date(quote.createdAt))}
              </div>
            </div>
          </div>
        </motion.section>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="overview">{t("Përmbledhje", "Overview")}</TabsTrigger>
            <TabsTrigger value="details">{t("Detaje", "Details")}</TabsTrigger>
            <TabsTrigger value="activity">{t("Aktiviteti", "Activity")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <motion.div {...motionProps} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <User className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                {t("Klienti", "Customer")}
              </h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Emri", "Name")}</dt>
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
                    <dt className="text-xs text-muted-foreground">{t("Telefoni", "Phone")}</dt>
                    <dd className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {quote.contactPhone}
                    </dd>
                  </div>
                ) : null}
                {quote.vatNumber ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("NIPT / TVSH", "VAT")}</dt>
                    <dd>{quote.vatNumber}</dd>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">{t("Kompania (teksti)", "Company (as entered)")}</dt>
                  <dd className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {quote.companyName}
                    {quote.company ? (
                      <span className="text-muted-foreground">· {quote.company.name}</span>
                    ) : null}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">{t("Kërkuesi (llogaria)", "Requesting user")}</dt>
                  <dd>
                    {quote.requestedBy.firstName} {quote.requestedBy.lastName}{" "}
                    <span className="text-muted-foreground">({quote.requestedBy.email})</span>
                  </dd>
                </div>
              </dl>
            </motion.div>

            <motion.div {...motionProps} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Package className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                {t("Çmime", "Pricing")}
              </h3>
              <dl className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Nëntotali", "Subtotal")}</dt>
                  <dd className="font-semibold tabular-nums">
                    {quote.subtotal != null && !Number.isNaN(Number(quote.subtotal))
                      ? formatPrice(Number(quote.subtotal))
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Zbritje", "Discount")}</dt>
                  <dd className="font-semibold tabular-nums">
                    {quote.discount != null && !Number.isNaN(Number(quote.discount))
                      ? formatPrice(Number(quote.discount))
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Totali", "Total")}</dt>
                  <dd className="text-lg font-bold tabular-nums text-foreground">
                    {quote.total != null && !Number.isNaN(Number(quote.total)) ? formatPrice(Number(quote.total)) : "—"}
                  </dd>
                </div>
              </dl>
            </motion.div>

            {servicesSummary ? (
              <motion.div {...motionProps} className="rounded-2xl border border-border/60 bg-muted/20 p-5 ring-1 ring-inset ring-border/40">
                <h3 className="mb-2 text-sm font-semibold">{t("Shërbimet", "Services")}</h3>
                <p className="text-sm text-muted-foreground">{servicesSummary}</p>
              </motion.div>
            ) : null}
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h3 className="mb-2 text-sm font-semibold">{t("Përshkrimi", "Description")}</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{quote.description}</p>
              {quote.timeline ? (
                <>
                  <Separator className="my-4" />
                  <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("Afati kohor", "Timeline")}
                  </h4>
                  <p className="text-sm text-muted-foreground">{quote.timeline}</p>
                </>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h3 className="mb-3 text-sm font-semibold">{t("Artikujt", "Line items")}</h3>
              {lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {lineItems.map((item, i) => (
                    <li key={i} className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2 font-mono text-xs">
                      {typeof item === "string" ? item : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h3 className="mb-3 text-sm font-semibold">{t("Shënime klienti", "Client note")}</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{quote.clientNote ?? "—"}</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                {t("Bashkëngjitjet", "Attachments")}
              </h3>
              {attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <ul className="space-y-2">
                  {attachments.map((a, i) => {
                    const href = typeof a === "string" ? a : (a as { url?: string })?.url;
                    if (!href) return null;
                    return (
                      <li key={i}>
                        <a href={href} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                          {href}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t("Kronologji", "Timeline")}
              </h3>
              <ul className="space-y-4 border-l border-border pl-4">
                {(
                  [
                    { label: t("Krijuar", "Created"), at: quote.createdAt },
                    { label: t("Përditësuar", "Updated"), at: quote.updatedAt },
                    ...(quote.respondedAt
                      ? [{ label: t("U përgjigj", "Responded"), at: quote.respondedAt }]
                      : []),
                    ...(quote.followUpSentAt
                      ? [{ label: t("Follow-up i dërguar", "Follow-up sent"), at: quote.followUpSentAt }]
                      : []),
                  ] as { label: string; at: string }[]
                ).map((row, i) => (
                  <li key={`${row.label}-${i}`} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card" />
                    <span className="font-medium text-foreground">{row.label}</span>
                    <p className="text-xs text-muted-foreground">{formatDate(new Date(row.at))}</p>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <AnimatePresence>
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/10 p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
          >
            <h3 className="text-sm font-semibold tracking-tight">{t("Veprime stafi", "Staff actions")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("Ruaj ndryshimet poshtë. Statusi përditësohet menjëherë pas ruajtjes.", "Save changes below.")}
            </p>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quote-status">{t("Statusi", "Status")}</Label>
                <Select value={status} onValueChange={(v) => v != null && setStatus(v)}>
                  <SelectTrigger id="quote-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUOTE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s] ? (en ? STATUS_LABELS[s].en : STATUS_LABELS[s].sq) : s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-total">{t("Totali (numër)", "Total (number)")}</Label>
                <Input
                  id="quote-total"
                  inputMode="decimal"
                  value={totalStr}
                  onChange={(e) => setTotalStr(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-valid">{t("Vlefshmëria deri", "Valid until")}</Label>
                <Input
                  id="quote-valid"
                  type="datetime-local"
                  value={validLocal}
                  onChange={(e) => setValidLocal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-pdf">{t("URL e PDF", "PDF URL")}</Label>
                <Input
                  id="quote-pdf"
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-internal">{t("Shënim i brendshëm", "Internal note")}</Label>
                <Textarea
                  id="quote-internal"
                  rows={4}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder={t("Vetëm për stafin…", "Staff only…")}
                />
              </div>
              <Button type="button" className="w-full gap-2" disabled={saving} onClick={() => void saveStaffFields()}>
                <Save className="h-4 w-4" />
                {saving ? "…" : t("Ruaj", "Save")}
              </Button>
              {quote.pdfUrl ? (
                <Button variant="secondary" className="w-full" asChild>
                  <a href={quote.pdfUrl} target="_blank" rel="noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    {t("Hap PDF", "Open PDF")}
                  </a>
                </Button>
              ) : null}
              <Button variant="secondary" className="w-full" asChild>
                <a href={`mailto:${quote.contactEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  {t("Email klientit", "Email client")}
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`${lp}/kerko-oferte`}>{t("Formular publik", "Public request form")}</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </aside>
    </div>
  );
}
