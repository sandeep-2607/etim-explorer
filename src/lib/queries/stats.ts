import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/db/client/server";
import { logQueryError } from "@/lib/queries/_log";
import { KNOWN_LOCALES } from "@/lib/i18n/config";
import type { Stats } from "@/lib/types/etim";

/**
 * Read-only aggregate queries. Cached and degrade gracefully (zero) when
 * Supabase is unconfigured or the `etim_core` schema isn't exposed yet.
 */

/** Languages with content. PostgREST can't DISTINCT without a DB view, so we use
 * the known set (the 8 populated in ETIM 10.0); expands if KNOWN_LOCALES does. */
export async function getAvailableLanguageCodes(): Promise<string[]> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:languages");
  return [...KNOWN_LOCALES];
}

/** Headline counts for the home page / stats cards. */
export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:stats");

  const empty: Stats = {
    classes: 0,
    features: 0,
    values: 0,
    units: 0,
    groups: 0,
    featureGroups: 0,
    synonyms: 0,
    languages: KNOWN_LOCALES.length,
  };
  const sb = getSupabase();
  if (!sb) return empty;

  const tables: [keyof Stats, string][] = [
    ["classes", "etim_class"],
    ["features", "etim_feature"],
    ["values", "etim_value"],
    ["units", "etim_unit"],
    ["groups", "etim_group"],
    ["featureGroups", "etim_feature_group"],
    ["synonyms", "etim_class_synonym"],
  ];

  try {
    const results = await Promise.all(
      tables.map(([, table]) =>
        sb.from(table).select("*", { count: "exact", head: true }),
      ),
    );
    const stats = { ...empty };
    results.forEach((res, i) => {
      stats[tables[i][0]] = res.count ?? 0;
    });
    return stats;
  } catch (e) {
    logQueryError("stats", e);
    return empty;
  }
}
