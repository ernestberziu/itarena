"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

/** Admin or portal UI strings from `admin.ui` / `portal.ui` message namespaces. */
export function useUiT() {
  const pathname = usePathname() ?? "";
  const ns = pathname.includes("/portal") ? "portal.ui" : "admin.ui";
  return useTranslations(ns);
}
