/** Reusable detail-page header: code + localized name + fallback tag + badges.
 * (Navigation context is provided by the breadcrumb in the app header.) */
export function DetailHeader({
  code,
  name,
  nameIsFallback,
  fallbackLabel,
  fallbackHint,
  badges,
}: {
  code: string;
  name: string;
  nameIsFallback: boolean;
  fallbackLabel: string;
  fallbackHint: string;
  badges?: React.ReactNode;
}) {
  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-muted-foreground">{code}</span>
        {badges}
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        {name}
        {nameIsFallback && (
          <span
            className="ml-2 align-middle text-xs font-normal text-muted-foreground"
            title={fallbackHint}
          >
            {fallbackLabel}
          </span>
        )}
      </h1>
    </header>
  );
}
