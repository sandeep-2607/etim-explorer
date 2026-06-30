import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/db/client/server";
import { logQueryError } from "@/lib/queries/_log";
import { applyTextSearch } from "@/lib/queries/_search";
import { localize, type Translation } from "@/lib/i18n/localize";
import type {
  FeatureDetail,
  FeatureListItem,
  FeatureType,
  FilterOption,
  Paged,
} from "@/lib/types/etim";

/** Feature queries over Supabase REST (etim_core), localized with EN fallback. */

const REVERSE_CAP = 50;
const isCodeLike = (q: string) => /^[A-Za-z]{2}\d/.test(q.trim());

const FEATURE_SELECT =
  "code,type,feature_group_code," +
  "etim_feature_translation(language,description)," +
  "etim_feature_group(etim_feature_group_translation(language,description))";

type FeatureLike = {
  code: string;
  type: FeatureType;
  feature_group_code: string;
  etim_feature_translation?: Translation[];
  etim_feature_group?: {
    etim_feature_group_translation?: Translation[];
  } | null;
};

function normalizeFeature(f: FeatureLike, lang: string): FeatureListItem {
  const { value, isFallback } = localize(f.etim_feature_translation, lang);
  return {
    code: f.code,
    name: value ?? f.code,
    nameIsFallback: isFallback,
    type: f.type,
    featureGroupCode: f.feature_group_code,
    featureGroupName: localize(
      f.etim_feature_group?.etim_feature_group_translation,
      lang,
    ).value,
  };
}

export type FeatureSort = "code" | "type";

export async function getFeatureList(opts: {
  lang: string;
  page: number;
  pageSize: number;
  q?: string;
  type?: FeatureType;
  featureGroup?: string;
  sort?: FeatureSort;
  dir?: "asc" | "desc";
}): Promise<Paged<FeatureListItem>> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:features");

  const { lang, page, pageSize, q, type, featureGroup, sort = "code", dir = "asc" } = opts;
  const ascending = dir === "asc";
  const offset = (page - 1) * pageSize;
  const empty: Paged<FeatureListItem> = { items: [], total: 0, page, pageSize };
  const sb = getSupabase();
  if (!sb) return empty;

  const term = q?.trim();
  const pat = term ? `%${term}%` : null;

  try {
    if (pat && term && !isCodeLike(term)) {
      let query = sb
        .from("etim_feature_translation")
        .select(`feature_id, etim_feature!inner(${FEATURE_SELECT})`, {
          count: "exact",
        })
        .eq("language", lang);
      query = applyTextSearch(query, "description", term);
      if (type) query = query.eq("etim_feature.type", type);
      if (featureGroup)
        query = query.eq("etim_feature.feature_group_code", featureGroup);

      const { data, count } = await query
        .order("feature_id")
        .range(offset, offset + pageSize - 1);

      const items = (data ?? [])
        .map((row) => {
          const f = (row as unknown as { etim_feature: FeatureLike | FeatureLike[] })
            .etim_feature;
          return Array.isArray(f) ? f[0] : f;
        })
        .filter(Boolean)
        .map((f) => normalizeFeature(f as FeatureLike, lang));
      return { items, total: count ?? items.length, page, pageSize };
    }

    let query = sb
      .from("etim_feature")
      .select(FEATURE_SELECT, { count: "exact" })
      .order(sort, { ascending })
      .range(offset, offset + pageSize - 1);
    if (pat) query = query.ilike("code", pat);
    if (type) query = query.eq("type", type);
    if (featureGroup) query = query.eq("feature_group_code", featureGroup);

    const { data, count } = await query;
    const items = (data ?? []).map((f) =>
      normalizeFeature(f as unknown as FeatureLike, lang),
    );
    return { items, total: count ?? items.length, page, pageSize };
  } catch (e) {
    logQueryError("features", e);
    return empty;
  }
}

/** Feature-group options for the list filter (18 rows). */
export async function getFeatureGroups(opts: {
  lang: string;
}): Promise<FilterOption[]> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:feature-groups");

  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from("etim_feature_group")
      .select("code,etim_feature_group_translation(language,description)")
      .order("code");
    return (data ?? []).map((g) => {
      const row = g as unknown as {
        code: string;
        etim_feature_group_translation?: Translation[];
      };
      const name = localize(row.etim_feature_group_translation, opts.lang).value;
      return { code: row.code, label: name ? `${row.code} · ${name}` : row.code };
    });
  } catch (e) {
    logQueryError("features", e);
    return [];
  }
}

export async function getFeatureDetail(opts: {
  lang: string;
  code: string;
}): Promise<FeatureDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`etim:feature:${opts.code}`);

  const { lang, code } = opts;
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: head } = await sb
      .from("etim_feature")
      .select(
        "id,code,type,feature_group_code," +
          "etim_feature_translation(language,description)," +
          "etim_feature_group(etim_feature_group_translation(language,description))",
      )
      .eq("code", code)
      .maybeSingle();
    if (!head) return null;
    const h = head as unknown as {
      id: number;
      code: string;
      type: FeatureType;
      feature_group_code: string;
      etim_feature_translation?: Translation[];
      etim_feature_group?: { etim_feature_group_translation?: Translation[] } | null;
    };

    const { data: clsRows, count } = await sb
      .from("etim_class_feature")
      .select("etim_class!inner(code,etim_class_translation(language,description))", {
        count: "exact",
      })
      .eq("feature_id", h.id)
      .order("class_id")
      .range(0, REVERSE_CAP - 1);

    const classes = (clsRows ?? [])
      .map((row) => {
        const c = (
          row as unknown as {
            etim_class: { code: string; etim_class_translation?: Translation[] };
          }
        ).etim_class;
        if (!c) return null;
        const { value, isFallback } = localize(c.etim_class_translation, lang);
        return { code: c.code, name: value ?? c.code, nameIsFallback: isFallback };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);

    const name = localize(h.etim_feature_translation, lang);
    return {
      code: h.code,
      name: name.value ?? h.code,
      nameIsFallback: name.isFallback,
      type: h.type,
      featureGroupCode: h.feature_group_code,
      featureGroupName: localize(
        h.etim_feature_group?.etim_feature_group_translation,
        lang,
      ).value,
      translations: (h.etim_feature_translation ?? [])
        .filter((t): t is { language: string; description: string } => t.description != null)
        .sort((a, b) => a.language.localeCompare(b.language)),
      classes: { items: classes, total: count ?? classes.length, cap: REVERSE_CAP },
    };
  } catch (e) {
    logQueryError("features", e);
    return null;
  }
}
