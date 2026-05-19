export const PROJECT_STEP_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "ON_HOLD",
  "CLOSED",
] as const;

export type ProjectStepStatus = (typeof PROJECT_STEP_STATUSES)[number];

export type ProjectStepRow = {
  id: string;
  sortOrder: number;
  title: string;
  description: string | null;
  status: ProjectStepStatus;
  clientVisible: boolean;
  updatedAt: string;
};
