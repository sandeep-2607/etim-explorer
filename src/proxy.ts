import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { DEFAULT_LOCALE, KNOWN_LOCALES } from "@/lib/i18n/config";

/**
 * Proxy (Next.js 16's renamed middleware; Node.js runtime). Ensures every
 * request carries a locale prefix. Resolution order:
 *   cookie `lang` → Accept-Language → DEFAULT_LOCALE.
 *
 * Note: matcher values must be static constants, so we match against the
 * statically-known locale set (KNOWN_LOCALES). The localized routes themselves
 * accept the full data-driven set.
 */

const LOCALE_COOKIE = "lang";
const LOCALES = [...KNOWN_LOCALES];

function resolveLocale(request: NextRequest): string {
  const cookieLang = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLang && LOCALES.includes(cookieLang as (typeof KNOWN_LOCALES)[number])) {
    return cookieLang;
  }
  const headers = { "accept-language": request.headers.get("accept-language") ?? "" };
  const languages = new Negotiator({ headers }).languages();
  let matched: string;
  try {
    matched = match(languages, LOCALES, DEFAULT_LOCALE);
  } catch {
    matched = DEFAULT_LOCALE;
  }
  // The locale matcher canonicalizes tags (e.g. "EN" → "en", "de-DE" → "de-de"),
  // but our locale set uses the DB casing ("EN", "de-DE"). Map back to it so the
  // redirect target matches a real route (otherwise it would redirect forever).
  return (
    LOCALES.find((l) => l.toLowerCase() === matched.toLowerCase()) ?? DEFAULT_LOCALE
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = resolveLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Run on everything except Next internals, API and common static assets.
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
