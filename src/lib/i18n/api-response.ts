import { NextResponse } from "next/server";
import { getMessage, resolveLocaleFromRequest, type AppLocale } from "./server-messages";

export function apiErrorResponse(
  request: Request,
  key: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  const locale = resolveLocaleFromRequest(request);
  return NextResponse.json(
    { error: getMessage(locale, key), code: key, ...extra },
    { status }
  );
}

export function apiErrorForLocale(
  locale: AppLocale,
  key: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    { error: getMessage(locale, key), code: key, ...extra },
    { status }
  );
}

export { resolveLocaleFromRequest };
