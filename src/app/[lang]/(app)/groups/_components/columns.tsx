"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { GroupListItem } from "@/lib/types/etim";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { SortableHeader } from "@/components/shared/data-table/data-table-column-header";

export function groupColumns({
  lang,
  dict,
  sort,
  dir,
}: {
  lang: string;
  dict: Dictionary;
  sort: string;
  dir: "asc" | "desc";
}): ColumnDef<GroupListItem>[] {
  return [
    {
      accessorKey: "code",
      header: () => (
        <SortableHeader
          title={dict.groups.col_code}
          sortKey="code"
          currentSort={sort}
          currentDir={dir}
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: () => <span className="px-1">{dict.groups.col_name}</span>,
      cell: ({ row }) => (
        <>
          <Link
            href={`/${lang}/groups/${row.original.code}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          {row.original.nameIsFallback && (
            <span
              className="ml-2 align-middle text-[10px] text-muted-foreground"
              title={dict.common.fallback_hint}
            >
              {dict.common.fallback}
            </span>
          )}
        </>
      ),
    },
    {
      accessorKey: "classCount",
      header: () => (
        <SortableHeader
          title={dict.groups.col_classes}
          sortKey="classes"
          currentSort={sort}
          currentDir={dir}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.classCount.toLocaleString()}
        </span>
      ),
    },
  ];
}
