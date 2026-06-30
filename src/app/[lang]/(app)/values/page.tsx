import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/shared/data-table/table-skeleton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getValueList } from "@/lib/queries/values";
import { DEFAULT_PAGE_SIZE, parseDir, parsePage, parseQuery } from "@/lib/validation";
import { ValuesTable } from "./_components/values-table";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/values">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return { title: dict.values.title };
}

export default async function ValuesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/values">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{dict.values.title}</h1>
      <Suspense fallback={<TableSkeleton />}>
        <ValuesView lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ValuesView({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: PageProps<"/[lang]/values">["searchParams"];
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const dir = parseDir(sp.dir);
  const { items, total, pageSize } = await getValueList({
    lang,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    q: parseQuery(sp.q),
    dir,
  });

  return (
    <ValuesTable
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
