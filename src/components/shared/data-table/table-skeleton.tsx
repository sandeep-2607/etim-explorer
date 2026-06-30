import { Skeleton } from "@/components/ui/skeleton";

/** Reusable loading skeleton for list/data-table routes. */
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <div className="rounded-lg border">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b p-3 last:border-0"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
