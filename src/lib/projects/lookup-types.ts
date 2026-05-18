export type ProjectLookupItem = {
  id: string;
  label: string;
  sublabel?: string;
  meta?: string;
};

export function parseLookupLimit(searchParams: URLSearchParams): number {
  return Math.min(20, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20));
}
