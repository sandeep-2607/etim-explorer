import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader } from "@/components/etim/detail-header";
import { EntityRefList } from "@/components/etim/entity-ref-list";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUnitDetail } from "@/lib/queries/units";
import { cappedLabel } from "@/lib/i18n/format";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/units/[code]">): Promise<Metadata> {
  const { lang, code } = await params;
  const u = await getUnitDetail({ lang, code });
  return { title: u ? `${u.name} (${u.code})` : code };
}

export default function UnitDetailPage({
  params,
}: PageProps<"/[lang]/units/[code]">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <UnitDetailView params={params} />
    </Suspense>
  );
}

async function UnitDetailView({
  params,
}: {
  params: PageProps<"/[lang]/units/[code]">["params"];
}) {
  const { lang, code } = await params;
  const [dict, u] = await Promise.all([
    getDictionary(lang),
    getUnitDetail({ lang, code }),
  ]);
  if (!u) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        code={u.code}
        name={u.name}
        nameIsFallback={u.nameIsFallback}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
        badges={
          u.abbreviation ? (
            <Badge variant="secondary" className="font-mono">
              {u.abbreviation}
            </Badge>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{dict.common.translations}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[80px_1fr_auto] gap-x-4 gap-y-1.5 text-sm">
            {u.translations.map((t) => (
              <div key={t.language} className="contents">
                <dt className="font-mono text-xs text-muted-foreground">{t.language}</dt>
                <dd>{t.description}</dd>
                <dd className="text-muted-foreground">{t.abbreviation ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <EntityRefList
        title={dict.units.used_by}
        list={u.classes}
        hrefBase={`/${lang}/classes`}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
        emptyLabel={dict.common.no_results}
        cappedLabel={cappedLabel(
          u.classes,
          dict.common.showing_capped,
          dict.common.showing_more,
        )}
      />
    </div>
  );
}
