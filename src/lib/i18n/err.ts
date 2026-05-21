import { NextResponse } from "next/server";
import {
  getMessage,
  normalizeLocale,
  resolveLocaleFromRequest,
  type AppLocale,
} from "./server-messages";

function errorJson(
  locale: AppLocale,
  key: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  const fullKey = key.startsWith("apiErrors.") ? key : `apiErrors.${key}`;
  return NextResponse.json(
    { error: getMessage(locale, fullKey), code: fullKey, ...extra },
    { status }
  );
}

/** Shorthand API error: pass `Request` or locale (`sq` / `en`). */
export function apiErr(
  requestOrLocale: Request | AppLocale,
  key: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  const locale =
    typeof requestOrLocale === "string"
      ? normalizeLocale(requestOrLocale)
      : resolveLocaleFromRequest(requestOrLocale);
  return errorJson(locale, key, status, extra);
}

/** @deprecated Use apiErr — alias kept for gradual migration */
export const err = apiErr;
