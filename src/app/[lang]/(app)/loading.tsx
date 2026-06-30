import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/data-table/table-skeleton";

/** Route-transition fallback for the app section. */
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <TableSkeleton />
    </div>
  );
}
