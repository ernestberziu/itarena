"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Search, Building2, Gauge, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIVISION_LABELS } from "@/lib/sla";
import { cn } from "@/lib/utils";

/** Sentinel for Base UI Select so `value` is never undefined (controlled mode). */
const DIVISION_SELECT_NONE = "__division_none__";

const schema = z.object({
  title: z.string().min(5, "Titulli duhet të ketë të paktën 5 karaktere"),
  division: z.string().min(1, "Zgjidhni divisionin"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().min(20, "Përshkrimi duhet të ketë të paktën 20 karaktere"),
});

type FormValues = z.infer<typeof schema>;

type RequesterRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
};

type AssigneeRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

function formatRequesterLabel(u: RequesterRow, locale: string) {
  const name = `${u.firstName} ${u.lastName}`.trim();
  const bits = [name || u.email, u.email, u.companyName].filter(Boolean);
  return bits.join(" · ");
}

export function NewTicketForm({ variant = "portal" }: { variant?: "portal" | "admin" }) {
  const t = useTranslations("tickets");
  const locale = useLocale();
  const router = useRouter();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const ticketsListHref = `${lp}/${variant === "admin" ? "admin" : "portal"}/tickets`;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: "MEDIUM",
      division: "",
    },
  });

  const { isSubmitting } = form.formState;

  const [requesterMode, setRequesterMode] = useState<"portal_user" | "external" | "invite">(
    "portal_user"
  );
  const [requesterQuery, setRequesterQuery] = useState("");
  const [requesterResults, setRequesterResults] = useState<RequesterRow[]>([]);
  const [requesterLoading, setRequesterLoading] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState<RequesterRow | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [externalName, setExternalName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [estimatedDaysInput, setEstimatedDaysInput] = useState("");
  const [estimatedHoursInput, setEstimatedHoursInput] = useState("");
  const [assignees, setAssignees] = useState<AssigneeRow[]>([]);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "admin") return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/ticket-assignees");
        if (!res.ok) return;
        const data = (await res.json()) as AssigneeRow[];
        if (!cancelled) setAssignees(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setAssignees([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variant]);

  useEffect(() => {
    if (variant !== "admin" || requesterMode !== "portal_user") return;
    const q = requesterQuery.trim();
    if (q.length < 2) {
      setRequesterResults([]);
      setRequesterLoading(false);
      return;
    }
    setRequesterLoading(true);
    const tmr = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/ticket-requesters?q=${encodeURIComponent(q)}&limit=20`
        );
        if (!res.ok) {
          setRequesterResults([]);
          return;
        }
        const data = (await res.json()) as RequesterRow[];
        setRequesterResults(Array.isArray(data) ? data : []);
      } catch {
        setRequesterResults([]);
      } finally {
        setRequesterLoading(false);
      }
    }, 320);
    return () => window.clearTimeout(tmr);
  }, [requesterQuery, requesterMode, variant]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [pickerOpen]);

  const onSelectRequester = useCallback((u: RequesterRow) => {
    setSelectedRequester(u);
    setRequesterQuery(formatRequesterLabel(u, locale));
    setPickerOpen(false);
    setExternalName("");
  }, [locale]);

  async function onSubmit(values: FormValues) {
    let requesterUserId: string | undefined;
    let externalRequesterName: string | undefined;
    let inviteRequester: { email: string; firstName: string; lastName: string } | undefined;

    if (variant === "admin") {
      if (requesterMode === "portal_user" && selectedRequester) {
        requesterUserId = selectedRequester.id;
      } else if (requesterMode === "external") {
        const ext = externalName.trim();
        if (ext.length > 0 && ext.length < 2) {
          toast.error(
            locale === "sq"
              ? "Emri i kërkuesit duhet të ketë të paktën 2 karaktere"
              : "External requester name must be at least 2 characters"
          );
          return;
        }
        if (ext.length >= 2) externalRequesterName = ext;
      } else if (requesterMode === "invite") {
        const email = inviteEmail.trim().toLowerCase();
        const fn = inviteFirstName.trim();
        const ln = inviteLastName.trim();
        if (!email || !fn || !ln) {
          toast.error(
            locale === "sq"
              ? "Plotësoni emailin dhe emrin për ftesën"
              : "Fill in email and name for the invite"
          );
          return;
        }
        if (fn.length < 2 || ln.length < 2) {
          toast.error(
            locale === "sq"
              ? "Emri dhe mbiemri: të paktën 2 karaktere secili"
              : "First and last name must be at least 2 characters each"
          );
          return;
        }
        inviteRequester = { email, firstName: fn, lastName: ln };
      }
    }

    let estimatedDays: number | undefined;
    let estimatedHours: number | undefined;
    const rawDays = estimatedDaysInput.trim();
    const rawHours = estimatedHoursInput.trim();

    if (rawDays.length > 0) {
      const nd = Number.parseInt(rawDays, 10);
      if (Number.isNaN(nd) || nd < 0 || nd > 62) {
        toast.error(
          locale === "sq"
            ? "Ditët e vlerësuara: 0–62"
            : "Estimated days must be a whole number from 0 to 62"
        );
        return;
      }
      estimatedDays = nd;
    }
    if (rawHours.length > 0) {
      const nh = Number.parseInt(rawHours, 10);
      if (Number.isNaN(nh) || nh < 0 || nh > 500) {
        toast.error(
          locale === "sq"
            ? "Orët e vlerësuara: 0–500"
            : "Estimated hours must be a whole number from 0 to 500"
        );
        return;
      }
      estimatedHours = nh;
    }

    const d = estimatedDays ?? 0;
    const h = estimatedHours ?? 0;
    const sum = d * 8 + h;
    if (sum > 4000) {
      toast.error(
        locale === "sq"
          ? "Shuma ditë×8 + orë nuk mund të kalojë 4000 orë pune"
          : "Combined estimate (days×8 + hours) cannot exceed 4000 working hours"
      );
      return;
    }
    if (sum === 0 && (rawDays.length > 0 || rawHours.length > 0)) {
      toast.error(
        locale === "sq"
          ? "Vendosni të paktën një ditë ose orë > 0"
          : "Enter at least one day or hour greater than zero"
      );
      return;
    }

    const estimatePayload: Record<string, number> = {};
    if (sum > 0) {
      if (d > 0) estimatePayload.estimatedDays = d;
      if (h > 0) estimatePayload.estimatedHours = h;
    }

    const body =
      variant === "admin"
        ? {
            ...values,
            ...(requesterUserId ? { requesterUserId } : {}),
            ...(externalRequesterName ? { externalRequesterName } : {}),
            ...(inviteRequester ? { inviteRequester } : {}),
            ...(assigneeId ? { assignedToId: assigneeId } : {}),
            ...estimatePayload,
          }
        : { ...values, ...estimatePayload };

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg =
        locale === "sq" ? "Gabim gjatë krijimit të biletës" : "Error creating ticket";
      try {
        const err = (await res.json()) as { error?: string };
        if (err.error) msg = err.error;
      } catch {
        /* ignore */
      }
      toast.error(msg);
      return;
    }

    const data = (await res.json()) as {
      id: string;
      number: string;
      invite?: { emailSent?: boolean; tempPassword?: string };
    };
    const successTitle =
      locale === "sq"
        ? `Bileta ${data.number} u krijua me sukses!`
        : `Ticket ${data.number} created successfully!`;

    if (data.invite?.tempPassword) {
      toast.success(successTitle, {
        description:
          locale === "sq"
            ? `Emaili i ftesës nuk u dërgua. Fjalëkalimi i përkohshëm (kopjojeni): ${data.invite.tempPassword}`
            : `Invite email was not sent. Temporary password (copy now): ${data.invite.tempPassword}`,
        duration: 45_000,
      });
    } else if (data.invite?.emailSent) {
      toast.success(successTitle, {
        description:
          locale === "sq"
            ? "Përdoruesi u krijua dhe ftesa me fjalëkalim u dërgua me email."
            : "User was created and the invite email with a temporary password was sent.",
      });
    } else {
      toast.success(successTitle);
    }
    router.push(`${ticketsListHref}/${data.id}`);
  }

  const divisions = Object.entries(DIVISION_LABELS);

  const priorityOptions = [
    { value: "LOW" as const, sq: "E Ulët", en: "Low" },
    { value: "MEDIUM" as const, sq: "Mesatare", en: "Medium" },
    { value: "HIGH" as const, sq: "E Lartë", en: "High" },
    { value: "CRITICAL" as const, sq: "Kritike", en: "Critical" },
  ];

  const divisionValue = form.watch("division") ?? "";
  const divisionSelectValue =
    divisionValue.length > 0 ? divisionValue : DIVISION_SELECT_NONE;
  const divisionPlaceholder =
    locale === "sq" ? "Zgjidhni divisionin" : "Select division";
  const divisionTriggerLabel =
    divisionSelectValue !== DIVISION_SELECT_NONE
      ? DIVISION_LABELS[divisionSelectValue]?.[locale as "sq" | "en"] ?? divisionSelectValue
      : divisionPlaceholder;

  const assigneeUnassignedLabel = locale === "sq" ? "Pa caktim" : "Unassigned";
  const assigneeTriggerLabel =
    assigneeId != null
      ? (() => {
          const a = assignees.find((x) => x.id === assigneeId);
          return a ? `${a.firstName} ${a.lastName}`.trim() : assigneeUnassignedLabel;
        })()
      : assigneeUnassignedLabel;

  const priorityValue = form.watch("priority");

  const prioritySegmentClass = (value: FormValues["priority"], selected: boolean) =>
    cn(
      "rounded-lg border px-2 py-2.5 text-center text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      selected ? "shadow-sm ring-1" : "hover:brightness-[0.98] dark:hover:brightness-110",
      value === "LOW" &&
        (selected
          ? "border-border bg-muted text-foreground ring-foreground/10"
          : "border-transparent bg-muted/25 text-muted-foreground hover:bg-muted/40"),
      value === "MEDIUM" &&
        (selected
          ? "border-sky-300 bg-sky-100 text-sky-950 ring-sky-300/40 dark:border-sky-700 dark:bg-sky-950/60 dark:text-sky-100 dark:ring-sky-500/20"
          : "border-transparent bg-sky-500/5 text-sky-800/80 hover:bg-sky-500/10 dark:text-sky-200/80"),
      value === "HIGH" &&
        (selected
          ? "border-orange-300 bg-orange-100 text-orange-950 ring-orange-300/40 dark:border-orange-700 dark:bg-orange-950/50 dark:text-orange-100 dark:ring-orange-500/20"
          : "border-transparent bg-orange-500/5 text-orange-900/80 hover:bg-orange-500/10 dark:text-orange-200/80"),
      value === "CRITICAL" &&
        (selected
          ? "border-red-300 bg-red-100 text-red-950 ring-red-300/40 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100 dark:ring-red-500/20"
          : "border-transparent bg-red-500/5 text-red-900/80 hover:bg-red-500/10 dark:text-red-200/80")
    );

  const issueFields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">{t("subject")} *</Label>
        <Input
          id="title"
          placeholder={
            locale === "sq"
              ? "P.sh. Kompjuteri nuk ndizet..."
              : "E.g. Computer won't start..."
          }
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div
        className={cn(
          "rounded-xl border border-border/60 p-4 shadow-sm",
          "bg-gradient-to-b from-muted/40 via-muted/15 to-transparent",
          "ring-1 ring-black/[0.03] dark:from-muted/25 dark:via-muted/10 dark:ring-white/[0.06]"
        )}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/60">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
              </span>
              {t("division")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={divisionSelectValue}
              onValueChange={(v) => {
                const next = v == null || v === DIVISION_SELECT_NONE ? "" : v;
                form.setValue("division", next, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            >
              <SelectTrigger
                size="default"
                className="h-10 w-full min-w-0 border-border/80 bg-background/90 shadow-sm hover:bg-background dark:bg-background/50"
              >
                <SelectValue placeholder={divisionPlaceholder}>
                  {divisionTriggerLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
                <SelectItem value={DIVISION_SELECT_NONE}>{divisionPlaceholder}</SelectItem>
                {divisions.map(([key, labels]) => (
                  <SelectItem key={key} value={key}>
                    {labels[locale as "sq" | "en"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.division && (
              <p className="text-xs text-destructive">
                {locale === "sq" ? "E detyrueshme" : "Required"}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/60">
                <Gauge className="h-3.5 w-3.5" aria-hidden />
              </span>
              {t("priority")}
            </Label>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              role="radiogroup"
              aria-label={locale === "sq" ? "Prioriteti" : "Priority"}
            >
              {priorityOptions.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  role="radio"
                  aria-checked={priorityValue === p.value}
                  className={prioritySegmentClass(p.value, priorityValue === p.value)}
                  onClick={() =>
                    form.setValue("priority", p.value, { shouldValidate: true, shouldDirty: true })
                  }
                >
                  {p[locale as "sq" | "en"]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("description")} *</Label>
        <Textarea
          id="description"
          rows={6}
          placeholder={
            locale === "sq"
              ? "Përshkruani problemin sa më detajisht të mundeni..."
              : "Describe the issue in as much detail as possible..."
          }
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>
    </>
  );

  if (variant === "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={ticketsListHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {locale === "sq" ? "Kthehu te lista" : "Back to list"}
            </Link>
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-semibold">
                {locale === "sq" ? "Kërkuesi" : "Requester"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {locale === "sq"
                  ? "Zgjidh përdorues ekzistues, emër të lirë pa llogari, ose krijo përdorues të ri me email dhe ftesë."
                  : "Pick an existing portal user, a free-text name without an account, or create a new user by email with an invite."}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-0.5 sm:flex-row">
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors sm:flex-1 sm:text-center",
                    requesterMode === "portal_user"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    setRequesterMode("portal_user");
                    setExternalName("");
                    setInviteEmail("");
                    setInviteFirstName("");
                    setInviteLastName("");
                  }}
                >
                  {locale === "sq" ? "Përdorues portali" : "Portal user"}
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors sm:flex-1 sm:text-center",
                    requesterMode === "external"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    setRequesterMode("external");
                    setSelectedRequester(null);
                    setRequesterQuery("");
                    setRequesterResults([]);
                    setPickerOpen(false);
                    setInviteEmail("");
                    setInviteFirstName("");
                    setInviteLastName("");
                  }}
                >
                  {locale === "sq" ? "Vetëm emri" : "Name only"}
                </button>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-start gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors sm:flex-1 sm:justify-center sm:text-center",
                    requesterMode === "invite"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    setRequesterMode("invite");
                    setSelectedRequester(null);
                    setRequesterQuery("");
                    setRequesterResults([]);
                    setPickerOpen(false);
                    setExternalName("");
                  }}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  {locale === "sq" ? "Ftesë me email" : "Invite by email"}
                </button>
              </div>

              {requesterMode === "portal_user" ? (
                <div className="space-y-2" ref={comboboxRef}>
                  <Label htmlFor="requester-search">
                    {locale === "sq" ? "Kërko klient" : "Search client"}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="requester-search"
                      className="pl-9"
                      autoComplete="off"
                      placeholder={
                        locale === "sq"
                          ? "Emër ose email (min. 2 karaktere)…"
                          : "Name or email (min. 2 chars)…"
                      }
                      value={requesterQuery}
                      onChange={(e) => {
                        setRequesterQuery(e.target.value);
                        setSelectedRequester(null);
                        setPickerOpen(true);
                      }}
                      onFocus={() => setPickerOpen(true)}
                    />
                    {pickerOpen && requesterQuery.trim().length >= 2 && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-md ring-1 ring-foreground/10">
                        {requesterLoading ? (
                          <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {locale === "sq" ? "Duke kërkuar…" : "Searching…"}
                          </div>
                        ) : requesterResults.length === 0 ? (
                          <p className="px-3 py-2 text-muted-foreground">
                            {locale === "sq" ? "Nuk u gjet asgjë" : "No matches"}
                          </p>
                        ) : (
                          requesterResults.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-muted"
                              onClick={() => onSelectRequester(u)}
                            >
                              <span className="font-medium">
                                {u.firstName} {u.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {u.email}
                                {u.companyName ? ` · ${u.companyName}` : ""}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedRequester && (
                    <p className="text-xs text-muted-foreground">
                      {locale === "sq" ? "Zgjedhur:" : "Selected:"}{" "}
                      {formatRequesterLabel(selectedRequester, locale)}
                    </p>
                  )}
                </div>
              ) : requesterMode === "external" ? (
                <div className="space-y-2">
                  <Label htmlFor="external-requester">
                    {locale === "sq" ? "Emri i kërkuesit" : "Requester name"}
                  </Label>
                  <Input
                    id="external-requester"
                    maxLength={200}
                    placeholder={
                      locale === "sq" ? "P.sh. Ana nga ABC Sh.p.k." : "E.g. Jane at ABC Ltd"
                    }
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === "sq"
                      ? "Bileta mbetet e lidhur me llogarinë tuaj të stafit; emri shfaqet si kërkues i jashtëm."
                      : "The ticket stays tied to your staff account; this name is shown as the external requester."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    {locale === "sq"
                      ? "Krijohet një llogari klienti me fjalëkalim të përkohshëm; përdoruesi bëhet pronari i biletës dhe merr email ftese (nëse Resend është i konfiguruar)."
                      : "Creates a client account with a temporary password; they become the ticket owner and receive an invite email when Resend is configured."}
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      autoComplete="off"
                      placeholder="name@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="invite-first">{locale === "sq" ? "Emri" : "First name"} *</Label>
                      <Input
                        id="invite-first"
                        autoComplete="off"
                        placeholder={locale === "sq" ? "Ana" : "Jane"}
                        value={inviteFirstName}
                        onChange={(e) => setInviteFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-last">{locale === "sq" ? "Mbiemri" : "Last name"} *</Label>
                      <Input
                        id="invite-last"
                        autoComplete="off"
                        placeholder={locale === "sq" ? "Hoxha" : "Doe"}
                        value={inviteLastName}
                        onChange={(e) => setInviteLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-semibold">
                {locale === "sq" ? "Problemi" : "Issue"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">{issueFields}</CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-semibold">
                {locale === "sq" ? "Planifikim" : "Planning"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Cakto te stafi (opsionale)" : "Assign to staff (optional)"}</Label>
                <Select
                  value={assigneeId ?? "__none__"}
                  onValueChange={(v) => setAssigneeId(v === "__none__" ? null : v)}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder={assigneeUnassignedLabel}>
                      {assigneeTriggerLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{assigneeUnassignedLabel}</SelectItem>
                    {assignees.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} · {a.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground max-w-prose">
                  {locale === "sq"
                    ? "Nëse zgjidhni dikë, bileta krijohet si e CAKTUAR për atë përdorues."
                    : "If you pick someone, the ticket is created in ASSIGNED state for that user."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="est-days">
                    {locale === "sq" ? "Ditë pune (opsionale)" : "Working days (optional)"}
                  </Label>
                  <Input
                    id="est-days"
                    type="number"
                    min={0}
                    max={62}
                    step={1}
                    inputMode="numeric"
                    placeholder="0"
                    value={estimatedDaysInput}
                    onChange={(e) => setEstimatedDaysInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="est-hours">
                    {locale === "sq" ? "Orë shtesë (opsionale)" : "Additional hours (optional)"}
                  </Label>
                  <Input
                    id="est-hours"
                    type="number"
                    min={0}
                    max={500}
                    step={1}
                    inputMode="numeric"
                    placeholder="0"
                    value={estimatedHoursInput}
                    onChange={(e) => setEstimatedHoursInput(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground max-w-prose">
                {locale === "sq"
                  ? "Afati SLA llogaritet nga krijimi: ditë×8 orë + orë shtesë (orë të zakonshme); maks. 4000 orë gjithsej. Lëreni bosh për pa afat."
                  : "SLA deadline = created time + days×8h + hours (wall-clock); max 4000 hours total. Leave both empty for no deadline."}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" asChild>
              <Link href={ticketsListHref}>{locale === "sq" ? "Anulo" : "Cancel"}</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {locale === "sq" ? "Hap Biletën" : "Open Ticket"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={ticketsListHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === "sq" ? "Kthehu" : "Back"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t("new")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "sq" ? "Detajet e Biletës" : "Ticket Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {issueFields}

            <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-4">
              <p className="text-sm font-medium">
                {locale === "sq" ? "Planifikim (opsionale)" : "Planning (optional)"}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="portal-est-days">
                    {locale === "sq" ? "Ditë pune" : "Working days"}
                  </Label>
                  <Input
                    id="portal-est-days"
                    type="number"
                    min={0}
                    max={62}
                    step={1}
                    inputMode="numeric"
                    placeholder="0"
                    value={estimatedDaysInput}
                    onChange={(e) => setEstimatedDaysInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portal-est-hours">
                    {locale === "sq" ? "Orë shtesë" : "Additional hours"}
                  </Label>
                  <Input
                    id="portal-est-hours"
                    type="number"
                    min={0}
                    max={500}
                    step={1}
                    inputMode="numeric"
                    placeholder="0"
                    value={estimatedHoursInput}
                    onChange={(e) => setEstimatedHoursInput(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground max-w-prose">
                {locale === "sq"
                  ? "Afati SLA nga krijimi: ditë×8 orë + orë shtesë; maks. 4000 orë. Lëreni bosh për pa afat."
                  : "SLA from created time: days×8h + hours; max 4000h. Leave empty for no deadline."}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href={ticketsListHref}>{locale === "sq" ? "Anulo" : "Cancel"}</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {locale === "sq" ? "Hap Biletën" : "Open Ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
