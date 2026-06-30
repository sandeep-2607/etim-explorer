import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/shared/data-table/table-skeleton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getClassList, type ClassSort } from "@/lib/queries/classes";
import type { ChangeCode } from "@/lib/types/etim";
import {
  DEFAULT_PAGE_SIZE,
  parseDir,
  parseEnum,
  parsePage,
  parseQuery,
  parseSort,
} from "@/lib/validation";
import { ClassFilters } from "./_components/class-filters";
import { ClassesTable } from "./_components/classes-table";

const SORT_KEYS = ["code", "version"] as const;
const CHANGE_CODES = ["New", "Changed", "Deleted", "Unchanged"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/classes">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.classes.title };
}

export default async function ClassesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/classes">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{dict.classes.title}</h1>
      <Suspense fallback={<div className="h-8" />}>
        <ClassFilters />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <ClassesView lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ClassesView({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: PageProps<"/[lang]/classes">["searchParams"];
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = parseQuery(sp.q);
  const sort = parseSort(sp.sort, SORT_KEYS) as ClassSort;
  const dir = parseDir(sp.dir);
  const changeCode = parseEnum<ChangeCode>(sp.cc, CHANGE_CODES);

  const { items, total, pageSize } = await getClassList({
    lang,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    q,
    changeCode,
    sort,
    dir,
  });

  return (
    <ClassesTable
      lang={lang}
      rows={items}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      dir={dir}
    />
  );
}
