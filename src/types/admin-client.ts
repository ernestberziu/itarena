import type { RegistrationCompanySnapshot } from "@/lib/registration-company-snapshot";

export type AdminClientRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  emailVerified: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  company: { id: string; name: string; tier: string | null; isApproved: boolean } | null;
  registrationCompanySnapshot: RegistrationCompanySnapshot | null;
  hasRegistrationCompanyData: boolean;
  _count: { tickets: number; orders: number };
};
