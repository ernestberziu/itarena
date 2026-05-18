import type { AdminClientRow } from "@/types/admin-client";

type ClientDbRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  emailVerified: Date | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  company: { name: string; tier: string; isApproved: boolean } | null;
  _count: { tickets: number; orders: number };
};

export function mapClientToAdminRow(u: ClientDbRow): AdminClientRow {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    isActive: u.isActive,
    emailVerified: u.emailVerified?.toISOString() ?? null,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    company: u.company,
    _count: u._count,
  };
}
