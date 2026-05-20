import type { Role } from "@/types/domain";

const ROLE_LABELS: Record<string, { sq: string; en: string }> = {
  ADMIN: { sq: "Administrator", en: "Administrator" },
  ENGINEER: { sq: "Inxhinier", en: "Engineer" },
  SALES: { sq: "Shitje", en: "Sales" },
  OPS: { sq: "Operacione", en: "Operations" },
  PARTNER: { sq: "Partner", en: "Partner" },
  CLIENT: { sq: "Klient", en: "Client" },
  COMPANY_ADMIN: { sq: "Admin kompanie", en: "Company admin" },
};

export function staffRoleLabel(role: string, locale: "sq" | "en"): string {
  return ROLE_LABELS[role]?.[locale] ?? role;
}

export function staffRoleLabelFromRole(role: Role, locale: "sq" | "en"): string {
  return staffRoleLabel(role, locale);
}
