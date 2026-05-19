import { z } from "zod";

export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export const calendarMonthQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const calendarPrintQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  userIds: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : []
    ),
});

export const calendarDayQuerySchema = z.object({
  date: calendarDateSchema,
});

export const upsertReportSchema = z.object({
  date: calendarDateSchema,
  body: z.string().trim().min(10).max(8000),
});

export const createReplySchema = z.object({
  body: z.string().trim().min(1).max(4000),
});
