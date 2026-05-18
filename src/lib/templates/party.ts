import type { ContractParty } from "./types";

/** Legal / display name: company when set, otherwise full name. */
export function resolvePartyCompanyName(party: ContractParty): string {
  const company = party.companyName?.trim();
  if (company) return company;
  const full = party.fullName?.trim();
  return full || "—";
}

/** Tax identifier: NIPT when set, otherwise personal ID. */
export function resolvePartyTaxId(party: ContractParty): string {
  const nipt = party.nuis?.trim();
  if (nipt) return nipt;
  const id = party.idNumber?.trim();
  return id || "—";
}

/** Label for customer tax/id line in templates. */
export function resolvePartyTaxIdLabel(party: ContractParty): string {
  if (party.nuis?.trim()) return "NIPT";
  if (party.idNumber?.trim()) return "ID";
  return "NIPT";
}
