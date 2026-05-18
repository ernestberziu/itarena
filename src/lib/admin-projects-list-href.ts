export type AdminProjectsListHrefParams = {
  q?: string | null;
  status?: string | null;
};

/** Builds admin projects list URL preserving active filters. */
export function buildAdminProjectsListHref(
  listPrefix: string,
  params: AdminProjectsListHrefParams
): string {
  const p = new URLSearchParams();
  if (params.q?.trim()) p.set("q", params.q.trim());
  const status = params.status?.trim();
  if (status) p.set("status", status);
  const qs = p.toString();
  return `${listPrefix}/admin/projects${qs ? `?${qs}` : ""}`;
}
