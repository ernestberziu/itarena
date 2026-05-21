"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function EmailClientButton({
  apiUrl,
  label,
  variant = "outline",
  className,
  size = "sm",
}: {
  apiUrl: string;
  label: string;
  variant?: "outline" | "secondary" | "default";
  className?: string;
  size?: "sm" | "default";
}) {
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const res = await fetch(apiUrl, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailSent?: boolean;
      };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      if (json.emailSent) {
        toast.success(label);
      } else {
        toast.warning("SMTP not configured — email was not sent");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={loading}
      onClick={() => void send()}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
      )}
      {label}
    </Button>
  );
}
