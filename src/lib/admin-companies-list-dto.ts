import type { AdminCompanyRow } from "@/types/admin-company";

type CompanyDbRow = {
  id: string;
  name: string;
  vatNumber: string | null;
  city: string | null;
  country: string;
  tier: string;
  isApproved: boolean;
  createdAt: Date;
  _count: { users: number; tickets: number; orders: number };
};

export function mapCompanyToAdminRow(c: CompanyDbRow): AdminCompanyRow {
  return {
    id: c.id,
    name: c.name,
    vatNumber: c.vatNumber,
    city: c.city,
    country: c.country,
    tier: c.tier,
    isApproved: c.isApproved,
    createdAt: c.createdAt.toISOString(),
    _count: c._count,
  };
}
