import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/db/client/server";
import { logQueryError } from "@/lib/queries/_log";
import { applyTextSearch } from "@/lib/queries/_search";
import { localize, type Translation } from "@/lib/i18n/localize";
import type { Paged, UnitDetail, UnitListItem } from "@/lib/types/etim";

/** Unit queries over Supabase REST (etim_core), localized with EN fallback. */

const REVERSE_CAP = 50;
const REVERSE_SCAN = 500;
const isCodeLike = (q: string) => /^[A-Za-z]{2}\d/.test(q.trim());

type UnitTr = { language: string; description: string | null; abbreviation: string | null };
const UNIT_SELECT = "code,etim_unit_translation(language,description,abbreviation)";

function pickAbbr(rows: UnitTr[] | undefined, lang: string): string | null {
  if (!rows) return null;
  const m = new Map(rows.map((r) => [r.language, r.abbreviation]));
  return m.get(lang) ?? m.get("EN") ?? null;
}

type UnitLike = { code: string; etim_unit_translation?: UnitTr[] };

function normalizeUnit(u: UnitLike, lang: string): UnitListItem {
  const { value, isFallback } = localize(u.etim_unit_translation as Translation[], lang);
  return {
    code: u.code,
    name: value ?? u.code,
    nameIsFallback: isFallback,
    abbreviation: pickAbbr(u.etim_unit_translation, lang),
  };
}

export async function getUnitList(opts: {
  lang: string;
  page: number;
  pageSize: number;
  q?: string;
  dir?: "asc" | "desc";
}): Promise<Paged<UnitListItem>> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:units");

  const { lang, page, pageSize, q, dir = "asc" } = opts;
  const ascending = dir === "asc";
  const offset = (page - 1) * pageSize;
  const empty: Paged<UnitListItem> = { items: [], total: 0, page, pageSize };
  const sb = getSupabase();
  if (!sb) return empty;

  const term = q?.trim();
  const pat = term ? `%${term}%` : null;

  try {
    if (pat && term && !isCodeLike(term)) {
      let q2 = sb
        .from("etim_unit_translation")
        .select(`unit_id, etim_unit!inner(${UNIT_SELECT})`, { count: "exact" })
        .eq("language", lang);
      q2 = applyTextSearch(q2, "description", term);
      const { data, count } = await q2
        .order("unit_id")
        .range(offset, offset + pageSize - 1);

      const items = (data ?? [])
        .map((row) => {
          const u = (row as unknown as { etim_unit: UnitLike | UnitLike[] }).etim_unit;
          return Array.isArray(u) ? u[0] : u;
        })
        .filter(Boolean)
        .map((u) => normalizeUnit(u as UnitLike, lang));
      return { items, total: count ?? items.length, page, pageSize };
    }

    let query = sb
      .from("etim_unit")
      .select(UNIT_SELECT, { count: "exact" })
      .order("code", { ascending })
      .range(offset, offset + pageSize - 1);
    if (pat) query = query.ilike("code", pat);

    const { data, count } = await query;
    const items = (data ?? []).map((u) =>
      normalizeUnit(u as unknown as UnitLike, lang),
    );
    return { items, total: count ?? items.length, page, pageSize };
  } catch (e) {
    logQueryError("units", e);
    return empty;
  }
}

export async function getUnitDetail(opts: {
  lang: string;
  code: string;
}): Promise<UnitDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`etim:unit:${opts.code}`);

  const { lang, code } = opts;
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: head } = await sb
      .from("etim_unit")
      .select("id,code,etim_unit_translation(language,description,abbreviation)")
      .eq("code", code)
      .maybeSingle();
    if (!head) return null;
    const h = head as unknown as {
      id: number;
      code: string;
      etim_unit_translation?: UnitTr[];
    };

    // Classes using this unit (dedupe by class code over a scan window).
    const { data: cfRows } = await sb
      .from("etim_class_feature")
      .select("etim_class!inner(code,etim_class_translation(language,description))")
      .eq("unit_id", h.id)
      .range(0, REVERSE_SCAN - 1);
    const scanSaturated = (cfRows?.length ?? 0) >= REVERSE_SCAN;

    const byClass = new Map<string, { name: string; isFallback: boolean }>();
    for (const row of (cfRows ?? []) as unknown as {
      etim_class?: { code: string; etim_class_translation?: Translation[] } | null;
    }[]) {
      const c = row.etim_class;
      if (!c || byClass.has(c.code)) continue;
      const { value, isFallback } = localize(c.etim_class_translation, lang);
      byClass.set(c.code, { name: value ?? c.code, isFallback });
    }
    const classItems = [...byClass.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, v]) => ({ code, name: v.name, nameIsFallback: v.isFallback }));

    const name = localize(h.etim_unit_translation as Translation[], lang);
    return {
      code: h.code,
      name: name.value ?? h.code,
      nameIsFallback: name.isFallback,
      abbreviation: pickAbbr(h.etim_unit_translation, lang),
      translations: (h.etim_unit_translation ?? [])
        .filter((t) => t.description != null)
        .map((t) => ({
          language: t.language,
          description: t.description as string,
          abbreviation: t.abbreviation,
        }))
        .sort((a, b) => a.language.localeCompare(b.language)),
      classes: {
        items: classItems.slice(0, REVERSE_CAP),
        total: classItems.length,
        cap: REVERSE_CAP,
        approximate: scanSaturated,
      },
    };
  } catch (e) {
    logQueryError("units", e);
    return null;
  }
}
