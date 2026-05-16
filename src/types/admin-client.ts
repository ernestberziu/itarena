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
  company: { name: string; tier: string | null; isApproved: boolean } | null;
  _count: { tickets: number; orders: number };
};
