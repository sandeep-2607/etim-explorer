"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { FeatureListItem } from "@/lib/types/etim";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { FeatureTypeBadge } from "@/components/etim/feature-type-badge";
import { SortableHeader } from "@/components/shared/data-table/data-table-column-header";

export function featureColumns({
  lang,
  dict,
  sort,
  dir,
}: {
  lang: string;
  dict: Dictionary;
  sort: string;
  dir: "asc" | "desc";
}): ColumnDef<FeatureListItem>[] {
  return [
    {
      accessorKey: "code",
      header: () => (
        <SortableHeader
          title={dict.features.col_code}
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
      header: () => <span className="px-1">{dict.features.col_name}</span>,
      cell: ({ row }) => (
        <>
          <Link
            href={`/${lang}/features/${row.original.code}`}
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
      accessorKey: "type",
      header: () => (
        <SortableHeader
          title={dict.features.col_type}
          sortKey="type"
          currentSort={sort}
          currentDir={dir}
        />
      ),
      cell: ({ row }) => <FeatureTypeBadge type={row.original.type} />,
    },
    {
      accessorKey: "featureGroupCode",
      header: () => <span className="px-1">{dict.features.col_group}</span>,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          <span className="font-mono text-xs">{row.original.featureGroupCode}</span>
          {row.original.featureGroupName ? ` · ${row.original.featureGroupName}` : ""}
        </span>
      ),
    },
  ];
}
