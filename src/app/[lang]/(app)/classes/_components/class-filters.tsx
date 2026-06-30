"use client";

import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUrlState } from "@/hooks/use-url-state";
import { useDictionary } from "@/contexts/dictionary-context";
import type { ChangeCode } from "@/lib/types/etim";

const CHANGE_CODES: ChangeCode[] = ["New", "Changed", "Deleted", "Unchanged"];

const STYLE: Record<ChangeCode, string> = {
  New: "bg-cc-new text-cc-new-foreground",
  Changed: "bg-cc-changed text-cc-changed-foreground",
  Deleted: "bg-cc-deleted text-cc-deleted-foreground",
  Unchanged: "bg-cc-unchanged text-cc-unchanged-foreground",
};

/** Change-code filter chips for the classes list (?cc=). */
export function ClassFilters() {
  const dict = useDictionary();
  const setUrl = useUrlState();
  const sp = useSearchParams();
  const active = sp.get("cc");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{dict.classes.col_change}:</span>
      <button
        type="button"
        onClick={() => setUrl({ cc: null, page: null })}
        className="cursor-pointer"
      >
        <Badge variant={!active ? "default" : "outline"}>{dict.common.all}</Badge>
      </button>
      {CHANGE_CODES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setUrl({ cc: c, page: null })}
          className="cursor-pointer"
        >
          <Badge
            variant="outline"
            className={cn(
              "border-transparent font-medium",
              active === c ? STYLE[c] : "text-muted-foreground",
            )}
          >
            {c}
          </Badge>
        </button>
      ))}
      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUrl({ cc: null, page: null })}
        >
          {dict.common.clear_filters}
        </Button>
      )}
    </div>
  );
}
