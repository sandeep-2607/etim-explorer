import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/shared/data-table/table-skeleton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUnitList } from "@/lib/queries/units";
import { DEFAULT_PAGE_SIZE, parseDir, parsePage, parseQuery } from "@/lib/validation";
import { UnitsTable } from "./_components/units-table";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/units">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.units.title };
}

export default async function UnitsPage({
  params,
  searchParams,
}: PageProps<"/[lang]/units">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{dict.units.title}</h1>
      <Suspense fallback={<TableSkeleton />}>
        <UnitsView lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function UnitsView({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: PageProps<"/[lang]/units">["searchParams"];
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const dir = parseDir(sp.dir);
  const { items, total, pageSize } = await getUnitList({
    lang,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    q: parseQuery(sp.q),
    dir,
  });

  return (
    <UnitsTable
      lang={lang}
      rows={items}
      total={total}
      page={page}
      pageSize={pageSize}
      sort="code"
      dir={dir}
    />
  );
}
