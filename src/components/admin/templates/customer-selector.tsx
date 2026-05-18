"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ContractParty } from "@/lib/templates/types";

type PartyRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  companyId: string | null;
  companyName: string | null;
  vatNumber: string | null;
  address: string | null;
};

export function CustomerSelector({
  party,
  onChange,
  labels,
}: {
  party: ContractParty;
  onChange: (p: ContractParty) => void;
  labels: { portal: string; manual: string; customer: string };
}) {
  const t = useTranslations("admin.templatesPage");
  const [mode, setMode] = useState<"portal" | "manual">(party.mode);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PartyRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (q.length < 2) {
        if (!cancelled) setResults([]);
        return;
      }
      const res = await fetch(`/api/admin/templates/parties?q=${encodeURIComponent(q)}`);
      if (cancelled) return;
      if (res.ok) setResults((await res.json()) as PartyRow[]);
    };

    const timer = setTimeout(() => void run(), 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  function selectPortal(row: PartyRow) {
    onChange({
      mode: "portal",
      userId: row.id,
      companyId: row.companyId ?? undefined,
      fullName: `${row.firstName} ${row.lastName}`.trim(),
      companyName: row.companyName ?? undefined,
      nuis: row.vatNumber ?? undefined,
      address: row.address ?? undefined,
      phone: row.phone ?? undefined,
      email: row.email,
    });
    setQ("");
    setResults([]);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-[var(--admin-card-surface,hsl(var(--card)))] p-4">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "portal" ? "default" : "outline"}
          onClick={() => {
            setMode("portal");
            onChange({ ...party, mode: "portal" });
          }}
        >
          {labels.portal}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => {
            setMode("manual");
            onChange({ ...party, mode: "manual" });
          }}
        >
          {labels.manual}
        </Button>
      </div>
      {mode === "portal" ? (
        <div className="space-y-2">
          <Label>{labels.customer}</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("partySearch")}
            />
          </div>
          {results.length > 0 ? (
            <ul className="max-h-40 overflow-auto rounded-lg border">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => selectPortal(r)}
                  >
                    {r.firstName} {r.lastName} · {r.email}
                    {r.companyName ? ` · ${r.companyName}` : ""}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {party.fullName ? (
            <p className="text-sm text-muted-foreground">
              {t("partySelected")}:{" "}
              <span className="font-medium text-foreground">{party.fullName}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>{t("partyFullName")}</Label>
            <Input value={party.fullName} onChange={(e) => onChange({ ...party, fullName: e.target.value })} />
          </div>
          <div>
            <Label>{t("partyCompany")}</Label>
            <Input value={party.companyName ?? ""} onChange={(e) => onChange({ ...party, companyName: e.target.value })} />
          </div>
          <div>
            <Label>{t("partyNipt")}</Label>
            <Input value={party.nuis ?? ""} onChange={(e) => onChange({ ...party, nuis: e.target.value })} />
          </div>
          <div>
            <Label>{t("partyId")}</Label>
            <Input
              value={party.idNumber ?? ""}
              onChange={(e) => onChange({ ...party, idNumber: e.target.value })}
              placeholder={t("partyIdHint")}
            />
          </div>
          <div>
            <Label>{t("partyEmail")}</Label>
            <Input value={party.email ?? ""} onChange={(e) => onChange({ ...party, email: e.target.value })} />
          </div>
          <div>
            <Label>{t("partyPhone")}</Label>
            <Input value={party.phone ?? ""} onChange={(e) => onChange({ ...party, phone: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>{t("partyAddress")}</Label>
            <Input value={party.address ?? ""} onChange={(e) => onChange({ ...party, address: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}
