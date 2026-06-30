import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/db/client/server";
import { logQueryError } from "@/lib/queries/_log";
import { applyTextSearch } from "@/lib/queries/_search";
import { localize, type Translation } from "@/lib/i18n/localize";
import type { EntityRef } from "@/lib/types/etim";
import { getClassList } from "@/lib/queries/classes";
import { getFeatureList } from "@/lib/queries/features";
import { getValueList } from "@/lib/queries/values";
import { getUnitList } from "@/lib/queries/units";
import { getGroupList } from "@/lib/queries/groups";

/** Global search across all entity types + class synonyms. */

const LIMIT = 20;

export type SearchGroupKey =
  | "classes"
  | "features"
  | "values"
  | "units"
  | "groups"
  | "synonyms";

export interface SearchGroup {
  key: SearchGroupKey;
  items: EntityRef[];
  total: number;
  /** True when `total` is just the shown count (no exhaustive count available). */
  approximate?: boolean;
}

const toRef = (x: {
  code: string;
  name: string;
  nameIsFallback: boolean;
}): EntityRef => ({ code: x.code, name: x.name, nameIsFallback: x.nameIsFallback });

/** Classes matched by a synonym (any language), deduped by class code. */
export async function searchClassSynonyms(opts: {
  lang: string;
  q: string;
  limit: number;
}): Promise<{ items: EntityRef[]; total: number }> {
  "use cache";
  // Search is keyed by arbitrary `q`; use a shorter lifetime so per-query cache
  // entries don't accumulate for days.
  cacheLife("hours");
  cacheTag("etim:synonyms");

  const { lang, q, limit } = opts;
  const term = q.trim();
  const sb = getSupabase();
  if (!sb || !term) return { items: [], total: 0 };

  try {
    let q2 = sb
      .from("etim_class_synonym")
      .select("etim_class!inner(code,etim_class_translation(language,description))", {
        count: "exact",
      });
    q2 = applyTextSearch(q2, "synonym", term);
    const { data, count } = await q2.range(0, limit * 4 - 1);

    const seen = new Set<string>();
    const items: EntityRef[] = [];
    for (const row of (data ?? []) as unknown as {
      etim_class?: { code: string; etim_class_translation?: Translation[] } | null;
    }[]) {
      const c = row.etim_class;
      if (!c || seen.has(c.code)) continue;
      seen.add(c.code);
      const { value, isFallback } = localize(c.etim_class_translation, lang);
      items.push({ code: c.code, name: value ?? c.code, nameIsFallback: isFallback });
      if (items.length >= limit) break;
    }
    return { items, total: count ?? items.length };
  } catch (e) {
    logQueryError("search", e);
    return { items: [], total: 0 };
  }
}

/** Run all entity searches in parallel and group the results. */
export async function searchAll(opts: {
  lang: string;
  q: string;
}): Promise<{ q: string; groups: SearchGroup[] }> {
  const { lang } = opts;
  const q = opts.q.trim();
  if (!q) return { q, groups: [] };

  const [classes, features, values, units, groups, synonyms] = await Promise.all([
    getClassList({ lang, q, page: 1, pageSize: LIMIT }),
    getFeatureList({ lang, q, page: 1, pageSize: LIMIT }),
    getValueList({ lang, q, page: 1, pageSize: LIMIT }),
    getUnitList({ lang, q, page: 1, pageSize: LIMIT }),
    getGroupList({ lang, q, page: 1, pageSize: LIMIT }),
    searchClassSynonyms({ lang, q, limit: LIMIT }),
  ]);

  // Drop synonym hits already shown under direct class matches.
  const classCodes = new Set(classes.items.map((c) => c.code));
  const synItems = synonyms.items.filter((s) => !classCodes.has(s.code));

  return {
    q,
    groups: [
      { key: "classes", items: classes.items.map(toRef), total: classes.total },
      { key: "features", items: features.items.map(toRef), total: features.total },
      { key: "values", items: values.items.map(toRef), total: values.total },
      { key: "units", items: units.items.map(toRef), total: units.total },
      { key: "groups", items: groups.items.map(toRef), total: groups.total },
      {
        key: "synonyms",
        items: synItems,
        total: synItems.length,
        // No exhaustive distinct-class count; if we hit the cap, more may exist.
        approximate: synItems.length >= LIMIT,
      },
    ],
  };
}
