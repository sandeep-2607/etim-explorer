import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader } from "@/components/etim/detail-header";
import { TranslationsCard } from "@/components/etim/translations-card";
import { EntityRefList } from "@/components/etim/entity-ref-list";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getValueDetail } from "@/lib/queries/values";
import { cappedLabel } from "@/lib/i18n/format";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/values/[code]">): Promise<Metadata> {
  const { lang, code } = await params;
  const v = await getValueDetail({ lang, code });
  return { title: v ? `${v.name} (${v.code})` : code };
}

export default function ValueDetailPage({
  params,
}: PageProps<"/[lang]/values/[code]">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ValueDetailView params={params} />
    </Suspense>
  );
}

async function ValueDetailView({
  params,
}: {
  params: PageProps<"/[lang]/values/[code]">["params"];
}) {
  const { lang, code } = await params;
  const [dict, v] = await Promise.all([
    getDictionary(lang),
    getValueDetail({ lang, code }),
  ]);
  if (!v) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        code={v.code}
        name={v.name}
        nameIsFallback={v.nameIsFallback}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
      />

      <TranslationsCard title={dict.common.translations} translations={v.translations} />

      <EntityRefList
        title={dict.values.used_by}
        list={v.features}
        hrefBase={`/${lang}/features`}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
        emptyLabel={dict.common.no_results}
        cappedLabel={cappedLabel(
          v.features,
          dict.common.showing_capped,
          dict.common.showing_more,
        )}
      />
    </div>
  );
}
