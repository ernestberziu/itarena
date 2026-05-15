"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QUOTE_STATUSES } from "@/lib/admin-quote-status";

const STATUSES = QUOTE_STATUSES;

const LABELS: Record<string, { sq: string; en: string }> = {
  PENDING: { sq: "Pritëse", en: "Pending" },
  REVIEWING: { sq: "Shqyrtohet", en: "Reviewing" },
  SENT: { sq: "Dërguar", en: "Sent" },
  ACCEPTED: { sq: "Pranuar", en: "Accepted" },
  REJECTED: { sq: "Refuzuar", en: "Rejected" },
  REVISION_REQUESTED: { sq: "Kërkohet rishikim", en: "Revision" },
};

interface Props {
  quoteId: string;
  currentStatus: string;
  locale: string;
}

export function AdminQuoteStatusUpdater({ quoteId, currentStatus, locale }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(value: string | null) {
    if (!value) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) throw new Error();
      setStatus(value);
      toast.success(locale === "sq" ? "Statusi u përditësua" : "Status updated");
      router.refresh();
    } catch {
      toast.error(locale === "sq" ? "Gabim gjatë përditësimit" : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="h-7 text-xs w-36 border-dashed">
        <SelectValue>
          {LABELS[status]?.[locale as "sq" | "en"] ?? status}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {LABELS[s]?.[locale as "sq" | "en"] ?? s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
