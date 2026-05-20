export function contractDocumentPath(type: string, id: string, lp: string): string {
  if (type === "EMPLOYMENT") return `${lp}/admin/templates/contracts/employment/${id}`;
  if (type === "PARTNER_CONTRACT") return `${lp}/admin/templates/contracts/partner/${id}`;
  return `${lp}/admin/templates/contracts/service/${id}`;
}
