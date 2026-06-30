import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChangeCode } from "@/lib/types/etim";

const STYLES: Record<ChangeCode, string> = {
  New: "bg-cc-new text-cc-new-foreground",
  Changed: "bg-cc-changed text-cc-changed-foreground",
  Deleted: "bg-cc-deleted text-cc-deleted-foreground",
  Unchanged: "bg-cc-unchanged text-cc-unchanged-foreground",
};

export function ChangeCodeBadge({ code }: { code: ChangeCode | null }) {
  if (!code) return null;
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent font-medium", STYLES[code])}
    >
      {code}
    </Badge>
  );
}
