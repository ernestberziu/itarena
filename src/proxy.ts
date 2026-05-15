import createMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PORTAL_PATHS = ["/portal"];
const ADMIN_PATHS = ["/admin"];
const AUTH_PATHS = ["/hyr", "/regjistrohu"];

const ADMIN_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"];

/** Albanian (default) has no URL prefix; English uses `/en`. */
function localeUrlPrefix(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "/en";
  return "";
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Subdomain routing: shop.* → rewrite to /shop/*
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("shop.")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/shop" : `/shop${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Shop paths: bypass locale (intl) middleware entirely
  if (pathname.startsWith("/shop")) {
    return NextResponse.next();
  }

  // Strip locale prefix for path matching
  const pathnameWithoutLocale = pathname.replace(/^\/(sq|en)/, "") || "/";

  const isPortalPath = PORTAL_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  );
  const isAdminPath = ADMIN_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  );
  const isAuthPath = AUTH_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  );

  if (isPortalPath || isAdminPath) {
    const session = await auth();

    if (!session) {
      const lp = localeUrlPrefix(pathname);
      const loginUrl = new URL(`${lp}/hyr`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminPath && !ADMIN_ROLES.includes(session.user.role)) {
      const lp = localeUrlPrefix(pathname);
      return NextResponse.redirect(new URL(`${lp}/portal/dashboard`, req.url));
    }

    return intlMiddleware(req);
  }

  if (isAuthPath) {
    const session = await auth();
    if (session) {
      const role = session.user.role;
      const lp = localeUrlPrefix(pathname);
      const dest = ADMIN_ROLES.includes(role)
        ? `${lp}/admin/dashboard`
        : `${lp}/portal/dashboard`;
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
