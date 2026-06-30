import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/db/client/server";
import { logQueryError } from "@/lib/queries/_log";
import { applyTextSearch } from "@/lib/queries/_search";
import { localize, type Translation } from "@/lib/i18n/localize";
import type {
  ChangeCode,
  ClassDetail,
  ClassFeatureRow,
  ClassListItem,
  FeatureType,
  Paged,
} from "@/lib/types/etim";

/**
 * Class queries over the Supabase REST API (etim_core), localized with EN
 * fallback. Read-only, cached, and degrade gracefully when unconfigured.
 */

const isCodeLike = (q: string) => /^[A-Za-z]{2}\d/.test(q.trim());

type ClassLike = {
  code: string;
  version: number;
  change_code: ClassListItem["changeCode"];
  group_code: string;
  status: ClassListItem["status"];
  etim_class_translation?: Translation[];
  etim_class_feature?: { count: number }[];
};

function normalizeClass(c: ClassLike, lang: string): ClassListItem {
  const { value, isFallback } = localize(c.etim_class_translation, lang);
  return {
    code: c.code,
    name: value ?? c.code,
    nameIsFallback: isFallback,
    changeCode: c.change_code,
    version: c.version,
    groupCode: c.group_code,
    status: c.status,
    featureCount: c.etim_class_feature?.[0]?.count ?? 0,
  };
}

const CLASS_SELECT =
  "code,version,change_code,group_code,status," +
  "etim_class_translation(language,description),etim_class_feature(count)";

export type ClassSort = "code" | "version";

/** A page of classes, localized with English fallback, optional search + sort. */
export async function getClassList(opts: {
  lang: string;
  page: number;
  pageSize: number;
  q?: string;
  group?: string;
  changeCode?: ChangeCode;
  sort?: ClassSort;
  dir?: "asc" | "desc";
}): Promise<Paged<ClassListItem>> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:classes");

  const { lang, page, pageSize, q, group, changeCode, sort = "code", dir = "asc" } =
    opts;
  const ascending = dir === "asc";
  const offset = (page - 1) * pageSize;
  const empty: Paged<ClassListItem> = { items: [], total: 0, page, pageSize };
  const sb = getSupabase();
  if (!sb) return empty;

  const term = q?.trim();
  const pat = term ? `%${term}%` : null;

  try {
    // Name search (non-code terms): match translations in the active language
    // via an inner join on the class. Code-like terms and empty search use the
    // class table directly.
    if (pat && term && !isCodeLike(term)) {
      let q2 = sb
        .from("etim_class_translation")
        .select(`class_id, etim_class!inner(${CLASS_SELECT})`, { count: "exact" })
        .eq("language", lang);
      q2 = applyTextSearch(q2, "description", term);
      if (group) q2 = q2.eq("etim_class.group_code", group);
      if (changeCode) q2 = q2.eq("etim_class.change_code", changeCode);
      const { data, count } = await q2
        .order("class_id")
        .range(offset, offset + pageSize - 1);

      const items = (data ?? [])
        .map((row) => {
          const c = (row as unknown as { etim_class: ClassLike | ClassLike[] })
            .etim_class;
          return Array.isArray(c) ? c[0] : c;
        })
        .filter(Boolean)
        .map((c) => normalizeClass(c as ClassLike, lang));
      return { items, total: count ?? items.length, page, pageSize };
    }

    let query = sb
      .from("etim_class")
      .select(CLASS_SELECT, { count: "exact" })
      .order(sort, { ascending })
      .range(offset, offset + pageSize - 1);
    if (pat) query = query.ilike("code", pat);
    if (group) query = query.eq("group_code", group);
    if (changeCode) query = query.eq("change_code", changeCode);

    const { data, count } = await query;
    const items = (data ?? []).map((c) =>
      normalizeClass(c as unknown as ClassLike, lang),
    );
    return { items, total: count ?? items.length, page, pageSize };
  } catch (e) {
    logQueryError("classes", e);
    return empty;
  }
}

/** Full relational detail for one class, localized with EN fallback. */
export async function getClassDetail(opts: {
  lang: string;
  code: string;
}): Promise<ClassDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`etim:class:${opts.code}`);

  const { lang, code } = opts;
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: head } = await sb
      .from("etim_class")
      .select(
        "id,code,version,status,change_code,group_code,mutation_date," +
          "etim_class_translation(language,description)," +
          "etim_group(code,etim_group_translation(language,description))",
      )
      .eq("code", code)
      .maybeSingle();

    if (!head) return null;
    const h = head as unknown as {
      id: number;
      code: string;
      version: number;
      status: ClassDetail["status"];
      change_code: ClassDetail["changeCode"];
      group_code: string;
      mutation_date: string | null;
      etim_class_translation?: Translation[];
      etim_group?: { code: string; etim_group_translation?: Translation[] } | null;
    };

    const [synRes, featRes] = await Promise.all([
      sb
        .from("etim_class_synonym")
        .select("synonym")
        .eq("class_id", h.id)
        .eq("language", lang)
        .order("sort_order", { nullsFirst: false }),
      sb
        .from("etim_class_feature")
        .select(
          "id,order_number,feature_code,change_code,unit_id," +
            "etim_feature(type,etim_feature_translation(language,description))",
        )
        .eq("class_id", h.id)
        .order("order_number"),
    ]);

    type FeatRow = {
      id: number;
      order_number: number;
      feature_code: string;
      change_code: ClassFeatureRow["changeCode"];
      unit_id: number | null;
      etim_feature?: {
        type: FeatureType;
        etim_feature_translation?: Translation[];
      } | null;
    };
    const featureRows = (featRes.data ?? []) as unknown as FeatRow[];

    // Unit abbreviations (active language → EN) for the units used here.
    const unitIds = [
      ...new Set(
        featureRows.map((f) => f.unit_id).filter((x): x is number => x != null),
      ),
    ];
    const unitAbbr = new Map<number, string>();
    if (unitIds.length > 0) {
      const { data: unitTr } = await sb
        .from("etim_unit_translation")
        .select("unit_id,language,abbreviation")
        .in("unit_id", unitIds);
      const byUnit = new Map<
        number,
        { language: string; abbreviation: string | null }[]
      >();
      for (const r of (unitTr ?? []) as unknown as {
        unit_id: number;
        language: string;
        abbreviation: string | null;
      }[]) {
        const list = byUnit.get(r.unit_id) ?? [];
        list.push({ language: r.language, abbreviation: r.abbreviation });
        byUnit.set(r.unit_id, list);
      }
      for (const [uid, rows] of byUnit) {
        const pick =
          rows.find((r) => r.language === lang)?.abbreviation ??
          rows.find((r) => r.language === "EN")?.abbreviation ??
          null;
        if (pick) unitAbbr.set(uid, pick);
      }
    }

    // Permitted values per class-feature.
    const cfIds = featureRows.map((f) => f.id);
    const valuesByCf = new Map<number, string[]>();
    if (cfIds.length > 0) {
      const { data: valRows } = await sb
        .from("etim_class_feature_value")
        .select(
          "class_feature_id,order_number," +
            "etim_value(etim_value_translation(language,description))",
        )
        .in("class_feature_id", cfIds)
        .order("class_feature_id")
        .order("order_number");
      for (const r of (valRows ?? []) as unknown as {
        class_feature_id: number;
        etim_value?: { etim_value_translation?: Translation[] } | null;
      }[]) {
        const name = localize(r.etim_value?.etim_value_translation, lang).value;
        if (!name) continue;
        const list = valuesByCf.get(r.class_feature_id) ?? [];
        list.push(name);
        valuesByCf.set(r.class_feature_id, list);
      }
    }

    const className = localize(h.etim_class_translation, lang);
    const groupName = localize(h.etim_group?.etim_group_translation, lang).value;

    const features: ClassFeatureRow[] = featureRows.map((f) => ({
      orderNumber: f.order_number,
      featureCode: f.feature_code,
      featureName:
        localize(f.etim_feature?.etim_feature_translation, lang).value ??
        f.feature_code,
      featureType: f.etim_feature?.type ?? "Alphanumeric",
      unitAbbr: f.unit_id != null ? unitAbbr.get(f.unit_id) ?? null : null,
      changeCode: f.change_code,
      values: valuesByCf.get(f.id) ?? [],
    }));

    return {
      code: h.code,
      name: className.value ?? h.code,
      nameIsFallback: className.isFallback,
      version: h.version,
      status: h.status,
      changeCode: h.change_code,
      groupCode: h.group_code,
      groupName,
      mutationDate: h.mutation_date ? h.mutation_date.slice(0, 10) : null,
      translations: (h.etim_class_translation ?? [])
        .filter(
          (t): t is { language: string; description: string } =>
            t.description != null,
        )
        .sort((a, b) => a.language.localeCompare(b.language)),
      synonyms: ((synRes.data ?? []) as unknown as { synonym: string }[]).map(
        (s) => s.synonym,
      ),
      features,
    };
  } catch (e) {
    logQueryError("classes", e);
    return null;
  }
}
