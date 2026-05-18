import { getDefaultClauseBody } from "./clauses";
import type {
  DocumentType,
  EmploymentLocalizedContent,
  EmploymentPayload,
  ServiceContractPayload,
  ServiceLocalizedContent,
  TemplateLanguage,
} from "./types";
import { normalizeServicePayload } from "./recurring";

export type { ServiceLocalizedContent, EmploymentLocalizedContent };

export function defaultServiceLocalized(lang: TemplateLanguage): ServiceLocalizedContent {
  return {
    bodyMarkdown: getDefaultClauseBody("SERVICE_CONTRACT", lang),
    paymentTerms: lang === "en" ? "Net 30 days from invoice date" : "30 ditë nga data e faturës",
    deliveryTerms: lang === "en" ? "As agreed in writing" : "Sipas marrëveshjes me shkrim",
    notes: "",
    noticePeriod: lang === "en" ? "30 days from written notice" : "30 ditë nga njoftimi me shkrim",
  };
}

const DEFAULT_EMPLOYER_DUTIES_SQ = `Punëdhënësi detyrohet të:
1. Paguajë pagën e dakorduar në kohë.
2. Siguroje punonjësin me mjedisin, pajisjet dhe kushtet e nevojshme për kryerjen e detyrave.
3. Respektojë të drejtat e punonjësit sipas Kodit të Punës.
4. Ofrojë trajnime dhe zhvillim profesional kur kërkohet nga natyra e punës.
5. Njoftojë punonjësin me shkrim për çdo ndryshim të kushteve të punës.
6. Mbajë konfidenciale të dhënat personale të punonjësit.`;

const DEFAULT_EMPLOYER_DUTIES_EN = `The Employer shall:
1. Pay the agreed salary on time.
2. Provide the Employee with the environment, equipment and conditions necessary to perform their duties.
3. Respect the Employee's rights under the Labour Code.
4. Provide training and professional development where required by the nature of the work.
5. Notify the Employee in writing of any changes to working conditions.
6. Keep the Employee's personal data confidential.`;

const DEFAULT_EMPLOYEE_DUTIES_SQ = `Punonjësi detyrohet të:
1. Kryejë detyrat e pozicionit me profesionalizëm dhe cilësi të lartë.
2. Respektojë orarin e punës dhe politikat e brendshme të kompanisë.
3. Raportojë rregullisht progresin dhe komunikojë problemet me kohë tek mbikëqyrësi.
4. Bashkëpunojë me kolegët dhe palët e jashtme sipas nevojës.
5. Ruajë konfidencialitetin e informacioneve të kompanisë gjatë dhe pas marrëdhënies së punës.
6. Zhvillojë vazhdimisht aftësitë profesionale sipas nevojave të pozicionit.
7. Kryejë çdo detyrë tjetër të arsyeshme të caktuar nga mbikëqyrësi i drejtpërdrejtë.

Detyrat mund të modifikohen me njoftim të arsyeshëm, në përputhje me kualifikimet dhe pozicionin e punonjësit.`;

const DEFAULT_EMPLOYEE_DUTIES_EN = `The Employee shall:
1. Perform all duties of the position with professionalism and high quality.
2. Observe working hours and the Company's internal policies.
3. Report progress regularly and communicate issues to the supervisor in a timely manner.
4. Collaborate with colleagues and external parties as required.
5. Maintain the confidentiality of Company information during and after employment.
6. Continuously develop professional skills as required by the position.
7. Carry out any other reasonable duty assigned by the direct supervisor.

Duties may be modified upon reasonable notice, consistent with the Employee's qualifications and position.`;

const DEFAULT_ANNUAL_LEAVE_SQ = `**Pushim vjetor:** Punonjësi ka të drejtë të paktën **20 ditë pune** pushim vjetor me pagesë, sipas Kodit të Punës. Pushimi planifikohet me aprovimin e menaxhmentit dhe njoftim paraprak jo më pak se 2 javë.

**Leje mjekësore:** Punëdhënësi paguan kompensim ligjor gjatë sëmundjes, sipas legjislacionit shqiptar. Punonjësi detyrohet të njoftojë menjëherë mbikëqyrësin dhe të paraqesë certifikatë mjekësore.

**Leje të tjera:** Leja e lindjes dhe atësisë, leja e zisë dhe leja e martesës sipas Kodit të Punës dhe legjislacionit shqiptar.`;

const DEFAULT_ANNUAL_LEAVE_EN = `**Annual leave:** The Employee is entitled to at least **20 working days** of paid annual leave in accordance with the Labour Code. Leave is planned with management approval and at least 2 weeks' prior notice.

**Sick leave:** The Employer provides statutory compensation during illness in accordance with Albanian legislation. The Employee must notify the supervisor immediately and provide a medical certificate.

**Other leave:** Maternity and paternity leave, compassionate leave and marriage leave in accordance with the Labour Code and Albanian legislation.`;

export function defaultEmploymentLocalized(lang: TemplateLanguage): EmploymentLocalizedContent {
  return {
    bodyMarkdown: getDefaultClauseBody("EMPLOYMENT", lang),
    workingHours: lang === "en" ? "40 hours / week" : "40 orë / javë",
    contractType: lang === "en" ? "Indefinite" : "E pacaktuar",
    noticePeriod: lang === "en" ? "30 days from written notice" : "30 ditë nga njoftimi me shkrim",
    employerDuties: lang === "en" ? DEFAULT_EMPLOYER_DUTIES_EN : DEFAULT_EMPLOYER_DUTIES_SQ,
    employeeDuties: lang === "en" ? DEFAULT_EMPLOYEE_DUTIES_EN : DEFAULT_EMPLOYEE_DUTIES_SQ,
    annualLeave: lang === "en" ? DEFAULT_ANNUAL_LEAVE_EN : DEFAULT_ANNUAL_LEAVE_SQ,
  };
}

function hasBilingualLocalized(
  localized: ServiceContractPayload["localized"] | EmploymentPayload["localized"] | undefined
): boolean {
  if (!localized?.sq?.bodyMarkdown?.trim() || !localized?.en?.bodyMarkdown?.trim()) return false;
  // Force re-migration if employment localized is missing new required fields
  const empLocalized = localized as EmploymentPayload["localized"] | undefined;
  if (empLocalized?.sq) {
    const sq = empLocalized.sq as Record<string, unknown>;
    if (!("employerDuties" in sq) || !("employeeDuties" in sq) || !("annualLeave" in sq)) return false;
  }
  return true;
}

/** When EN was copied from SQ, restore proper English defaults for the EN tab. */
function repairServiceEnglishMirror(payload: ServiceContractPayload): ServiceContractPayload {
  const localized = payload.localized;
  if (!localized?.sq || !localized?.en) return payload;
  if (localized.en.bodyMarkdown.trim() !== localized.sq.bodyMarkdown.trim()) return payload;

  const defEn = defaultServiceLocalized("en");
  return {
    ...payload,
    localized: {
      ...localized,
      en: {
        ...defEn,
        notes: localized.en.notes ?? "",
      },
    },
  };
}

export function migrateServicePayload(
  raw: Record<string, unknown>,
  documentLanguage: TemplateLanguage = "sq"
): ServiceContractPayload {
  const p = raw as ServiceContractPayload;
  if (hasBilingualLocalized(p.localized)) {
    return normalizeServicePayload(repairServiceEnglishMirror(p));
  }

  const legacyBody = typeof raw.bodyMarkdown === "string" ? raw.bodyMarkdown : "";
  const legacyPayment = typeof raw.paymentTerms === "string" ? raw.paymentTerms : "";
  const legacyDelivery = typeof raw.deliveryTerms === "string" ? raw.deliveryTerms : "";
  const legacyNotes = typeof raw.notes === "string" ? raw.notes : "";

  const sq: ServiceLocalizedContent =
    documentLanguage === "sq"
      ? {
          bodyMarkdown: legacyBody || defaultServiceLocalized("sq").bodyMarkdown,
          paymentTerms: legacyPayment || defaultServiceLocalized("sq").paymentTerms,
          deliveryTerms: legacyDelivery || defaultServiceLocalized("sq").deliveryTerms,
          notes: legacyNotes,
          noticePeriod: defaultServiceLocalized("sq").noticePeriod,
        }
      : defaultServiceLocalized("sq");

  const en: ServiceLocalizedContent =
    documentLanguage === "en"
      ? {
          bodyMarkdown: legacyBody || defaultServiceLocalized("en").bodyMarkdown,
          paymentTerms: legacyPayment || defaultServiceLocalized("en").paymentTerms,
          deliveryTerms: legacyDelivery || defaultServiceLocalized("en").deliveryTerms,
          notes: legacyNotes,
          noticePeriod: defaultServiceLocalized("en").noticePeriod,
        }
      : defaultServiceLocalized("en");

  const { bodyMarkdown: _b, paymentTerms: _p, deliveryTerms: _d, notes: _n, localized: _l, ...rest } =
    p as ServiceContractPayload & { bodyMarkdown?: string };

  return normalizeServicePayload({
    ...(rest as Omit<ServiceContractPayload, "localized">),
    localized: { sq, en },
  });
}

function repairEmploymentEnglishMirror(payload: EmploymentPayload): EmploymentPayload {
  const localized = payload.localized;
  if (!localized?.sq || !localized?.en) return payload;
  if (localized.en.bodyMarkdown.trim() !== localized.sq.bodyMarkdown.trim()) return payload;

  const defEn = defaultEmploymentLocalized("en");
  return {
    ...payload,
    localized: {
      ...localized,
      en: {
        ...defEn,
        noticePeriod: localized.en.noticePeriod ?? defEn.noticePeriod,
      },
    },
  };
}

export function migrateEmploymentPayload(
  raw: Record<string, unknown>,
  documentLanguage: TemplateLanguage = "sq"
): EmploymentPayload {
  const p = raw as EmploymentPayload;
  if (hasBilingualLocalized(p.localized)) {
    return repairEmploymentEnglishMirror(p);
  }

  const legacyBody = typeof raw.bodyMarkdown === "string" ? raw.bodyMarkdown : "";
  const legacyHours = typeof raw.workingHours === "string" ? raw.workingHours : "";
  const legacyType = typeof raw.contractType === "string" ? raw.contractType : "";

  const defSq = defaultEmploymentLocalized("sq");
  const defEn = defaultEmploymentLocalized("en");

  const sq: EmploymentLocalizedContent =
    documentLanguage === "sq"
      ? {
          bodyMarkdown: legacyBody || defSq.bodyMarkdown,
          workingHours: legacyHours || defSq.workingHours,
          contractType: legacyType || defSq.contractType,
          noticePeriod: defSq.noticePeriod,
          employerDuties: defSq.employerDuties,
          employeeDuties: defSq.employeeDuties,
          annualLeave: defSq.annualLeave,
        }
      : defSq;

  const en: EmploymentLocalizedContent =
    documentLanguage === "en"
      ? {
          bodyMarkdown: legacyBody || defEn.bodyMarkdown,
          workingHours: legacyHours || defEn.workingHours,
          contractType: legacyType || defEn.contractType,
          noticePeriod: defEn.noticePeriod,
          employerDuties: defEn.employerDuties,
          employeeDuties: defEn.employeeDuties,
          annualLeave: defEn.annualLeave,
        }
      : defEn;

  const { bodyMarkdown: _b, workingHours: _h, contractType: _c, localized: _l, ...rest } =
    p as EmploymentPayload & { bodyMarkdown?: string };

  return {
    ...(rest as Omit<EmploymentPayload, "localized">),
    localized: { sq, en },
  };
}

export function getServiceLocalized(
  payload: ServiceContractPayload,
  lang: TemplateLanguage
): ServiceLocalizedContent {
  return payload.localized?.[lang] ?? defaultServiceLocalized(lang);
}

export function getEmploymentLocalized(
  payload: EmploymentPayload,
  lang: TemplateLanguage
): EmploymentLocalizedContent {
  return payload.localized?.[lang] ?? defaultEmploymentLocalized(lang);
}

export function patchServiceLocalized(
  payload: ServiceContractPayload,
  lang: TemplateLanguage,
  patch: Partial<ServiceLocalizedContent>
): ServiceContractPayload {
  const localized = payload.localized ?? {
    sq: defaultServiceLocalized("sq"),
    en: defaultServiceLocalized("en"),
  };
  return {
    ...payload,
    localized: {
      ...localized,
      [lang]: { ...localized[lang], ...patch },
    },
  };
}

export function patchEmploymentLocalized(
  payload: EmploymentPayload,
  lang: TemplateLanguage,
  patch: Partial<EmploymentLocalizedContent>
): EmploymentPayload {
  const localized = payload.localized ?? {
    sq: defaultEmploymentLocalized("sq"),
    en: defaultEmploymentLocalized("en"),
  };
  return {
    ...payload,
    localized: {
      ...localized,
      [lang]: { ...localized[lang], ...patch },
    },
  };
}

/** Flatten localized strings onto payload for compose/variables. */
export function resolveServiceForLanguage(
  payload: ServiceContractPayload,
  lang: TemplateLanguage
): ServiceContractPayload {
  const c = getServiceLocalized(payload, lang);
  return {
    ...payload,
    bodyMarkdown: c.bodyMarkdown,
    paymentTerms: c.paymentTerms,
    deliveryTerms: c.deliveryTerms,
    notes: c.notes,
  };
}

export function resolveEmploymentForLanguage(
  payload: EmploymentPayload,
  lang: TemplateLanguage
): EmploymentPayload & { noticePeriod?: string; employerDuties: string; employeeDuties: string; annualLeave: string } {
  const c = getEmploymentLocalized(payload, lang);
  return {
    ...payload,
    bodyMarkdown: c.bodyMarkdown,
    workingHours: c.workingHours,
    contractType: c.contractType,
    noticePeriod: c.noticePeriod,
    employerDuties: c.employerDuties,
    employeeDuties: c.employeeDuties,
    annualLeave: c.annualLeave,
  };
}

export function defaultClauseForLibrary(type: DocumentType, lang: TemplateLanguage): string {
  return getDefaultClauseBody(type, lang);
}
