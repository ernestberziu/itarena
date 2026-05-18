"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/admin/projects/project-form";

export default function NewProjectPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "sq";
  const lp = locale === "sq" ? "" : `/${locale}`;
  const t = useTranslations("admin.projectsPage");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("newProject")}
        description={locale === "en" ? "Set up the project, team, and clients." : "Konfiguroni projektin, ekipin dhe klientët."}
        toolbar={
          <Button variant="outline" size="sm" asChild>
            <Link href={`${lp}/admin/projects`}>{locale === "en" ? "← Back" : "← Kthehu"}</Link>
          </Button>
        }
      />
      <ProjectForm mode="create" locale={locale} listPrefix={lp} canWrite />
    </div>
  );
}
