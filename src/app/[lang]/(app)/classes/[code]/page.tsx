import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeCodeBadge } from "@/components/etim/change-code-badge";
import { FeatureTypeBadge } from "@/components/etim/feature-type-badge";
import { DetailHeader } from "@/components/etim/detail-header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getClassDetail } from "@/lib/queries/classes";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/classes/[code]">): Promise<Metadata> {
  const { lang, code } = await params;
  const cls = await getClassDetail({ lang, code });
  return { title: cls ? `${cls.name} (${cls.code})` : code };
}

export default function ClassDetailPage({
  params,
}: PageProps<"/[lang]/classes/[code]">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ClassDetailView params={params} />
    </Suspense>
  );
}

async function ClassDetailView({
  params,
}: {
  params: PageProps<"/[lang]/classes/[code]">["params"];
}) {
  const { lang, code } = await params;
  const [dict, cls] = await Promise.all([
    getDictionary(lang),
    getClassDetail({ lang, code }),
  ]);
  if (!cls) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        code={cls.code}
        name={cls.name}
        nameIsFallback={cls.nameIsFallback}
        fallbackLabel={dict.common.fallback}
        fallbackHint={dict.common.fallback_hint}
        badges={<ChangeCodeBadge code={cls.changeCode} />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">Version</dt>
              <dd>ETIM {cls.version}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{cls.status}</dd>
              <dt className="text-muted-foreground">{dict.classes.col_change}</dt>
              <dd>{cls.changeCode ?? "—"}</dd>
              <dt className="text-muted-foreground">{dict.nav.groups}</dt>
              <dd>
                <Link
                  href={`/${lang}/groups/${cls.groupCode}`}
                  className="hover:underline"
                >
                  <span className="font-mono text-xs">{cls.groupCode}</span>
                  {cls.groupName ? ` · ${cls.groupName}` : ""}
                </Link>
              </dd>
              <dt className="text-muted-foreground">Mutation</dt>
              <dd>{cls.mutationDate ?? "—"}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Translations</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[80px_1fr] gap-y-1.5 text-sm">
              {cls.translations.map((t) => (
                <FragmentRow key={t.language} k={t.language} v={t.description} />
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      {cls.synonyms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Synonyms</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {cls.synonyms.join(" · ")}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {dict.classes.col_features} ({cls.features.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-right">#</TableHead>
                <TableHead>{dict.classes.col_name}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>{dict.nav.values}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cls.features.map((f) => (
                <TableRow key={f.featureCode}>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {f.orderNumber}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{f.featureName}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      {f.featureCode}
                    </span>
                  </TableCell>
                  <TableCell>
                    <FeatureTypeBadge type={f.featureType} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.unitAbbr ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-md text-sm text-muted-foreground">
                    {f.values.length > 0 ? f.values.join(" · ") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FragmentRow({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="font-mono text-xs text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </>
  );
}
