"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  REVIEWING: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  SENT: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
  ACCEPTED: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  REJECTED: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  REVISION_REQUESTED: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
};

const STATUS_LABELS: Record<string, { sq: string; en: string }> = {
  PENDING: { sq: "Pritëse", en: "Pending" },
  REVIEWING: { sq: "Shqyrtohet", en: "Reviewing" },
  SENT: { sq: "Dërguar", en: "Sent" },
  ACCEPTED: { sq: "Pranuar", en: "Accepted" },
  REJECTED: { sq: "Refuzuar", en: "Rejected" },
  REVISION_REQUESTED: { sq: "Kërkohet rishikim", en: "Revision Requested" },
};

interface QuoteCardProps {
  quote: {
    id: string;
    quoteNumber: string;
    title: string;
    status: string;
    amount: number | null;
    notes: string | null;
    validUntil: Date | null;
    createdAt: Date;
    pdfUrl?: string | null;
  };
  locale: string;
  t: { accept: string; reject: string; valid_until: string; download_pdf?: string };
}

export function PortalQuoteCard({ quote, locale, t }: QuoteCardProps) {
  const [status, setStatus] = useState(quote.status);
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const router = useRouter();

  async function action(newStatus: "ACCEPTED" | "REJECTED") {
    setLoading(newStatus === "ACCEPTED" ? "accept" : "reject");
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setStatus(newStatus);
      toast.success(
        newStatus === "ACCEPTED"
          ? locale === "sq" ? "Oferta u pranua!" : "Quote accepted!"
          : locale === "sq" ? "Oferta u refuzua." : "Quote rejected."
      );
      router.refresh();
    } catch {
      toast.error(locale === "sq" ? "Gabim. Provo sërish." : "Error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const sl = STATUS_LABELS[status];
  const styleClass = STATUS_STYLES[status] ?? "";

  return (
    <div className="rounded-xl border bg-card hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-sm font-medium text-muted-foreground">
              {quote.quoteNumber}
            </span>
            {sl && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styleClass}`}>
                {sl[locale as "sq" | "en"]}
              </span>
            )}
          </div>
          <p className="font-semibold text-sm">{quote.title}</p>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{formatDate(quote.createdAt)}</span>
            {quote.validUntil && (
              <span>{t.valid_until}: {formatDate(quote.validUntil)}</span>
            )}
            {quote.amount !== null && (
              <span className="font-semibold text-foreground">{formatPrice(quote.amount)}</span>
            )}
          </div>
          {quote.notes && (
            <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              {quote.notes}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {quote.pdfUrl ? (
            <Button size="sm" variant="outline" className="text-xs gap-1.5" asChild>
              <a href={quote.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                {t.download_pdf ?? (locale === "sq" ? "Shkarko PDF" : "Download PDF")}
              </a>
            </Button>
          ) : null}
          {status === "SENT" ? (
            <>
              <Button
                size="sm"
                className="text-xs gap-1.5"
                disabled={loading !== null}
                onClick={() => action("ACCEPTED")}
              >
                {loading === "accept" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {t.accept}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
                disabled={loading !== null}
                onClick={() => action("REJECTED")}
              >
                {loading === "reject" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {t.reject}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
