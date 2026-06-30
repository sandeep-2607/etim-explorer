import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/db/client/server";
import { logQueryError } from "@/lib/queries/_log";
import { applyTextSearch } from "@/lib/queries/_search";
import { localize, type Translation } from "@/lib/i18n/localize";
import type { Paged, ValueDetail, ValueListItem } from "@/lib/types/etim";

/** Value queries over Supabase REST (etim_core), localized with EN fallback. */

const REVERSE_CAP = 50;
const REVERSE_SCAN = 500; // rows scanned to derive distinct features for a value
const isCodeLike = (q: string) => /^[A-Za-z]{2}\d/.test(q.trim());

const VALUE_SELECT = "code,etim_value_translation(language,description)";

type ValueLike = { code: string; etim_value_translation?: Translation[] };

function normalizeValue(v: ValueLike, lang: string): ValueListItem {
  const { value, isFallback } = localize(v.etim_value_translation, lang);
  return { code: v.code, name: value ?? v.code, nameIsFallback: isFallback };
}

export async function getValueList(opts: {
  lang: string;
  page: number;
  pageSize: number;
  q?: string;
  dir?: "asc" | "desc";
}): Promise<Paged<ValueListItem>> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:values");

  const { lang, page, pageSize, q, dir = "asc" } = opts;
  const ascending = dir === "asc";
  const offset = (page - 1) * pageSize;
  const empty: Paged<ValueListItem> = { items: [], total: 0, page, pageSize };
  const sb = getSupabase();
  if (!sb) return empty;

  const term = q?.trim();
  const pat = term ? `%${term}%` : null;

  try {
    if (pat && term && !isCodeLike(term)) {
      let q2 = sb
        .from("etim_value_translation")
        .select(`value_id, etim_value!inner(${VALUE_SELECT})`, { count: "exact" })
        .eq("language", lang);
      q2 = applyTextSearch(q2, "description", term);
      const { data, count } = await q2
        .order("value_id")
        .range(offset, offset + pageSize - 1);

      const items = (data ?? [])
        .map((row) => {
          const v = (row as unknown as { etim_value: ValueLike | ValueLike[] })
            .etim_value;
          return Array.isArray(v) ? v[0] : v;
        })
        .filter(Boolean)
        .map((v) => normalizeValue(v as ValueLike, lang));
      return { items, total: count ?? items.length, page, pageSize };
    }

    let query = sb
      .from("etim_value")
      .select(VALUE_SELECT, { count: "exact" })
      .order("code", { ascending })
      .range(offset, offset + pageSize - 1);
    if (pat) query = query.ilike("code", pat);

    const { data, count } = await query;
    const items = (data ?? []).map((v) =>
      normalizeValue(v as unknown as ValueLike, lang),
    );
    return { items, total: count ?? items.length, page, pageSize };
  } catch (e) {
    logQueryError("values", e);
    return empty;
  }
}

export async function getValueDetail(opts: {
  lang: string;
  code: string;
}): Promise<ValueDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`etim:value:${opts.code}`);

  const { lang, code } = opts;
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: head } = await sb
      .from("etim_value")
      .select("id,code,etim_value_translation(language,description)")
      .eq("code", code)
      .maybeSingle();
    if (!head) return null;
    const h = head as unknown as {
      id: number;
      code: string;
      etim_value_translation?: Translation[];
    };

    // Features that permit this value (dedupe by feature_code over a scan window).
    const { data: cfvRows } = await sb
      .from("etim_class_feature_value")
      .select(
        "etim_class_feature!inner(feature_code,etim_feature(etim_feature_translation(language,description)))",
      )
      .eq("value_id", h.id)
      .range(0, REVERSE_SCAN - 1);
    // If the scan window is full there may be more distinct features than we saw.
    const scanSaturated = (cfvRows?.length ?? 0) >= REVERSE_SCAN;

    const byFeature = new Map<string, { name: string; isFallback: boolean }>();
    for (const row of (cfvRows ?? []) as unknown as {
      etim_class_feature?: {
        feature_code: string;
        etim_feature?: { etim_feature_translation?: Translation[] } | null;
      } | null;
    }[]) {
      const cf = row.etim_class_feature;
      if (!cf || byFeature.has(cf.feature_code)) continue;
      const { value, isFallback } = localize(
        cf.etim_feature?.etim_feature_translation,
        lang,
      );
      byFeature.set(cf.feature_code, {
        name: value ?? cf.feature_code,
        isFallback,
      });
    }
    const featureItems = [...byFeature.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, v]) => ({ code, name: v.name, nameIsFallback: v.isFallback }));

    const name = localize(h.etim_value_translation, lang);
    return {
      code: h.code,
      name: name.value ?? h.code,
      nameIsFallback: name.isFallback,
      translations: (h.etim_value_translation ?? [])
        .filter((t): t is { language: string; description: string } => t.description != null)
        .sort((a, b) => a.language.localeCompare(b.language)),
      features: {
        items: featureItems.slice(0, REVERSE_CAP),
        total: featureItems.length,
        cap: REVERSE_CAP,
        approximate: scanSaturated,
      },
    };
  } catch (e) {
    logQueryError("values", e);
    return null;
  }
}
