import { z } from "zod";
import { PROJECT_ACCESS_LEVELS, PROJECT_STATUSES } from "./types";

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional().nullable(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional().nullable(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export const projectMemberSchema = z.object({
  userId: z.string().min(1),
  access: z.enum(PROJECT_ACCESS_LEVELS).default("read"),
});

export const updateProjectMemberSchema = z.object({
  access: z.enum(PROJECT_ACCESS_LEVELS),
});

export const projectClientSchema = z
  .object({
    companyId: z.string().optional().nullable(),
    userId: z.string().optional().nullable(),
  })
  .refine((d) => Boolean(d.companyId?.trim()) || Boolean(d.userId?.trim()), {
    message: "companyId or userId required",
  });

export const projectMessageSchema = z.object({
  body: z.string().min(1).max(50000),
  isInternal: z.boolean().optional().default(false),
});

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "project";
}
