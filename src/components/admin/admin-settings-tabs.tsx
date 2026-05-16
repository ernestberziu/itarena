"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminSettingsTabs({ locale }: { locale: string }) {
  const t = (sq: string, en: string) => (locale === "sq" ? sq : en);

  return (
    <Tabs defaultValue="general" className="gap-6">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto rounded-none border-b border-border/60 bg-transparent p-0">
        <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent px-4 py-3 data-active:border-primary data-active:bg-transparent">
          {t("Të përgjithshme", "General")}
        </TabsTrigger>
        <TabsTrigger value="email" className="rounded-none border-b-2 border-transparent px-4 py-3 data-active:border-primary data-active:bg-transparent">
          {t("Email & njoftime", "Email & alerts")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-0 outline-none">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Organizata", "Organization")}</CardTitle>
            <CardDescription>
              {t(
                "Emri i shfaqur në portale dhe komunikime.",
                "Name shown across the portal and communications."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">IT Arena</span>
            </p>
            <p>
              {t(
                "Për ndryshime të thella të markës kontaktoni administratorin e sistemit.",
                "Contact your system administrator for branding changes."
              )}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="email" className="mt-0 outline-none">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Email & njoftime", "Email & notifications")}</CardTitle>
            <CardDescription>
              {t(
                "Konfigurimi i SMTP dhe shablloneve vjen së shpejti.",
                "SMTP and template configuration is coming soon."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t(
              "Aktualisht njoftimet përdorin SMTP (mjedisi) kur është aktiv.",
              "Notifications currently use SMTP from environment variables when enabled."
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
