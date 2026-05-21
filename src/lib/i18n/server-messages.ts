import sqMessages from "../../../messages/sq.json";
import enMessages from "../../../messages/en.json";

export type AppLocale = "sq" | "en";

const bundles: Record<AppLocale, Record<string, unknown>> = {
  sq: sqMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

function resolvePath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function normalizeLocale(input: string | null | undefined): AppLocale {
  if (input === "en" || input?.toLowerCase().startsWith("en")) return "en";
  return "sq";
}

/** Resolve locale from API request (query ?locale=, Accept-Language, or default sq). */
export function resolveLocaleFromRequest(request: Request): AppLocale {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("locale");
    if (q) return normalizeLocale(q);
  } catch {
    /* ignore */
  }
  const accept = request.headers.get("accept-language");
  if (accept?.toLowerCase().includes("en")) return "en";
  return "sq";
}

/** Dot-path message lookup, e.g. `apiErrors.unauthorized` or `emails.verifySubject`. */
export function getMessage(locale: AppLocale, key: string): string {
  const msg = resolvePath(bundles[locale], key);
  if (msg) return msg;
  const fallback = resolvePath(bundles.sq, key);
  if (fallback) return fallback;
  return key;
}

export function getMessagesForLocale(locale: AppLocale): Record<string, unknown> {
  return bundles[locale];
}
