import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PasscodeGate } from "@/components/public-share/passcode-gate";
import { PublicProjectView } from "@/components/public-share/public-project-view";
import { loadShareByToken } from "@/lib/public-share/assert-share-access";
import { checkShareAvailability } from "@/lib/public-share/share-status";
import {
  getShareSessionFromCookies,
  sessionMatchesShare,
} from "@/lib/public-share/session-cookie";
import { loadPublicShareProject } from "@/lib/public-share/load-project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicShareProjectPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const t = await getTranslations("publicShare");

  const share = await loadShareByToken(token);
  const availability = checkShareAvailability(share);
  if (!availability.ok) {
    const key = `errors.${availability.reason}` as "errors.expired";
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>{t("unavailableTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t(key)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (share!.resourceType !== "PROJECT" || !share!.projectId) notFound();

  const session = await getShareSessionFromCookies();
  if (!sessionMatchesShare(session, share!)) {
    return <PasscodeGate token={token} clientName={share!.clientName} locale={locale} />;
  }

  const project = await loadPublicShareProject(share!.projectId);
  if (!project) notFound();

  return (
    <PublicProjectView
      token={token}
      clientName={share!.clientName}
      locale={locale}
      project={{
        ...project,
        updatedAt: project.updatedAt.toISOString(),
      }}
    />
  );
}
