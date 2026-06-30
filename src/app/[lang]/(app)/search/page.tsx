import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/shared/data-table/table-skeleton";
import { EntityRefList } from "@/components/etim/entity-ref-list";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { searchAll, type SearchGroupKey } from "@/lib/queries/search";
import { cappedLabel } from "@/lib/i18n/format";
import { parseQuery } from "@/lib/validation";

const CAP = 20;

function groupLabel(key: SearchGroupKey, dict: Dictionary): string {
  switch (key) {
    case "classes":
      return dict.nav.classes;
    case "features":
      return dict.nav.features;
    case "values":
      return dict.nav.values;
    case "units":
      return dict.nav.units;
    case "groups":
      return dict.nav.groups;
    case "synonyms":
      return dict.search.synonyms;
  }
}

function groupHref(key: SearchGroupKey, lang: string): string {
  // Synonym matches link to the class detail.
  const seg = key === "synonyms" ? "classes" : key;
  return `/${lang}/${seg}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.search.title };
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{dict.search.title}</h1>
      <Suspense fallback={<TableSkeleton />}>
        <SearchResults lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResults({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: PageProps<"/[lang]/search">["searchParams"];
}) {
  const sp = await searchParams;
  const q = parseQuery(sp.q);
  const dict = await getDictionary(lang);

  if (!q) {
    return (
      <p className="py-16 text-center text-muted-foreground">{dict.search.prompt}</p>
    );
  }

  const { groups } = await searchAll({ lang, q });
  const visible = groups.filter((g) => g.items.length > 0);

  if (visible.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        {dict.common.no_results}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {dict.search.results_for.replace("{q}", q)}
      </p>
      {visible.map((g) => {
        const list = {
          items: g.items,
          total: g.total,
          cap: CAP,
          approximate: g.approximate,
        };
        return (
        <EntityRefList
          key={g.key}
          title={groupLabel(g.key, dict)}
          list={list}
          hrefBase={groupHref(g.key, lang)}
          fallbackLabel={dict.common.fallback}
          fallbackHint={dict.common.fallback_hint}
          emptyLabel={dict.common.no_results}
          cappedLabel={cappedLabel(
            list,
            dict.common.showing_capped,
            dict.common.showing_more,
          )}
        />
        );
      })}
    </div>
  );
}
