"use client";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/contexts/dictionary-context";

/** Error boundary for the app section. Localized; offers a retry. */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  const dict = useDictionary();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-lg font-medium">{dict.common.error_title}</p>
      <Button variant="outline" onClick={reset}>
        {dict.common.retry}
      </Button>
    </div>
  );
}
