"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function markAllRead() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/mark-read", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success(locale === "sq" ? "Të gjitha u shënuan si të lexuara" : "All marked as read");
      router.refresh();
    } catch {
      toast.error(locale === "sq" ? "Gabim. Provo sërish." : "Error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={markAllRead} disabled={loading} className="gap-2 text-xs">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />}
      {locale === "sq" ? "Shëno të gjitha si të lexuara" : "Mark all as read"}
    </Button>
  );
}
