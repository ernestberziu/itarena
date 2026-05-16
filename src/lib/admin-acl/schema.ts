import { z } from "zod";
import { ADMIN_FEATURES, type AclLevel, type AdminFeature } from "./features";

const levelSchema = z.enum(["none", "read", "write"]);

export const adminAclOverlaySchema = z
  .record(z.string(), levelSchema)
  .refine((obj) => Object.keys(obj).every((k) => ADMIN_FEATURES.includes(k as AdminFeature)), {
    message: "Unknown admin feature key in adminAclJson",
  });

export type AdminAclOverlay = Partial<Record<AdminFeature, AclLevel>>;

export function parseAdminAclOverlay(raw: unknown): AdminAclOverlay | null {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) return null;
  const parsed = adminAclOverlaySchema.safeParse(raw);
  if (!parsed.success) return null;
  return parsed.data as AdminAclOverlay;
}
