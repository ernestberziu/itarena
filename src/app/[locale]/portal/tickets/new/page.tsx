import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

export default async function NewTicketPage() {
  const session = await auth();
  if (!session) redirect("/hyr");

  return (
    <div className="max-w-2xl mx-auto">
      <NewTicketForm />
    </div>
  );
}
