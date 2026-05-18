export const PROJECT_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_ACCESS_LEVELS = ["read", "write", "admin"] as const;
export type ProjectAccess = (typeof PROJECT_ACCESS_LEVELS)[number];

export type ProjectListRow = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string };
  _count: {
    tickets: number;
    messages: number;
    members: number;
    clients: number;
  };
};

export type ProjectDetail = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  members: Array<{
    id: string;
    access: ProjectAccess;
    user: { id: string; firstName: string; lastName: string; email: string; role: string };
  }>;
  clients: Array<{
    id: string;
    company: { id: string; name: string } | null;
    user: { id: string; firstName: string; lastName: string; email: string } | null;
  }>;
};
