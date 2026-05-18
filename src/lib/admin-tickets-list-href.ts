export type AdminTicketsListHrefParams = {
  q?: string | null;
  status?: string | null;
  priority?: string | null;
  breached?: boolean;
  assignee?: string | null;
  requester?: string | null;
  projectId?: string | null;
};

/** Builds admin tickets list URL preserving active filters. */
export function buildAdminTicketsListHref(
  listPrefix: string,
  params: AdminTicketsListHrefParams
): string {
  const p = new URLSearchParams();
  if (params.q?.trim()) p.set("q", params.q.trim());
  if (params.status?.trim()) p.set("status", params.status.trim());
  if (params.priority?.trim()) p.set("priority", params.priority.trim());
  if (params.breached) p.set("filter", "breached");
  const a = params.assignee?.trim();
  if (a && a !== "__all__") p.set("assignee", a);
  const r = params.requester?.trim();
  if (r) p.set("requester", r);
  const proj = params.projectId?.trim();
  if (proj && proj !== "__all__") p.set("projectId", proj);
  const qs = p.toString();
  return `${listPrefix}/admin/tickets${qs ? `?${qs}` : ""}`;
}
