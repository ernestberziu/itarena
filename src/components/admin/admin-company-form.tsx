"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminWhiteInputClassName } from "@/components/admin/admin-white-dialog";

export function AdminCompanyForm({
  locale,
  lp,
  mode,
  initial,
}: {
  locale: string;
  lp: string;
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    vatNumber: string | null;
    address: string | null;
    city: string | null;
    country: string;
    notes: string | null;
  };
}) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);

  const [name, setName] = useState(initial?.name ?? "");
  const [vatNumber, setVatNumber] = useState(initial?.vatNumber ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [country, setCountry] = useState(initial?.country ?? "Albania");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name.trim()) {
      toast.error(t("Emri i kompanisë është i detyrueshëm", "Company name is required"));
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: name.trim(),
        vatNumber: vatNumber.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        country: country.trim() || "Albania",
        notes: notes.trim() || null,
      };

      const res = await fetch(
        mode === "create" ? "/api/admin/companies" : `/api/admin/companies/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Request failed");

      toast.success(mode === "create" ? t("Kompania u krijua", "Company created") : t("U ruajt", "Saved"));
      const id = mode === "create" ? (json as { id: string }).id : initial!.id;
      router.push(`${lp}/admin/companies/${id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t("Emri i kompanisë", "Company name")}</Label>
          <Input className={adminWhiteInputClassName} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("NIPT / VAT", "VAT number")}</Label>
          <Input className={adminWhiteInputClassName} value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("Qyteti", "City")}</Label>
          <Input className={adminWhiteInputClassName} value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t("Adresa", "Address")}</Label>
          <Input className={adminWhiteInputClassName} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t("Shteti", "Country")}</Label>
          <Input className={adminWhiteInputClassName} value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t("Shënime", "Notes")}</Label>
          <Textarea className={adminWhiteInputClassName} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void submit()} disabled={loading}>
          {mode === "create" ? t("Krijo kompaninë", "Create company") : t("Ruaj", "Save")}
        </Button>
        <Button variant="outline" onClick={() => router.back()} disabled={loading}>
          {t("Anulo", "Cancel")}
        </Button>
      </div>
    </div>
  );
}
