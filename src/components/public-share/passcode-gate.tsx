"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function PasscodeGate({
  token,
  clientName,
  locale,
}: {
  token: string;
  clientName: string;
  locale: string;
}) {
  const router = useRouter();
  const t = useTranslations("publicShare");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/share/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, passcode }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const key = json.error ?? "invalid_passcode";
        setError(t(`errors.${key}` as "errors.invalid_passcode"));
        return;
      }
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card className="shadow-lg border-border/60">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{t("gateTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            {t("gateGreeting", { name: clientName })}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <div>
              <Label htmlFor="share-passcode">{t("passcodeLabel")}</Label>
              <Input
                id="share-passcode"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                placeholder={t("passcodePlaceholder")}
                className="mt-1 font-mono tracking-widest uppercase"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !passcode.trim()}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
