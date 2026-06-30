import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CappedList } from "@/lib/types/etim";

/**
 * Reusable card rendering a reverse-link list (e.g. "classes using this
 * feature"). Each item links to `${hrefBase}/${code}`; shows a capped note when
 * the true total exceeds what's displayed.
 */
export function EntityRefList({
  title,
  list,
  hrefBase,
  fallbackLabel,
  fallbackHint,
  emptyLabel,
  cappedLabel,
}: {
  title: string;
  list: CappedList;
  hrefBase: string;
  fallbackLabel: string;
  fallbackHint: string;
  emptyLabel: string;
  /** Pre-formatted "Showing first N of M" string, or null when not capped. */
  cappedLabel: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {title}{" "}
          <span className="font-normal text-muted-foreground">
            ({list.total.toLocaleString()})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <>
            <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.items.map((it) => (
                <li key={it.code} className="text-sm">
                  <Link href={`${hrefBase}/${it.code}`} className="hover:underline">
                    <span className="font-mono text-xs text-muted-foreground">
                      {it.code}
                    </span>{" "}
                    {it.name}
                    {it.nameIsFallback && (
                      <span
                        className="ml-1 text-[10px] text-muted-foreground"
                        title={fallbackHint}
                      >
                        {fallbackLabel}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {cappedLabel && (
              <p className="text-xs text-muted-foreground">{cappedLabel}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
