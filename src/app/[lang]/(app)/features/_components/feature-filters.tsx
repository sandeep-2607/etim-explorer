"use client";

import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUrlState } from "@/hooks/use-url-state";
import { useDictionary } from "@/contexts/dictionary-context";
import type { FeatureType, FilterOption } from "@/lib/types/etim";

const TYPES: FeatureType[] = ["Numeric", "Alphanumeric", "Logical", "Range"];

export function FeatureFilters({ groupOptions }: { groupOptions: FilterOption[] }) {
  const dict = useDictionary();
  const setUrl = useUrlState();
  const sp = useSearchParams();
  const activeType = sp.get("type");
  const activeGroup = sp.get("group") ?? "";
  const hasFilters = Boolean(activeType || activeGroup);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setUrl({ type: null, page: null })}
        className={cn(
          "cursor-pointer",
          !activeType ? "" : "opacity-70 hover:opacity-100",
        )}
      >
        <Badge variant={!activeType ? "default" : "outline"}>{dict.common.all}</Badge>
      </button>
      {TYPES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setUrl({ type: t, page: null })}
          className="cursor-pointer"
        >
          <Badge variant={activeType === t ? "default" : "outline"}>{t}</Badge>
        </button>
      ))}

      <Select
        value={activeGroup}
        onValueChange={(v) => setUrl({ group: v || null, page: null })}
      >
        <SelectTrigger size="sm" className="w-[220px]">
          <SelectValue placeholder={dict.features.filter_group} />
        </SelectTrigger>
        <SelectContent>
          {groupOptions.map((g) => (
            <SelectItem key={g.code} value={g.code}>
              {g.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUrl({ type: null, group: null, page: null })}
        >
          {dict.common.clear_filters}
        </Button>
      )}
    </div>
  );
}
