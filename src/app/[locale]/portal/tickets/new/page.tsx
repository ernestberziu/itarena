import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewTicketForm } from "@/components/portal/new-ticket-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tickets" });
  return { title: t("new") };
}

export default async function NewTicketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tickets" });
  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <AdminPageHeader
        title={t("new")}
        description={
          locale === "sq"
            ? "Përshkruani problemin tuaj IT dhe ekipi ynë do t'ju ndihmojë."
            : "Describe your IT issue and our team will help you."
        }
        breadcrumbs={[
          { label: t("title"), href: `${lp}/portal/tickets` },
          { label: t("new") },
        ]}
      />
      <NewTicketForm hideHeader />
    </div>
  );
}
