import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getStats } from "@/lib/queries/stats";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const [dict, stats] = await Promise.all([getDictionary(lang), getStats()]);

  const fmt = (n: number) => n.toLocaleString(lang === "EN" ? "en" : lang);

  const statItems = [
    { label: dict.stats.classes, value: stats.classes, href: `/${lang}/classes` },
    { label: dict.stats.features, value: stats.features, href: `/${lang}/features` },
    { label: dict.stats.values, value: stats.values, href: `/${lang}/values` },
    { label: dict.stats.units, value: stats.units, href: `/${lang}/units` },
    { label: dict.stats.groups, value: stats.groups, href: `/${lang}/groups` },
    { label: dict.stats.synonyms, value: stats.synonyms, href: `/${lang}/classes` },
    { label: dict.stats.languages, value: stats.languages, href: `/${lang}` },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3 py-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {dict.home.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{dict.home.subtitle}</p>
        <div className="pt-2">
          <Link
            href={`/${lang}/classes`}
            className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {dict.home.browse_classes}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {statItems.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="p-4">
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {fmt(s.value)}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
