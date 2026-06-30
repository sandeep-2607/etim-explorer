import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeatureType } from "@/lib/types/etim";

const STYLES: Record<FeatureType, string> = {
  Numeric: "text-ft-numeric border-ft-numeric/40",
  Alphanumeric: "text-ft-alphanumeric border-ft-alphanumeric/40",
  Logical: "text-ft-logical border-ft-logical/40",
  Range: "text-ft-range border-ft-range/40",
};

export function FeatureTypeBadge({ type }: { type: FeatureType }) {
  return (
    <Badge variant="outline" className={cn("font-normal", STYLES[type])}>
      {type}
    </Badge>
  );
}
