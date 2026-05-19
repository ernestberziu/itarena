export type CalendarDaySummary = {
  date: string;
  submittedCount: number;
  hasOwnReport: boolean;
  hasAdminReply: boolean;
};

export type CalendarMonthPayload = {
  year: number;
  month: number;
  staffTotal: number;
  monthSubmittedTotal: number;
  monthPossibleTotal: number;
  todayDate: string;
  todaySubmittedCount: number;
  days: CalendarDaySummary[];
};

export type CalendarReplyRow = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export type CalendarReportRow = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  replies: CalendarReplyRow[];
};

export type CalendarStaffDayRow = {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  report: CalendarReportRow | null;
};

export type CalendarDayPayload = {
  date: string;
  staffTotal: number;
  submittedCount: number;
  isAdminView: boolean;
  staff: CalendarStaffDayRow[];
  ownReport: CalendarReportRow | null;
};

export type CalendarReportPayload = {
  id: string;
  date: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  replies: CalendarReplyRow[];
};

export type CalendarPrintDayRow = {
  date: string;
  report: CalendarReportRow | null;
};

export type CalendarPrintStaffRow = {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  days: CalendarPrintDayRow[];
};

export type CalendarPrintPayload = {
  year: number;
  month: number;
  staff: CalendarPrintStaffRow[];
};
