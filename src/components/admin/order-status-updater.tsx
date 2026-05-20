"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUSES, orderStatusLabel } from "@/lib/admin-order-status";

interface Props {
  orderId: string;
  currentStatus: string;
  locale: string;
}

export function AdminOrderStatusUpdater({ orderId, currentStatus, locale }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(value: string | null) {
    if (!value) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
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
        <SelectValue>{orderStatusLabel(status, locale)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {orderStatusLabel(s, locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
