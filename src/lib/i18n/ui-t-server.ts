import { getTranslations } from "next-intl/server";

export async function getAdminUiT(locale: string) {
  return getTranslations({ locale, namespace: "admin.ui" });
}

export async function getPortalUiT(locale: string) {
  return getTranslations({ locale, namespace: "portal.ui" });
}
