import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/db/client/server";
import { logQueryError } from "@/lib/queries/_log";
import { localize, type Translation } from "@/lib/i18n/localize";
import type { GroupDetail, GroupListItem, Paged } from "@/lib/types/etim";

/**
 * Group queries over Supabase REST (etim_core). Only 170 groups exist, so the
 * list is fetched whole and sorted/paged in JS (PostgREST can't order by an
 * embedded aggregate like class count). Classes-in-group is served by
 * `getClassList({ group })` so the Classes data-table is reused.
 */

export type GroupSort = "code" | "classes";

type GroupLike = {
  code: string;
  etim_group_translation?: Translation[];
  etim_class?: { count: number }[];
};

export async function getGroupList(opts: {
  lang: string;
  page: number;
  pageSize: number;
  q?: string;
  sort?: GroupSort;
  dir?: "asc" | "desc";
}): Promise<Paged<GroupListItem>> {
  "use cache";
  cacheLife("days");
  cacheTag("etim:groups");

  const { lang, page, pageSize, q, sort = "code", dir = "asc" } = opts;
  const empty: Paged<GroupListItem> = { items: [], total: 0, page, pageSize };
  const sb = getSupabase();
  if (!sb) return empty;

  const SCAN = 2000; // groups are tiny (~170); guard against silent truncation
  try {
    const { data } = await sb
      .from("etim_group")
      .select("code,etim_group_translation(language,description),etim_class(count)")
      .order("code")
      .range(0, SCAN - 1);
    if ((data?.length ?? 0) >= SCAN) {
      logQueryError("groups", `group list scan saturated at ${SCAN} rows`);
    }

    let rows: GroupListItem[] = (data ?? []).map((g) => {
      const row = g as unknown as GroupLike;
      const { value, isFallback } = localize(row.etim_group_translation, lang);
      return {
        code: row.code,
        name: value ?? row.code,
        nameIsFallback: isFallback,
        classCount: row.etim_class?.[0]?.count ?? 0,
      };
    });

    const term = q?.trim().toLowerCase();
    if (term) {
      rows = rows.filter(
        (r) =>
          r.code.toLowerCase().includes(term) ||
          r.name.toLowerCase().includes(term),
      );
    }

    const sign = dir === "asc" ? 1 : -1;
    rows.sort((a, b) =>
      sort === "classes"
        ? sign * (a.classCount - b.classCount)
        : sign * a.code.localeCompare(b.code),
    );

    const total = rows.length;
    const start = (page - 1) * pageSize;
    return { items: rows.slice(start, start + pageSize), total, page, pageSize };
  } catch (e) {
    logQueryError("groups", e);
    return empty;
  }
}

export async function getGroupDetail(opts: {
  lang: string;
  code: string;
}): Promise<GroupDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`etim:group:${opts.code}`);

  const { lang, code } = opts;
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data: head } = await sb
      .from("etim_group")
      .select("code,etim_group_translation(language,description)")
      .eq("code", code)
      .maybeSingle();
    if (!head) return null;
    const h = head as unknown as {
      code: string;
      etim_group_translation?: Translation[];
    };

    const name = localize(h.etim_group_translation, lang);
    return {
      code: h.code,
      name: name.value ?? h.code,
      nameIsFallback: name.isFallback,
      translations: (h.etim_group_translation ?? [])
        .filter((t): t is { language: string; description: string } => t.description != null)
        .sort((a, b) => a.language.localeCompare(b.language)),
    };
  } catch (e) {
    logQueryError("groups", e);
    return null;
  }
}
