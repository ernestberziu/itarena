"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminSettingsTabs({ locale }: { locale: string }) {
  const tUi = useUiT();

  return (
    <Tabs defaultValue="general" className="gap-6">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto rounded-none border-b border-border/60 bg-transparent p-0">
        <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent px-4 py-3 data-active:border-primary data-active:bg-transparent">
          {tUi("general")}
        </TabsTrigger>
        <TabsTrigger value="email" className="rounded-none border-b-2 border-transparent px-4 py-3 data-active:border-primary data-active:bg-transparent">
          {tUi("email_alerts")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-0 outline-none">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tUi("organization")}</CardTitle>
            <CardDescription>
              {tUi("name_shown_across_the_portal_and_communications")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">IT Arena</span>
            </p>
            <p>
              {tUi("contact_your_system_administrator_for_branding_c")}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="email" className="mt-0 outline-none">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tUi("email_notifications")}</CardTitle>
            <CardDescription>
              {tUi("smtp_and_template_configuration_is_coming_soon")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {tUi("notifications_currently_use_smtp_from_environmen")}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
