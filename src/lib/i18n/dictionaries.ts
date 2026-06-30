import "server-only";
import { cacheLife } from "next/cache";
import en from "@/dictionaries/en.json";

/**
 * UI dictionaries (server-only — never shipped to the client bundle, per the
 * Next.js i18n guide). English is the complete base; other languages provide
 * partial overrides and inherit any missing key from English. This means the UI
 * localizes wherever a translation is authored and falls back to English
 * otherwise — for ANY available data language, even ones without a full dict.
 */

export type Dictionary = typeof en;

const overrides: Record<string, () => Promise<{ default: DeepPartial<Dictionary> }>> =
  {
    "de-DE": () => import("@/dictionaries/de-DE.json"),
    "nl-NL": () => import("@/dictionaries/nl-NL.json"),
  };

export async function getDictionary(locale: string): Promise<Dictionary> {
  "use cache";
  cacheLife("max");
  if (locale === "EN" || !(locale in overrides)) return en;
  const mod = await overrides[locale]();
  return deepMerge(en, mod.default);
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge<T>(base: T, override: DeepPartial<T>): T {
  const out = { ...base } as T;
  for (const key in override) {
    const o = override[key];
    if (o === undefined) continue;
    const b = (base as Record<string, unknown>)[key];
    if (isPlainObject(b) && isPlainObject(o)) {
      (out as Record<string, unknown>)[key] = deepMerge(b, o as DeepPartial<typeof b>);
    } else {
      (out as Record<string, unknown>)[key] = o as unknown;
    }
  }
  return out;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
