import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader } from "@/components/etim/detail-header";
import { TranslationsCard } from "@/components/etim/translations-card";
import { EntityRefList } from "@/components/etim/entity-ref-list";
import { FeatureTypeBadge } from "@/components/etim/feature-type-badge";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getFeatureDetail } from "@/lib/queries/features";
import { cappedLabel } from "@/lib/i18n/format";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/features/[code]">): Promise<Metadata> {
  const { lang, code } = await params;
  const f = await getFeatureDetail({ lang, code });
  return { title: f ? `${f.name} (${f.code})` : code };
}

export default function FeatureDetailPage({
  params,
}: PageProps<"/[lang]/features/[code]">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <FeatureDetailView params={params} />
    </Suspense>
  );
}

async function FeatureDetailView({
  params,
}: {
  params: PageProps<"/[lang]/features/[code]">["params"];
}) {
  const { lang, code } = await params;
  const [dict, f] = await Promise.all([
    getDictionary(lang),
    getFeatureDetail({ lang, code }),
  ]);
  if (!f) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        code={f.code}
        name={f.name}
        nameIsFallback={f.nameIsFallback}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
        badges={<FeatureTypeBadge type={f.type} />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{dict.features.col_type}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">{dict.features.col_type}</dt>
              <dd>{f.type}</dd>
              <dt className="text-muted-foreground">{dict.features.col_group}</dt>
              <dd>
                <span className="font-mono text-xs">{f.featureGroupCode}</span>
                {f.featureGroupName ? ` · ${f.featureGroupName}` : ""}
              </dd>
            </dl>
          </CardContent>
        </Card>
        <TranslationsCard title={dict.common.translations} translations={f.translations} />
      </div>

      <EntityRefList
        title={dict.features.used_by}
        list={f.classes}
        hrefBase={`/${lang}/classes`}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
        emptyLabel={dict.common.no_results}
        cappedLabel={cappedLabel(f.classes, dict.common.showing_capped)}
      />
    </div>
  );
}
