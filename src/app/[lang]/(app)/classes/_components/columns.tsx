"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { ClassListItem } from "@/lib/types/etim";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ChangeCodeBadge } from "@/components/etim/change-code-badge";
import { SortableHeader } from "@/components/shared/data-table/data-table-column-header";

export function classColumns({
  lang,
  dict,
  sort,
  dir,
}: {
  lang: string;
  dict: Dictionary;
  sort: string;
  dir: "asc" | "desc";
}): ColumnDef<ClassListItem>[] {
  return [
    {
      accessorKey: "code",
      header: () => (
        <SortableHeader
          title={dict.classes.col_code}
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
      header: () => <span className="px-1">{dict.classes.col_name}</span>,
      cell: ({ row }) => (
        <>
          <Link
            href={`/${lang}/classes/${row.original.code}`}
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
      accessorKey: "changeCode",
      header: () => <span className="px-1">{dict.classes.col_change}</span>,
      cell: ({ row }) => <ChangeCodeBadge code={row.original.changeCode} />,
    },
    {
      accessorKey: "version",
      header: () => (
        <SortableHeader
          title={dict.classes.col_version}
          sortKey="version"
          currentSort={sort}
          currentDir={dir}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.version}</span>
      ),
    },
    {
      accessorKey: "groupCode",
      header: () => <span className="px-1">{dict.classes.col_group}</span>,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.groupCode}
        </span>
      ),
    },
    {
      accessorKey: "featureCount",
      header: () => <span className="px-1">{dict.classes.col_features}</span>,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.featureCount.toLocaleString()}
        </span>
      ),
    },
  ];
}
