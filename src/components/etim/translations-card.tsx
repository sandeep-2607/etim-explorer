import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Reusable card listing an entity's translations (language → text). */
export function TranslationsCard({
  title,
  translations,
}: {
  title: string;
  translations: { language: string; description: string }[];
}) {
  if (translations.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[80px_1fr] gap-y-1.5 text-sm">
          {translations.map((t) => (
            <div key={t.language} className="contents">
              <dt className="font-mono text-xs text-muted-foreground">{t.language}</dt>
              <dd>{t.description}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
