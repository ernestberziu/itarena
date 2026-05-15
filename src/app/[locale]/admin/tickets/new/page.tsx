import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { NewTicketForm } from "@/components/portal/new-ticket-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tickets" });
  return { title: t("new") };
}

export default async function AdminNewTicketPage({
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
    <div className="mx-auto max-w-3xl space-y-6 px-1 lg:max-w-4xl">
      <AdminPageHeader
        title={t("new")}
        description={
          locale === "sq"
            ? "Krijo një bilete për një klient ose për një kërkues pa llogari portali."
            : "Create a ticket for a portal client or a requester without a portal account."
        }
        breadcrumbs={[
          { label: locale === "sq" ? "Biletat" : "Tickets", href: `${lp}/admin/tickets` },
          { label: t("new") },
        ]}
      />
      <NewTicketForm variant="admin" />
    </div>
  );
}
