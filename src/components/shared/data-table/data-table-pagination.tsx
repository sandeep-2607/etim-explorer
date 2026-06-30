"use client";

import { Button } from "@/components/ui/button";
import { useUrlState } from "@/hooks/use-url-state";

/** Reusable server-driven pagination — updates `?page` in the URL. */
export function DataTablePagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const setUrl = useUrlState();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground tabular-nums">
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setUrl({ page: page - 1 > 1 ? page - 1 : null })}
        >
          Prev
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setUrl({ page: page + 1 })}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
