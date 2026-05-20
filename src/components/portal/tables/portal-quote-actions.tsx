"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalQuoteActions({
  quoteId,
  status: initialStatus,
  pdfUrl,
  locale,
  labels,
}: {
  quoteId: string;
  status: string;
  pdfUrl?: string | null;
  locale: string;
  labels: { accept: string; reject: string; download_pdf: string };
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const router = useRouter();

  async function action(newStatus: "ACCEPTED" | "REJECTED") {
    setLoading(newStatus === "ACCEPTED" ? "accept" : "reject");
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setStatus(newStatus);
      toast.success(
        newStatus === "ACCEPTED"
          ? locale === "sq"
            ? "Oferta u pranua!"
            : "Quote accepted!"
          : locale === "sq"
            ? "Oferta u refuzua."
            : "Quote rejected."
      );
      router.refresh();
    } catch {
      toast.error(locale === "sq" ? "Gabim. Provo sërish." : "Error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      {pdfUrl ? (
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" asChild>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
            {labels.download_pdf}
          </a>
        </Button>
      ) : null}
      {status === "SENT" ? (
        <>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={loading !== null}
            onClick={() => void action("ACCEPTED")}
          >
            {loading === "accept" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {labels.accept}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            disabled={loading !== null}
            onClick={() => void action("REJECTED")}
          >
            {loading === "reject" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {labels.reject}
          </Button>
        </>
      ) : null}
    </div>
  );
}
