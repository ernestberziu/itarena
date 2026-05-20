/** Service / ticket division labels — client + server safe (no DB imports). */
export const DIVISION_LABELS: Record<string, { sq: string; en: string }> = {
  it_support: { sq: "Mbështetje IT", en: "IT Support" },
  cloud: { sq: "Cloud & Microsoft 365", en: "Cloud & Microsoft 365" },
  telecom: { sq: "Telekomunikacion", en: "Telecommunications" },
  web: { sq: "Web & Marketing", en: "Web & Marketing" },
  cctv: { sq: "CCTV & Siguri", en: "CCTV & Security" },
  network: { sq: "Rrjet", en: "Networking" },
  software: { sq: "Zhvillim Softuerësh", en: "Software Development" },
  printers: { sq: "Printerë", en: "Printers" },
};

export function divisionLabel(divisionId: string, locale: "sq" | "en"): string {
  return DIVISION_LABELS[divisionId]?.[locale] ?? divisionId;
}
