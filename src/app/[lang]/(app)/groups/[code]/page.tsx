import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader } from "@/components/etim/detail-header";
import { TranslationsCard } from "@/components/etim/translations-card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getGroupDetail } from "@/lib/queries/groups";
import { getClassList, type ClassSort } from "@/lib/queries/classes";
import { DEFAULT_PAGE_SIZE, parseDir, parsePage, parseSort } from "@/lib/validation";
import { ClassesTable } from "../../classes/_components/classes-table";

const CLASS_SORT_KEYS = ["code", "version"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/groups/[code]">): Promise<Metadata> {
  const { lang, code } = await params;
  const g = await getGroupDetail({ lang, code });
  return { title: g ? `${g.name} (${g.code})` : code };
}

export default function GroupDetailPage({
  params,
  searchParams,
}: PageProps<"/[lang]/groups/[code]">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <GroupDetailView params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function GroupDetailView({
  params,
  searchParams,
}: {
  params: PageProps<"/[lang]/groups/[code]">["params"];
  searchParams: PageProps<"/[lang]/groups/[code]">["searchParams"];
}) {
  const { lang, code } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort, CLASS_SORT_KEYS);
  const dir = parseDir(sp.dir);

  const [dict, g, classes] = await Promise.all([
    getDictionary(lang),
    getGroupDetail({ lang, code }),
    getClassList({
      lang,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      group: code,
      sort: sort as ClassSort,
      dir,
    }),
  ]);
  if (!g) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        code={g.code}
        name={g.name}
        nameIsFallback={g.nameIsFallback}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
      />

      <TranslationsCard title={dict.common.translations} translations={g.translations} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {dict.groups.classes_in_group}{" "}
            <span className="font-normal text-muted-foreground">
              ({classes.total.toLocaleString()})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClassesTable
            lang={lang}
            rows={classes.items}
            total={classes.total}
            page={page}
            pageSize={classes.pageSize}
            sort={sort}
            dir={dir}
          />
        </CardContent>
      </Card>
    </div>
  );
}
