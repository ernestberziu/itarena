import { redirect } from "next/navigation";

/** Drafts list removed — send old links to document history. */
export default async function TemplatesDraftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;
  redirect(`${lp}/admin/templates/history`);
}
