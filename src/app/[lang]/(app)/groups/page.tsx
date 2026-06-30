import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/shared/data-table/table-skeleton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getGroupList, type GroupSort } from "@/lib/queries/groups";
import { DEFAULT_PAGE_SIZE, parseDir, parsePage, parseQuery, parseSort } from "@/lib/validation";
import { GroupsTable } from "./_components/groups-table";

const SORT_KEYS = ["code", "classes"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/groups">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.groups.title };
}

export default async function GroupsPage({
  params,
  searchParams,
}: PageProps<"/[lang]/groups">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{dict.groups.title}</h1>
      <Suspense fallback={<TableSkeleton />}>
        <GroupsView lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function GroupsView({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: PageProps<"/[lang]/groups">["searchParams"];
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort, SORT_KEYS);
  const dir = parseDir(sp.dir);
  const { items, total, pageSize } = await getGroupList({
    lang,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    q: parseQuery(sp.q),
    sort: sort as GroupSort,
    dir,
  });

  return (
    <GroupsTable
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
