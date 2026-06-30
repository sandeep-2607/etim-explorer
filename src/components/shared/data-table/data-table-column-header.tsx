"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrlState } from "@/hooks/use-url-state";

/** Reusable sortable column header — toggles `?sort`/`?dir` in the URL. */
export function SortableHeader({
  title,
  sortKey,
  currentSort,
  currentDir,
  className,
}: {
  title: string;
  sortKey: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  className?: string;
}) {
  const setUrl = useUrlState();
  const active = currentSort === sortKey;
  const nextDir = active && currentDir === "asc" ? "desc" : "asc";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className ?? "-ml-2 h-7 gap-1 data-[active=true]:text-foreground"}
      data-active={active}
      onClick={() => setUrl({ sort: sortKey, dir: nextDir, page: null })}
    >
      {title}
      {active ? (
        currentDir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-50" />
      )}
    </Button>
  );
}
