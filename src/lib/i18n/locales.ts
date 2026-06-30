import "server-only";
import { cacheLife } from "next/cache";
import { getAvailableLanguageCodes } from "@/lib/queries/stats";
import {
  DEFAULT_LOCALE,
  KNOWN_LOCALES,
  endonym,
  type LocaleOption,
} from "@/lib/i18n/config";

/**
 * The live, data-driven list of locales: distinct languages that actually have
 * content in the database. Falls back to KNOWN_LOCALES when the DB is
 * unreachable (e.g. during `next build` without DATABASE_URL) so the app and its
 * static params always resolve.
 *
 * Cached so it can be read in the layout's static shell (Cache Components).
 */
export async function getAvailableLocales(): Promise<LocaleOption[]> {
  "use cache";
  cacheLife("days");

  const codes = await getAvailableLanguageCodes();
  const list = codes.length > 0 ? codes : [...KNOWN_LOCALES];
  const sorted = list.sort((a, b) => {
    if (a === DEFAULT_LOCALE) return -1;
    if (b === DEFAULT_LOCALE) return 1;
    return endonym(a).localeCompare(endonym(b));
  });
  return sorted.map((code) => ({ code, endonym: endonym(code) }));
}

/** Whether `lang` is a currently-available locale (used to 404 unknown codes). */
export async function isAvailableLocale(lang: string): Promise<boolean> {
  "use cache";
  cacheLife("days");

  const locales = await getAvailableLocales();
  return locales.some((l) => l.code === lang);
}
