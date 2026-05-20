import { z } from "zod";

export const registrationCompanySnapshotSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    vatNumber: z.string().max(80).optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(120).optional(),
    country: z.string().max(120).optional(),
  })
  .strict();

export type RegistrationCompanySnapshot = z.infer<typeof registrationCompanySnapshotSchema>;

export function hasRegistrationCompanySnapshot(
  snapshot: unknown
): snapshot is RegistrationCompanySnapshot {
  const parsed = registrationCompanySnapshotSchema.safeParse(snapshot);
  if (!parsed.success) return false;
  const s = parsed.data;
  return Boolean(s.name?.trim() || s.vatNumber?.trim() || s.address?.trim() || s.city?.trim());
}

export function parseRegistrationCompanySnapshot(input: unknown): RegistrationCompanySnapshot | null {
  const parsed = registrationCompanySnapshotSchema.safeParse(input);
  if (!parsed.success) return null;
  if (!hasRegistrationCompanySnapshot(parsed.data)) return null;
  return {
    name: parsed.data.name?.trim() || undefined,
    vatNumber: parsed.data.vatNumber?.trim() || undefined,
    address: parsed.data.address?.trim() || undefined,
    city: parsed.data.city?.trim() || undefined,
    country: parsed.data.country?.trim() || undefined,
  };
}
