import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/shared/data-table/table-skeleton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getFeatureList, type FeatureSort } from "@/lib/queries/features";
import {
  DEFAULT_PAGE_SIZE,
  parseCode,
  parseDir,
  parseEnum,
  parsePage,
  parseQuery,
  parseSort,
} from "@/lib/validation";
import type { FeatureType } from "@/lib/types/etim";
import { FeatureFiltersLoader } from "./_components/feature-filters-loader";
import { FeaturesTable } from "./_components/features-table";

const SORT_KEYS = ["code", "type"] as const;
const FEATURE_TYPES = ["Numeric", "Alphanumeric", "Logical", "Range"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/features">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.features.title };
}

export default async function FeaturesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/features">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{dict.features.title}</h1>
      <Suspense fallback={<div className="h-9" />}>
        <FeatureFiltersLoader lang={lang} />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <FeaturesView lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FeaturesView({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: PageProps<"/[lang]/features">["searchParams"];
}) {
  const sp = await searchParams;
  const { items, total, pageSize } = await getFeatureList({
    lang,
    page: parsePage(sp.page),
    pageSize: DEFAULT_PAGE_SIZE,
    q: parseQuery(sp.q),
    type: parseEnum<FeatureType>(sp.type, FEATURE_TYPES),
    featureGroup: parseCode(sp.group),
    sort: parseSort(sp.sort, SORT_KEYS) as FeatureSort,
    dir: parseDir(sp.dir),
  });

  return (
    <FeaturesTable
      lang={lang}
      rows={items}
      total={total}
      page={parsePage(sp.page)}
      pageSize={pageSize}
      sort={parseSort(sp.sort, SORT_KEYS)}
      dir={parseDir(sp.dir)}
    />
  );
}
