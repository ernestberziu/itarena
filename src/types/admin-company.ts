export type AdminCompanyRow = {
  id: string;
  name: string;
  vatNumber: string | null;
  city: string | null;
  country: string;
  tier: string;
  isApproved: boolean;
  createdAt: string;
  _count: { users: number; tickets: number; orders: number };
};

export type AdminCompanyDetail = {
  id: string;
  name: string;
  vatNumber: string | null;
  address: string | null;
  city: string | null;
  country: string;
  tier: string;
  isApproved: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { users: number; tickets: number; orders: number; quotes: number };
  members: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    lastLoginAt: string | null;
    role: string;
  }[];
  recentTickets: { id: string; number: string; title: string; status: string; createdAt: string }[];
  recentOrders: { id: string; orderNumber: string; status: string; total: string; createdAt: string }[];
};

export type CompanyLookupItem = {
  id: string;
  label: string;
  sublabel?: string;
  meta?: string;
};
