"use client";

import { useDictionary } from "@/contexts/dictionary-context";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import type { ValueListItem } from "@/lib/types/etim";
import { valueColumns } from "./columns";

export function ValuesTable({
  lang,
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
}: {
  lang: string;
  rows: ValueListItem[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
}) {
  const dict = useDictionary();
  const columns = valueColumns({ lang, dict, sort, dir });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {dict.common.results_count.replace("{count}", total.toLocaleString())}
      </p>
      <DataTable columns={columns} data={rows} emptyMessage={dict.common.no_results} />
      <DataTablePagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
