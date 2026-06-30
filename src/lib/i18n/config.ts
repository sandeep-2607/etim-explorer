/**
 * Dependency-light i18n config — safe to import from `proxy.ts`, Client
 * Components, and server code alike (no DB, no `server-only`).
 *
 * Language strategy: the `etim_language_code` enum defines 19 languages, but
 * ETIM 10.0 only populates 8. `KNOWN_LOCALES` is the static fallback used for
 * `proxy` matching and at build time; the live language list is derived from the
 * data (see lib/i18n/locales.ts) and can expand to any of the 19 automatically.
 */

export const DEFAULT_LOCALE = "EN";

/** Languages known to carry data in ETIM 10.0 (static fallback + proxy matcher). */
export const KNOWN_LOCALES = [
  "EN",
  "de-DE",
  "fi-FI",
  "fr-BE",
  "it-IT",
  "nb-NO",
  "nl-BE",
  "nl-NL",
] as const;

/** Endonyms for every code the `etim_language_code` enum allows (all 19). */
export const ENDONYMS: Record<string, string> = {
  EN: "English",
  "nl-NL": "Nederlands (NL)",
  "nl-BE": "Nederlands (BE)",
  "de-DE": "Deutsch",
  "fr-BE": "Français (BE)",
  "fi-FI": "Suomi",
  "it-IT": "Italiano",
  "nb-NO": "Norsk bokmål",
  "es-ES": "Español",
  "pt-PT": "Português",
  "pl-PL": "Polski",
  "sv-SE": "Svenska",
  "da-DK": "Dansk",
  "cs-CZ": "Čeština",
  "hu-HU": "Magyar",
  "ro-RO": "Română",
  "bg-BG": "Български",
  "tr-TR": "Türkçe",
  "zh-CN": "中文",
};

export function endonym(code: string): string {
  return ENDONYMS[code] ?? code;
}

export interface LocaleOption {
  code: string;
  endonym: string;
}
