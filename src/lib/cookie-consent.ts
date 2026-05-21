export const COOKIE_CONSENT_STORAGE_KEY = "itarena-cookie-consent-v1";
export const COOKIE_SETTINGS_EVENT = "itarena:open-cookie-settings";

export type CookieConsentChoice = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

export function parseConsent(raw: string | null): CookieConsentChoice | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as CookieConsentChoice;
    if (data.necessary !== true || typeof data.analytics !== "boolean") return null;
    return data;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): CookieConsentChoice {
  const choice: CookieConsentChoice = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(choice));
    window.dispatchEvent(new CustomEvent("itarena:cookie-consent-changed", { detail: choice }));
  }
  return choice;
}

export function readConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;
  return parseConsent(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}
